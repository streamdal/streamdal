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

	"k8s.io/apimachinery/pkg/api/errors"
	"k8s.io/apimachinery/pkg/runtime"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/log"

	crdv1 "github.com/streamdal/streamdal/apps/operator/api/v1"
)

// StreamdalConfigReconciler reconciles a StreamdalConfig object
type StreamdalConfigReconciler struct {
	client.Client
	Scheme *runtime.Scheme

	// Used by periodic reconciler to detect shutdown
	ShutdownCtx context.Context
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
	log := log.FromContext(ctx).WithValues(
		"method", "Reconcile",
		"namespace", req.Namespace,
		"name", req.Name,
	)

	log.Info("received request")

	var cfg crdv1.StreamdalConfig

	if err := r.Get(ctx, req.NamespacedName, &cfg); err != nil {
		if errors.IsNotFound(err) {
			// Resource not found. It could have been deleted after reconcile request.
			// Owned objects are automatically garbage collected. For additional cleanup logic use finalizers.
			log.Info("Resource not found. Ignoring since object must be deleted")
			return ctrl.Result{}, nil
		}

		// Error reading the object - requeue the request.
		log.Error(err, "Failed to get resource")
		return ctrl.Result{}, err
	}

	// Check if the object is being deleted
	if cfg.DeletionTimestamp != nil {
		// The object is being deleted
		log.Info("resource is being deleted")

		cfg.SetFinalizers([]string{})
		if err := r.Update(ctx, &cfg); err != nil {
			log.Error(err, "Failed to update finalizers for delete")
			return ctrl.Result{}, err
		}
		return ctrl.Result{}, nil
	}

	// Resource is being created / updated
	cfg.SetFinalizers([]string{"streamdal.com/finalizer"})

	if err := r.Update(ctx, &cfg); err != nil {
		log.Error(err, "Failed to update resource with finalizer for create/update")
		return ctrl.Result{}, err
	}

	fmt.Printf("cfg contents: %+v\n", cfg)

	return ctrl.Result{}, nil
}

// SetupWithManager sets up the controller with the Manager.
func (r *StreamdalConfigReconciler) SetupWithManager(mgr ctrl.Manager) error {
	// Launch periodic reconciler
	go r.runPeriodicReconciler()

	return ctrl.NewControllerManagedBy(mgr).
		For(&crdv1.StreamdalConfig{}).
		Complete(r)
}

func (r *StreamdalConfigReconciler) runPeriodicReconciler() {
	// TODO: No need for any of the select stuff

MAIN:
	for {
		select {
		case <-r.ShutdownCtx.Done():
			fmt.Println("periodic reconciler detected shutdown")
			break MAIN
		default:
			fmt.Println("performing periodic run")
			time.Sleep(3 * time.Second)
		}
	}

	fmt.Println("periodic reconciler exiting...")
}
