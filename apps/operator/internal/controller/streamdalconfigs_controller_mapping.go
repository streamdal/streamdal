package controller

import (
	"context"

	"github.com/streamdal/streamdal/libs/protos/build/go/protos"
)

// TODO: Implement
func (r *StreamdalConfigReconciler) handleMappings(
	ctx context.Context,
	rr *ReconcileRequest,
	wantedCfg *protos.Config,
	serverCfg *protos.Config,
) (*HandleStatus, error) {
	return &HandleStatus{}, nil
}
