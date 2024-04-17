/*
Copyright 2024.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package controller

import (
	"context"
	"fmt"
	"time"

	"github.com/go-logr/logr"
	serverUtil "github.com/streamdal/streamdal/apps/server/util"
	"github.com/streamdal/streamdal/libs/protos/build/go/protos"
	"google.golang.org/grpc/metadata"
	"google.golang.org/protobuf/encoding/protojson"
	"google.golang.org/protobuf/proto"
	v1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/errors"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/client-go/tools/record"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/log"

	crdv1 "github.com/streamdal/streamdal/apps/operator/api/v1"
	"github.com/streamdal/streamdal/apps/operator/util"
	"github.com/streamdal/streamdal/apps/operator/validate"
)

const (
	FinalizerName = "streamdal.com/finalizer"
	CreatedBy     = "streamdal-operator"

	ReconcileActionCreate ReconcileAction = "create" // Create covers both "create" and "update"
	ReconcileActionDelete ReconcileAction = "delete"

	ResourceTypeAudience     ResourceType = "audience"
	ResourceTypeNotification ResourceType = "notification"
	ResourceTypeWasmModule   ResourceType = "wasm"
	ResourceTypePipeline     ResourceType = "pipeline"
)

// StreamdalConfigReconciler reconciles a StreamdalConfig object
type StreamdalConfigReconciler struct {
	client.Client
	Scheme   *runtime.Scheme
	Recorder record.EventRecorder

	// Used by periodic reconciler to detect shutdown
	ShutdownCtx context.Context
}

type ReconcileRequest struct {
	Action ReconcileAction
	Config *crdv1.StreamdalConfig
	Client protos.ExternalClient
}

type ReconcileAction string
type ResourceType string

type HandleFunc struct {
	Resource ResourceType
	Function func(ctx context.Context, rr *ReconcileRequest, cfg *protos.Config) (*HandleStatus, error)
}

type HandleStatus struct {
	Resource   ResourceType
	Action     ReconcileAction
	NumCreated int
	NumUpdated int
	NumDeleted int
}

//+kubebuilder:rbac:groups=crd.streamdal.com,resources=streamdalconfigs,verbs=get;list;watch;create;update;patch;delete
//+kubebuilder:rbac:groups=crd.streamdal.com,resources=streamdalconfigs/status,verbs=get;update;patch
//+kubebuilder:rbac:groups=crd.streamdal.com,resources=streamdalconfigs/finalizers,verbs=update

// Reconcile is part of the main kubernetes reconciliation loop which aims to
// move the current state of the cluster closer to the desired state.
// TODO(user): Modify the Reconcile function to compare the state specified by
// the StreamdalConfig object against the actual cluster state, and then
// perform operations to make the cluster state reflect the state specified by
// the user.
//
// For more details, check Reconcile and its Result here:
// - https://pkg.go.dev/sigs.k8s.io/controller-runtime@v0.17.2/pkg/reconcile
func (r *StreamdalConfigReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
	llog := log.FromContext(ctx).WithValues(
		"method", "Reconcile",
		"namespace", req.Namespace,
		"name", req.Name,
	)

	llog.Info("Received reconcile request")

	rr, err := r.setupReconcileAction(ctx, &req, &llog)
	if err != nil {
		if errors.IsNotFound(err) {
			llog.Info("Resource not found - nothing to do - object is probably deleted")
			return ctrl.Result{}, nil
		}

		llog.Error(err, "Failed to complete reconcile setup (won't retry)")

		// The only reason that we wouldn't have a ReconcileRequest with a Config
		// object is if setupReconcileAction has a bug and didn't return one.
		if rr != nil && rr.Config != nil {
			if errors.IsInvalid(err) {
				r.Recorder.Event(rr.Config, v1.EventTypeWarning, "CR validation error (won't retry)", err.Error())
			} else {
				r.Recorder.Event(rr.Config, v1.EventTypeWarning, "Reconciliation setup error (won't retry)", err.Error())
			}

			// TODO: Can't get status to come through "k describe streamdalconfig <name>" - why?
			//rr.Config.Status.Fatal = true
			//rr.Config.Status.Status = "error"
			//rr.Config.Status.Message = "Failed to complete reconcile setup. Error: " + err.Error()
			//
			//if err := r.Update(ctx, rr.Config); err != nil {
			//	llog.Error(err, "unable to update StreamdalConfig status")
			//}
		}

		// NOTE: Have to return a nil error because k8s considers a non-nil
		// error as a transient error and will keep re-queueing the request.
		return ctrl.Result{}, nil
	}

	result, err := r.handleResources(ctx, rr)
	if err != nil {
		// TODO: llog.Error() should probably be llog.Info() in most cases because
		// k8s errors are _really_ loud.
		llog.Error(err, "Failed to complete reconcile action", "action", rr.Action)
		r.Recorder.Event(rr.Config, v1.EventTypeWarning, "Handle resources error", err.Error())

		// TODO: Should differentiate between a transient error and a non-transient
		// error so that we can requeue appropriately.
		return ctrl.Result{}, nil
	}

	var (
		action string
	)

	switch rr.Action {
	case ReconcileActionCreate:
		err = r.addFinalizer(ctx, rr)
		action = "add"
	case ReconcileActionDelete:
		err = r.removeFinalizer(ctx, rr)
		action = "remove"
	}

	if err != nil {
		llog.Error(err, fmt.Sprintf("Failed to %s finalizer", action))
		r.Recorder.Event(rr.Config, v1.EventTypeWarning, fmt.Sprintf("Finalizer '%s' error", action), err.Error())

		return ctrl.Result{}, nil
	}

	llog.Info("Reconcile action completed", "action", rr.Action)

	return result, nil
}

func (r *StreamdalConfigReconciler) removeFinalizer(ctx context.Context, rr *ReconcileRequest) error {
	llog := log.Log.WithValues("method", "removeFinalizer")
	llog.Info("Removing finalizer")

	// Don't remove finalizer if it doesn't exist
	finalizers := rr.Config.GetFinalizers()

	for i, f := range finalizers {
		// Go through all finalizers in case there are dupes
		if f == FinalizerName {
			rr.Config.Finalizers = append(finalizers[:i], finalizers[i+1:]...)
		}
	}

	if err := r.Update(ctx, rr.Config); err != nil {
		return fmt.Errorf("failed to update CR without finalizer: %s", err)
	}

	return nil
}

func (r *StreamdalConfigReconciler) addFinalizer(ctx context.Context, rr *ReconcileRequest) error {
	llog := log.Log.WithValues("method", "addFinalizer")
	llog.Info("Adding finalizer")

	// Don't add finalizer if it already exists
	for _, f := range rr.Config.GetFinalizers() {
		if f == FinalizerName {
			llog.Info("Finalizer already exists, nothing to do")
			return nil
		}
	}

	rr.Config.Finalizers = append(rr.Config.Finalizers, FinalizerName)

	if err := r.Update(ctx, rr.Config); err != nil {
		return fmt.Errorf("failed to update CR with finalizer: %s", err)
	}

	return nil
}

// SetupWithManager sets up the controller with the Manager.
func (r *StreamdalConfigReconciler) SetupWithManager(mgr ctrl.Manager) error {
	// Launch periodic reconciler
	llog := log.Log.WithValues("method", "SetupWithManager")
	llog.Info("Starting periodic reconciler")

	r.Recorder = mgr.GetEventRecorderFor("streamdal-operator")

	go r.runPeriodicReconciler()

	return ctrl.NewControllerManagedBy(mgr).
		For(&crdv1.StreamdalConfig{}).
		Complete(r)
}

// handleResources is a helper that will iterate over all resources in the CR
// and execute the appropriate handler method for each resource type.
//
// If deleteResource is false, the resource will be created or updated; if
// deleteResource is true, the resource will be deleted.
func (r *StreamdalConfigReconciler) handleResources(ctx context.Context, rr *ReconcileRequest) (ctrl.Result, error) {
	llog := log.Log.WithValues("method", "handleResources")
	llog.Info("Handling resource in streamdal server", "action", rr.Action)

	for _, cfgItem := range rr.Config.Spec.Configs {
		// Attempt to load config in CR
		protosCfg := &protos.Config{}
		if err := protojson.Unmarshal([]byte(cfgItem.Config), protosCfg); err != nil {
			return ctrl.Result{}, fmt.Errorf("failed to unmarshal config '%s': %s", cfgItem.Name, err)
		}

		if err := validate.StreamdalProtosConfig(protosCfg); err != nil {
			llog.Error(err, fmt.Sprintf("Failed to validate streamdal JSON config '%s'", cfgItem.Name))
			return ctrl.Result{}, err
		}

		// NOTE: Pipelines should be handled last as they will reference other resources

		handleFuncs := []HandleFunc{
			{
				Resource: ResourceTypeAudience,
				Function: r.handleAudiences,
			},
			{
				Resource: ResourceTypeNotification,
				Function: r.handleNotifications,
			},

			// Punting on support for wasm modules for now ~DS 04.16.2024
			//{
			//	Resource:     "wasm module(s)",
			//	Function: r.handleWasmModules,
			//},

			{
				Resource: ResourceTypePipeline,
				Function: r.handlePipelines,
			},
		}

		for _, f := range handleFuncs {
			llog.Info("Running handle function", "resource", f.Resource)
			status, err := f.Function(ctx, rr, protosCfg)
			if err != nil {
				return ctrl.Result{}, fmt.Errorf("failed to handle resource '%s': %s", f.Resource, err)
			}

			llog.Info("Handle function completed", "resource", f.Resource, "numCreated", status.NumCreated, "numUpdated", status.NumUpdated)
		}
	}

	return ctrl.Result{}, nil
}

// handleAudiences will either create or delete audiences in the streamdal server.
//
// NOTE: An audience can only be created or deleted - it cannot be updated.
// This is because the resource itself consists of 4 required fields - it either
// exists or doesn't.
func (r *StreamdalConfigReconciler) handleAudiences(ctx context.Context, rr *ReconcileRequest, cfg *protos.Config) (*HandleStatus, error) {
	llog := log.Log.WithValues("method", "handleAudiences", "action", rr.Action)
	llog.Info("Handling audiences", "numAudiences", len(cfg.Audiences))

	if len(cfg.Audiences) == 0 {
		llog.Info("No audiences to handle")
		return &HandleStatus{
			Resource: "audience",
		}, nil
	}

	outgoingCtx := metadata.NewOutgoingContext(ctx, metadata.Pairs(util.AuthTokenMetadata, rr.Config.Spec.ServerAuth))

	cfgResp, err := rr.Client.GetConfig(outgoingCtx, &protos.GetConfigRequest{})
	if err != nil {
		return nil, fmt.Errorf("failed to get config: %s", err)
	}

	if cfgResp == nil || cfgResp.Config == nil {
		return nil, fmt.Errorf("failed to get config: response or config is nil")
	}

	status := &HandleStatus{
		Resource: ResourceTypeAudience,
		Action:   rr.Action,
	}

	// Check if audience already exists in resp
	for _, a := range cfg.Audiences {
		audienceInList := serverUtil.AudienceInList(a, cfgResp.Config.Audiences)
		llog.Info("Audience existence check", "exists", audienceInList, "audience", serverUtil.AudienceToStr(a))

		// Create audience if it's not in list and action is to create
		if !audienceInList && rr.Action == ReconcileActionCreate {
			llog.Info("Creating audience", "audience", serverUtil.AudienceToStr(a))

			// We need to set this because the operator won't manage resources
			// that it doesn't create.
			a.XCreatedBy = proto.String(CreatedBy)

			if _, err = rr.Client.CreateAudience(outgoingCtx, &protos.CreateAudienceRequest{
				Audience: a,
			}); err != nil {
				return nil, fmt.Errorf("failed to create audience '%s': %s", serverUtil.AudienceToStr(a), err)
			}

			status.NumCreated++
			continue
		}

		// Delete audience if it's in list and action is to delete
		if audienceInList && rr.Action == ReconcileActionDelete {
			// TODO: We should only delete if the audience has a CreatedBy set
			// to our operator. Otherwise, we might delete something not "owned"
			// by us.

			llog.Info("Deleting audience", "audience", serverUtil.AudienceToStr(a))
			if _, err = rr.Client.DeleteAudience(outgoingCtx, &protos.DeleteAudienceRequest{
				Audience: a,
				Force:    nil,
			}); err != nil {
				return nil, fmt.Errorf("failed to delete audience '%s': %s", serverUtil.AudienceToStr(a), err)
			}

			status.NumDeleted++
			continue
		}

		// TODO: This needs a finalizer so that can properly clean up resources
		// when CRD is deleted!

		llog.Info("nothing to do", "audience", serverUtil.AudienceToStr(a))
	}

	r.Recorder.Event(rr.Config, v1.EventTypeNormal, "Audiences handled", fmt.Sprintf("Created: %d, Updated: %d, Deleted: %d",
		status.NumCreated, status.NumUpdated, status.NumDeleted))

	return status, nil
}

// TODO: Implement
func (r *StreamdalConfigReconciler) handleNotifications(ctx context.Context, rr *ReconcileRequest, cfg *protos.Config) (*HandleStatus, error) {
	return &HandleStatus{}, nil
}

// TODO: Implement
func (r *StreamdalConfigReconciler) handlePipelines(ctx context.Context, rr *ReconcileRequest, cfg *protos.Config) (*HandleStatus, error) {
	return &HandleStatus{}, nil
}

// TODO: Implement
func (r *StreamdalConfigReconciler) deleteResource(ctx context.Context, rr *ReconcileRequest) (ctrl.Result, error) {
	return ctrl.Result{}, nil
}

// setupReconcileAction will validate the request, determine the type of action
// it is (create or delete) and create a grpc client that can be used for talking
// to the streamdal server. NOTE: Both "create" and "update" should be handled
// by the create handler.
func (r *StreamdalConfigReconciler) setupReconcileAction(ctx context.Context, req *ctrl.Request, log *logr.Logger) (*ReconcileRequest, error) {
	var cfg crdv1.StreamdalConfig

	if err := r.Get(ctx, req.NamespacedName, &cfg); err != nil {
		return nil, fmt.Errorf("unable to fetch StreamdalConfig object: %w", err)
	}

	reconcileAction := &ReconcileRequest{
		Config: &cfg,
	}

	if err := validate.StreamdalConfig(&cfg); err != nil {
		return reconcileAction, errors.NewInternalError(fmt.Errorf("invalid streamdal config: %s", err))
	}

	// This is a valid request for a valid resource, we know we will definitely
	// need to talk to the streamdal server.
	grpcClient, err := util.NewGrpcExternalClient(ctx, cfg.Spec.ServerAddress, cfg.Spec.ServerAuth)
	if err != nil {
		return reconcileAction, errors.NewInternalError(fmt.Errorf("unable to create grpc client: %s", err))
	}

	reconcileAction.Client = grpcClient

	if cfg.DeletionTimestamp != nil {
		reconcileAction.Action = ReconcileActionDelete
		return reconcileAction, nil
	}

	// Not a delete - either a create or an update
	reconcileAction.Action = ReconcileActionCreate

	return reconcileAction, nil
}

// TODO: Implement periodic reconciler
func (r *StreamdalConfigReconciler) runPeriodicReconciler() {
	// TODO: No need to catch shutdown (so far)
	llog := log.Log.WithValues("method", "runPeriodicReconciler")
	llog.Info("Starting")

	// TODO: How do we know what streamdal server to talk to?
	// IDEA: What if we look through all K8S objects and look for streamdal servers?
	// ^ Not a good idea - maybe we don't want to have some streamdal servers be
	// managed by the K8S operator.
	// IDEA 2: As resources are created, k8s operator adds the server to a map
	// of "known servers".

MAIN:
	for {
		select {
		case <-r.ShutdownCtx.Done():
			llog.Info("Caught shutdown signal - stopping")
			break MAIN
		default:
			llog.Info("Run")
			time.Sleep(3 * time.Second)
		}
	}

	llog.Info("Stopped")
}