package controller

import (
	"context"
	"fmt"

	"github.com/streamdal/streamdal/libs/protos/build/go/protos"
	"google.golang.org/protobuf/proto"
	v1 "k8s.io/api/core/v1"
	"sigs.k8s.io/controller-runtime/pkg/log"

	"github.com/streamdal/streamdal/apps/operator/util"
)

type PipelineJob struct {
	// Indicates what the handler should do on server; unlike ReconcileRequest
	// which is only UPDATE or DELETE - the job can be CREATE, UPDATE or DELETE.
	ServerAction ReconcileAction

	// The target pipeline that should be created, updated or deleted
	Pipeline *protos.Pipeline
}

func (r *StreamdalConfigReconciler) handlePipelines(
	ctx context.Context, // should already have auth metadata
	rr *ReconcileRequest,
	wantedCfg *protos.Config,
	serverCfg *protos.Config,
) (*HandleStatus, error) {
	llog := log.Log.WithValues("method", "handlePipelines", "action", rr.Action)
	//llog.Info("Handling pipelines", "numWantedResources", len(wantedCfg.Pipelines))

	status := &HandleStatus{
		Resource: ResourceTypePipeline,
		Action:   rr.Action,
	}

	jobs := r.generatePipelineJobs(rr.Action, wantedCfg.Pipelines, serverCfg.Pipelines)

	if len(jobs) != 0 {
		llog.V(1).Info("Generated pipeline jobs", "numGenerated", len(jobs))
	}

	var err error

	for _, j := range jobs {
		switch j.ServerAction {
		case ReconcileActionCreate:
			_, err := rr.StreamdalGRPCClient.CreatePipeline(ctx, &protos.CreatePipelineRequest{
				Pipeline: j.Pipeline,
			})

			if err == nil {
				status.NumCreated++
			}
		case ReconcileActionUpdate:
			_, err = rr.StreamdalGRPCClient.UpdatePipeline(ctx, &protos.UpdatePipelineRequest{
				Pipeline: j.Pipeline,
			})

			if err == nil {
				status.NumUpdated++
			}
		case ReconcileActionDelete:
			_, err = rr.StreamdalGRPCClient.DeletePipeline(ctx, &protos.DeletePipelineRequest{
				PipelineId: j.Pipeline.GetId(),
			})

			if err == nil {
				status.NumDeleted++
			}
		default:
			llog.Info("Unknown server action for pipeline", "serverAction", j.ServerAction, "pipelineID", j.Pipeline.GetId())
			return nil, fmt.Errorf("unknown server action '%s' for pipeline id '%s'", j.ServerAction, j.Pipeline.GetId())
		}

		if err != nil {
			llog.Error(err, "Unable to complete server action", "action", j.ServerAction)
			return nil, fmt.Errorf("unable to complete server action '%s': %s", j.ServerAction, err)
		}
	}

	if status.NumCreated != 0 || status.NumUpdated != 0 || status.NumDeleted != 0 {
		r.Recorder.Event(rr.Config, v1.EventTypeNormal, "Pipelines synced",
			fmt.Sprintf("Created: %d Updated: %d Deleted: %d", status.NumCreated, status.NumUpdated, status.NumDeleted))
	}

	return status, nil
}

// generatePipelineJobs will generate pipeline jobs by comparing the desired
// state in the CR and what's on the streamdal server.
func (r *StreamdalConfigReconciler) generatePipelineJobs(
	action ReconcileAction,
	wantedConfigs []*protos.Pipeline,
	serverConfigs []*protos.Pipeline,
) []*PipelineJob {
	llog := log.Log.WithValues("method", "generatePipelineJobs")
	jobs := make([]*PipelineJob, 0)

	for _, wc := range wantedConfigs {
		// Check if server configs contain config with ID in CR
		sc := util.GetPipelineByID(wc.GetId(), serverConfigs)

		switch action {
		// Treat periodic action as an "update" -- the CR is still there so this
		// is not a delete.
		case ReconcileActionPeriodic:
			fallthrough
		// If this is an "update", we will create a jobs that contains steps to
		// ensure the server and CR have the same state.
		case ReconcileActionUpdate:
			if sc == nil {
				// Server does not contain a config with same ID - mark it for addition
				wc.XCreatedBy = proto.String(CreatedBy)

				jobs = append(jobs, &PipelineJob{
					ServerAction: ReconcileActionCreate,
					Pipeline:     wc,
				})
			} else {
				// Server contains a config with the same id. Was the config
				// created by this operator?
				if sc.GetXCreatedBy() != CreatedBy {
					llog.Info("Wanted to mark pipeline for update but it is not managed by this operator",
						"pipelineID", sc.GetId())
					continue
				}

				// Set this so that the comparison works correctly
				wc.XCreatedBy = proto.String(CreatedBy)

				// Server config was crated by this operator but we need to check
				// if the contents of the config are the same as the wanted config.
				if equal, diff := util.ComparePipeline(wc, sc); !equal {
					llog.V(1).Info("Server pipeline different from wanted pipeline")
					fmt.Println(diff)

					jobs = append(jobs, &PipelineJob{
						ServerAction: ReconcileActionUpdate,
						Pipeline:     wc,
					})
				}
			}
		case ReconcileActionDelete:
			// If CR config is in server - mark it for deletion
			if sc != nil {
				jobs = append(jobs, &PipelineJob{
					ServerAction: ReconcileActionDelete,
					Pipeline:     wc,
				})
			}
		}
	}

	// Same thing but backwards - if this is an "update", we need to ensure that
	// server does NOT have pipeline configs that are defined the CR.
	//
	// NOTE: We only care about this during an "update" action - if we're deleting
	// the CR, we don't care about what's on the server.
	if action == ReconcileActionUpdate || action == ReconcileActionPeriodic {
		for _, sc := range serverConfigs {
			// If server pipeline is not defined in CRD - we should delete it
			// from the server ONLY if it is managed by this k8s operator.
			wn := util.GetPipelineByID(sc.GetId(), wantedConfigs)

			if wn == nil {
				if sc.GetXCreatedBy() == CreatedBy {
					jobs = append(jobs, &PipelineJob{
						ServerAction: ReconcileActionDelete,
						Pipeline:     sc,
					})
				} else {
					llog.Info("Wanted to mark pipeline for deletion but it is not managed by this operator",
						"pipelineID", sc.GetId())
				}
			}
		}
	}

	return jobs
}
