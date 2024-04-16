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
	"github.com/streamdal/streamdal/libs/protos/build/go/protos"
	"google.golang.org/protobuf/encoding/protojson"
	"k8s.io/apimachinery/pkg/api/errors"
	"k8s.io/apimachinery/pkg/runtime"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/log"

	crdv1 "github.com/streamdal/streamdal/apps/operator/api/v1"
	"github.com/streamdal/streamdal/apps/operator/util"
	"github.com/streamdal/streamdal/apps/operator/validate"
)

const FinalizerName = "streamdal.com/finalizer"

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

const (
	ReconcileActionCreate ReconcileAction = "create"
	ReconcileActionDelete ReconcileAction = "delete"
	ReconcileActionSkip   ReconcileAction = "skip"
)

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

	var result ctrl.Result

	switch rr.Action {
	case ReconcileActionCreate:
		result, err = r.createResource(ctx, rr)
	case ReconcileActionDelete:
		result, err = r.deleteResource(ctx, rr)
	case ReconcileActionSkip:
		llog.Info("Skipping reconcile action")
		return ctrl.Result{}, nil
	default:
		err = fmt.Errorf("unknown reconcile action '%s'", rr.Action)
		llog.Error(err, "Unable to determine action")
		return ctrl.Result{}, err
	}

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

type HandleFunc struct {
	Name     string
	Function func(ctx context.Context, client protos.ExternalClient, cfg *protos.Config) (*HandleStatus, error)
}

type HandleStatus struct {
	Resource   string
	NumCreated int
	NumUpdated int
}

// createResource will attempt to create resources specified in the CR on the
// streamdal server. If the resource already exists, the method will update the
// resource instead.
func (r *StreamdalConfigReconciler) createResource(ctx context.Context, rr *ReconcileRequest) (ctrl.Result, error) {
	llog := log.Log.WithValues("method", "createResource")
	llog.Info("Creating resource in streamdal server")

	for _, cfgItem := range rr.Config.Spec.Configs {
		// Attempt to load config
		protosCfg := &protos.Config{}
		if err := protojson.Unmarshal([]byte(cfgItem.Config), protosCfg); err != nil {
			return ctrl.Result{}, fmt.Errorf("failed to unmarshal config '%s': %s", cfgItem.Name, err)
		}

		if err := validate.StreamdalProtosConfig(protosCfg); err != nil {
			llog.Error(err, fmt.Sprintf("Failed to validate streamdal JSON config '%s'", cfgItem.Name))
			return ctrl.Result{}, err
		}

		// NOTE: Pipelines should be created last as they will reference other resources

		handleFuncs := []HandleFunc{
			{
				Name:     "audience(s)",
				Function: r.handleAudiences,
			},
			{
				Name:     "notification(s)",
				Function: r.handleNotifications,
			},

			// Punting on support for wasm modules for now ~DS 04.16.2024
			//{
			//	Name:     "wasm module(s)",
			//	Function: r.handleWasmModules,
			//},

			{
				Name:     "pipeline(s)",
				Function: r.handlePipelines,
			},
		}

		for _, f := range handleFuncs {
			llog.Info("Running handle function", "resource", f.Name)
			status, err := f.Function(ctx, rr.Client, protosCfg)
			if err != nil {
				return ctrl.Result{}, fmt.Errorf("failed to handle resource '%s': %s", f.Name, err)
			}

			llog.Info("Handle function completed", "resource", f.Name, "numCreated", status.NumCreated, "numUpdated", status.NumUpdated)
		}
	}

	return ctrl.Result{}, nil
}

func (r *StreamdalConfigReconciler) handleAudiences(ctx context.Context, client protos.ExternalClient, cfg *protos.Config) (*HandleStatus, error) {
	return &HandleStatus{}, nil
}

func (r *StreamdalConfigReconciler) handleNotifications(ctx context.Context, client protos.ExternalClient, cfg *protos.Config) (*HandleStatus, error) {
	return &HandleStatus{}, nil
}

func (r *StreamdalConfigReconciler) handlePipelines(ctx context.Context, client protos.ExternalClient, cfg *protos.Config) (*HandleStatus, error) {
	return &HandleStatus{}, nil
}

// TODO: Implement
func (r *StreamdalConfigReconciler) deleteResource(ctx context.Context, rr *ReconcileRequest) (ctrl.Result, error) {
	return ctrl.Result{}, nil
}

// setupReconcileAction will validate the request, determine the type of action
// it is (create or delete) and create a grpc client that can be used for talking
// to the streamdal server.
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
