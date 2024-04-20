package controller

//
//import (
//	"context"
//	"fmt"
//
//	"github.com/streamdal/streamdal/libs/protos/build/go/protos"
//	"google.golang.org/protobuf/proto"
//	v1 "k8s.io/api/core/v1"
//	"sigs.k8s.io/controller-runtime/pkg/log"
//
//	"github.com/streamdal/streamdal/apps/operator/util"
//)
//
//type PipelineJob struct {
//	// Indicates what the handler should do on server; unlike ReconcileRequest
//	// which is only UPDATE or DELETE - the job can be CREATE, UPDATE or DELETE.
//	ServerAction ReconcileAction
//
//	// The target notification that should be created or deleted
//	Pipeline *protos.Pipeline
//}
//
//// TODO: Implement
//func (r *StreamdalConfigReconciler) handlePipelines(
//	ctx context.Context, // should already have auth metadata
//	rr *ReconcileRequest,
//	wantedCfg *protos.Config,
//	serverCfg *protos.Config,
//) (*HandleStatus, error) {
//	llog := log.Log.WithValues("method", "handlePipelines", "action", rr.Action)
//	llog.Info("Handling pipelines", "numWantedResources", len(wantedCfg.Pipelines))
//
//	status := &HandleStatus{
//		Resource: ResourceTypePipeline,
//		Action:   rr.Action,
//	}
//
//	// TODO: Should the operator validate that the pipeline config is
//	// referencing notification IDs, audiences, etc. that the server is aware of?
//
//	jobs := r.generatePipelineJobs(rr.Action, wantedCfg.Pipelines, serverCfg.Pipelines)
//
//	llog.Info("Generated notification jobs", "numGenerated", len(jobs))
//
//	var err error
//
//	for _, j := range jobs {
//		switch j.ServerAction {
//		case ReconcileActionUpdate:
//			_, err = rr.Client.CreatePipeline(ctx, &protos.CreatePipelineRequest{
//				Pipeline: j.Pipeline,
//			})
//
//			if err == nil {
//				status.NumUpdated++
//			}
//		case ReconcileActionDelete:
//			_, err = rr.Client.DeletePipeline(ctx, &protos.DeletePipelineRequest{
//				PipelineId: j.Pipeline.GetId(),
//			})
//
//			if err == nil {
//				status.NumDeleted++
//			}
//		default:
//			llog.Info("Unknown server action for pipeline", "serverAction", j.ServerAction, "pipelineID", j.Pipeline.GetId())
//			return nil, fmt.Errorf("unknown server action '%s' for audience '%s'", j.ServerAction, j.Pipeline.GetId())
//		}
//
//		if err != nil {
//			llog.Error(err, "Unable to complete server action", "action", j.ServerAction)
//			return nil, fmt.Errorf("unable to complete server action '%s': %s", j.ServerAction, err)
//		}
//	}
//
//	if status.NumUpdated != 0 || status.NumDeleted != 0 {
//		r.Recorder.Event(rr.Config, v1.EventTypeNormal, "Pipelines synced",
//			fmt.Sprintf("Updated: %d Deleted: %d", status.NumUpdated, status.NumDeleted))
//	}
//
//	return status, nil
//}
//
//// generatePipelineJobs will generate pipeline jobs by comparing the desired
//// state in the CR and what's on the streamdal server.
//func (r *StreamdalConfigReconciler) generatePipelineJobs(
//	action ReconcileAction,
//	wantedPipelines []*protos.Pipeline,
//	serverPipelines []*protos.Pipeline,
//) []*PipelineJob {
//	llog := log.Log.WithValues("method", "generatePipelineJobs")
//	diff := make([]*PipelineJob, 0)
//
//	for _, wp := range wantedPipelines {
//		switch action {
//		// If this is an "update", we will create a diff that contains steps to
//		// ensure the server and CR have the same state.
//		case ReconcileActionUpdate:
//			// If CR pipeline not in server - mark it for addition
//			if !util.PipelineInList(wp, serverPipelines) {
//				wp.XCreatedBy = proto.String(CreatedBy)
//
//				diff = append(diff, &PipelineJob{
//					ServerAction: ReconcileActionUpdate,
//					Pipeline:     wp,
//				})
//			}
//		case ReconcileActionDelete:
//			// If CR pipeline in server pipelines - mark it for deletion
//			if util.PipelineInList(wp, serverPipelines) {
//				diff = append(diff, &PipelineJob{
//					ServerAction: ReconcileActionDelete,
//					Pipeline:     wp,
//				})
//			}
//		}
//	}
//
//	// Same thing but backwards - if this is an "update", we need to ensure that
//	// server does NOT have pipeline configs that are defined the CR.
//	if action == ReconcileActionUpdate {
//		for _, sp := range serverPipelines {
//			// If server pipeline is not defined in CRD - we should delete
//			// it from the server ONLY if it is managed by this k8s operator.
//			if !util.PipelineInList(sp, wantedPipelines) {
//				if sp.GetXCreatedBy() == CreatedBy {
//					diff = append(diff, &PipelineJob{
//						ServerAction: ReconcileActionDelete,
//						Pipeline:     sp,
//					})
//				} else {
//					llog.Info("Wanted to mark notification for deletion but it is not managed by this operator",
//						"notificationID", sp.GetId())
//				}
//			}
//		}
//	}
//
//	return diff
//}
