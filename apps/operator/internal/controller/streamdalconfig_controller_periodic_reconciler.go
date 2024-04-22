package controller

import (
	"fmt"
	"time"

	"sigs.k8s.io/controller-runtime/pkg/log"

	crdv1 "github.com/streamdal/streamdal/apps/operator/api/v1"
)

// runPeriodicReconciler is intended to be ran as a goroutine, started at operator
// startup. It will run every DefaultReconcileInterval or CR.periodicReconcilerInterval
// (if set).
//
// The periodic reconciler is designed to periodically check and ensure that
// the state of a system aligns with its desired state. It automatically
// corrects discrepancies by triggering necessary updates or fixes. This
// mechanism is essential for maintaining system integrity and reliability over
// time.
//
// A periodic reconciler is needed in addition to the regular reconcile loop to
// handle cases where external changes or system errors might not trigger events
// detected by the regular loop. For example: someone manually removed a config
// entry in the streamdal server via the UI - the periodic reconciler would detect
// the discrepancy and correct it by re-adding the config entry.
func (r *StreamdalConfigReconciler) runPeriodicReconciler() {
	llog := log.Log.WithValues("method", "runPeriodicReconciler")
	llog.Info("Starting")

	ticker := time.NewTicker(r.periodicReconcilerInterval)

MAIN:

	for {
		select {
		case <-r.ShutdownCtx.Done():
			llog.Info("Caught shutdown signal - stopping")
			break MAIN
		case <-ticker.C:
			if err := r.runPeriodicReconcilerIteration(); err != nil {
				llog.Error(err, "Failed to run periodic reconciler iteration")
			}
		}
	}

	llog.Info("Stopped")
}

func (r *StreamdalConfigReconciler) runPeriodicReconcilerIteration() error {
	llog := log.Log.WithValues("method", "runPeriodicReconcilerIteration")

	//llog.Info("Fetching list of CRs")

	// Get a list of CR's
	crs := &crdv1.StreamdalConfigList{}

	if err := r.List(r.ShutdownCtx, crs); err != nil {
		return fmt.Errorf("failed to list StreamdalConfig objects: %s", err)
	}

	// Really loud
	//if len(crs.Items) != 0 {
	//	llog.Info("Going to reconcile CRs", "numCRs", len(crs.Items))
	//}

	var numResourcesReconciled int

	// For each CR, verify the config is correct
	for _, cr := range crs.Items {
		rr, err := r.setupReconcileAction(r.ShutdownCtx, nil, &cr)
		if err != nil {
			return fmt.Errorf("failed to setup reconcile action for CR '%s': %s", cr.Name, err)
		}

		_, status, err := r.handleReconcileRequest(r.ShutdownCtx, rr)
		if err != nil {
			return fmt.Errorf("failed to handle resources for CR '%s': %s", cr.Name, err)
		}

		for _, s := range status {
			if s.NumCreated != 0 || s.NumUpdated != 0 || s.NumDeleted != 0 {
				numResourcesReconciled++

				llog.Info("Reconciled resource(s) for CR",
					"crName", cr.Name,
					"resource", s.Resource,
					"numCreated", s.NumCreated,
					"numUpdated", s.NumUpdated,
					"numDeleted", s.NumDeleted,
				)
			}
		}
	}

	if numResourcesReconciled != 0 {
		llog.Info("Reconciled resources", "numResourcesReconciled", numResourcesReconciled)
	}

	return nil
}
