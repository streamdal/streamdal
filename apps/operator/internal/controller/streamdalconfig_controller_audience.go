package controller

import (
	"context"
	"fmt"

	serverUtil "github.com/streamdal/streamdal/apps/server/util"
	"github.com/streamdal/streamdal/libs/protos/build/go/protos"
	"google.golang.org/protobuf/proto"
	v1 "k8s.io/api/core/v1"
	"sigs.k8s.io/controller-runtime/pkg/log"
)

type AudienceJob struct {
	// Indicates what the handler should do on server
	ServerAction ReconcileAction

	// The target audience that should be created or deleted
	Audience *protos.Audience
}

// handleAudiences will either create or delete audiences in the streamdal server.
//
// NOTE: An audience can only be created or deleted - it cannot be updated.
// This is because the resource itself consists of 4 required fields - it either
// exists or doesn't.
func (r *StreamdalConfigReconciler) handleAudiences(ctx context.Context, rr *ReconcileRequest, wantedCfg, serverCfg *protos.Config) (*HandleStatus, error) {
	llog := log.Log.WithValues("method", "handleAudiences", "action", rr.Action)
	//llog.Info("Handling audiences", "numWantedResources", len(wantedCfg.Audiences))

	status := &HandleStatus{
		Resource: ResourceTypeAudience,
		Action:   rr.Action,
	}

	jobs := r.generateAudienceJobs(rr.Action, wantedCfg.Audiences, serverCfg.Audiences)

	if len(jobs) != 0 {
		llog.Info("Generated audience jobs", "numGenerated", len(jobs))
	}

	var err error

	for _, j := range jobs {
		switch j.ServerAction {
		case ReconcileActionUpdate:
			_, err = rr.StreamdalGRPCClient.CreateAudience(ctx, &protos.CreateAudienceRequest{
				Audience: j.Audience,
			})

			if err == nil {
				status.NumCreated++
			}
		case ReconcileActionDelete:
			_, err = rr.StreamdalGRPCClient.DeleteAudience(ctx, &protos.DeleteAudienceRequest{
				Audience: j.Audience,
				Force:    proto.Bool(true), // This will delete the audience <-> pipeline mapping (if it has any)
			})

			if err == nil {
				status.NumDeleted++
			}
		default:
			audStr := serverUtil.AudienceToStr(j.Audience)

			llog.Info("Unknown server action for audience", "serverAction", j.ServerAction, "audience", audStr)

			return nil, fmt.Errorf("unknown server action '%s' for audience '%s'", j.ServerAction, audStr)
		}

		if err != nil {
			llog.Error(err, "Unable to complete server action", "action", j.ServerAction)
			return nil, fmt.Errorf("unable to complete server action '%s': %s", j.ServerAction, err)
		}
	}

	if status.NumCreated != 0 || status.NumDeleted != 0 {
		r.Recorder.Event(rr.Config, v1.EventTypeNormal, "Audiences synced",
			fmt.Sprintf("Created: %d Updated: %d Deleted: %d", status.NumCreated, status.NumUpdated, status.NumDeleted))
	}

	return status, nil
}

// generateAudienceJobs will generate audience jobs by comparing the desired
// state in the CR and what's on the streamdal server.
func (r *StreamdalConfigReconciler) generateAudienceJobs(
	action ReconcileAction,
	crAudiences []*protos.Audience,
	serverAudiences []*protos.Audience,
) []*AudienceJob {
	llog := log.Log.WithValues("method", "generateAudienceJobs")
	diff := make([]*AudienceJob, 0)

	for _, ca := range crAudiences {
		switch action {
		// If this is an "update", we will create a diff that contains steps to
		// ensure the server and CR have the same state.
		case ReconcileActionUpdate:
			// If CR audience not in server - mark it for addition
			if !serverUtil.AudienceInList(ca, serverAudiences) {
				ca.XCreatedBy = proto.String(CreatedBy)

				diff = append(diff, &AudienceJob{
					ServerAction: ReconcileActionUpdate,
					Audience:     ca,
				})
			}
		case ReconcileActionDelete:
			// If CR audience in server audience - mark it for deletion
			if serverUtil.AudienceInList(ca, serverAudiences) {
				diff = append(diff, &AudienceJob{
					ServerAction: ReconcileActionDelete,
					Audience:     ca,
				})
			}
		}
	}

	// Same thing but backwards - if this is an "update", we need to ensure that
	// server does NOT have audiences that are defined the CR.
	if action == ReconcileActionUpdate {
		for _, sa := range serverAudiences {
			// If server audience is not defined in CRD - we should delete it from
			// the server ONLY if it is managed by this k8s operator.
			if !serverUtil.AudienceInList(sa, crAudiences) {
				if sa.GetXCreatedBy() == CreatedBy {
					diff = append(diff, &AudienceJob{
						ServerAction: ReconcileActionDelete,
						Audience:     sa,
					})
				} else {
					llog.Info("Wanted to mark audience for deletion but it is not managed by this operator", "audience", serverUtil.AudienceToStr(sa))
				}
			}
		}
	}

	return diff
}
