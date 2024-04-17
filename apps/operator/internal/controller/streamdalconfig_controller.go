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
	"google.golang.org/protobuf/encoding/protojson"
	"google.golang.org/protobuf/proto"
	"k8s.io/apimachinery/pkg/api/errors"
	"k8s.io/apimachinery/pkg/runtime"
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
	ReconcileActionUpdate ReconcileAction = "update"
	ReconcileActionDelete ReconcileAction = "delete"

	ResourceTypeAudience     ResourceType = "audience"
	ResourceTypeNotification ResourceType = "notification"
	ResourceTypeWasmModule   ResourceType = "wasm"
	ResourceTypePipeline     ResourceType = "pipeline"
)

// StreamdalConfigReconciler reconciles a StreamdalConfig object
type StreamdalConfigReconciler struct {
	client.Client
	Scheme *runtime.Scheme

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

		llog.Error(err, "Failed to determine reconcile action")

		return ctrl.Result{}, err
	}

	result, err := r.handleResources(ctx, rr)
	if err != nil {
		llog.Error(err, "Failed to complete reconcile action", "action", rr.Action)
		return ctrl.Result{}, err
	}

	llog.Info("Reconcile action completed", "action", rr.Action)

	return result, nil
}

// SetupWithManager sets up the controller with the Manager.
func (r *StreamdalConfigReconciler) SetupWithManager(mgr ctrl.Manager) error {
	// Launch periodic reconciler
	llog := log.Log.WithValues("method", "SetupWithManager")
	llog.Info("Starting periodic reconciler")

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

	cfgResp, err := rr.Client.GetConfig(ctx, &protos.GetConfigRequest{})
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

			if _, err = rr.Client.CreateAudience(ctx, &protos.CreateAudienceRequest{
				Audience: a,
			}); err != nil {
				return nil, fmt.Errorf("failed to create audience '%s': %s", serverUtil.AudienceToStr(a), err)
			}

			status.NumCreated++
			continue
		}

		// Delete audience if it's in list and action is to delete
		if audienceInList && rr.Action == ReconcileActionDelete {
			llog.Info("Deleting audience", "audience", serverUtil.AudienceToStr(a))
			if _, err = rr.Client.DeleteAudience(ctx, &protos.DeleteAudienceRequest{
				Audience: a,
				Force:    nil,
			}); err != nil {
				return nil, fmt.Errorf("failed to delete audience '%s': %s", serverUtil.AudienceToStr(a), err)
			}

			status.NumDeleted++
			continue
		}

		llog.Info("nothing to do", "audience", serverUtil.AudienceToStr(a))
	}

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
		return nil, err
	}

	if err := validate.StreamdalConfig(&cfg); err != nil {
		return nil, fmt.Errorf("failed to validate streamdal config: %s", err)
	}

	// This is a valid request for a valid resource, we know we will definitely
	// need to talk to the streamdal server.
	grpcClient, err := util.NewGrpcExternalClient(ctx, cfg.Spec.ServerAddress, cfg.Spec.ServerAuth)
	if err != nil {
		return nil, fmt.Errorf("unable to create grpc client: %s", err)
	}

	reconcileAction := &ReconcileRequest{
		Config: &cfg,
		Client: grpcClient,
	}

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
	// TODO: No need for any of the select stuff
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
