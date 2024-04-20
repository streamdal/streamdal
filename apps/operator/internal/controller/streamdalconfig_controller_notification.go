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

type NotificationJob struct {
	// Indicates what the handler should do on server; unlike ReconcileRequest
	// which is only UPDATE or DELETE - the job can be CREATE, UPDATE or DELETE.
	ServerAction ReconcileAction

	// The target notification that should be created or deleted
	Notification *protos.NotificationConfig
}

func (r *StreamdalConfigReconciler) handleNotifications(
	ctx context.Context, // should already have auth metadata
	rr *ReconcileRequest,
	wantedCfg *protos.Config,
	serverCfg *protos.Config,
) (*HandleStatus, error) {
	llog := log.Log.WithValues("method", "handleNotifications", "action", rr.Action)
	llog.Info("Handling notifications", "numWantedResources", len(wantedCfg.Notifications))

	status := &HandleStatus{
		Resource: ResourceTypeNotification,
		Action:   rr.Action,
	}

	jobs := r.generateNotificationJobs(rr.Action, wantedCfg.Notifications, serverCfg.Notifications)

	llog.Info("Generated notification jobs", "numGenerated", len(jobs))

	var err error

	for _, j := range jobs {
		switch j.ServerAction {
		case ReconcileActionCreate:
			_, err := rr.Client.CreateNotification(ctx, &protos.CreateNotificationRequest{
				Notification: j.Notification,
			})

			if err == nil {
				status.NumCreated++
			}
		case ReconcileActionUpdate:
			_, err = rr.Client.UpdateNotification(ctx, &protos.UpdateNotificationRequest{
				Notification: j.Notification,
			})

			if err == nil {
				status.NumUpdated++
			}
		case ReconcileActionDelete:
			_, err = rr.Client.DeleteNotification(ctx, &protos.DeleteNotificationRequest{
				// TODO: This should delete by ID and actual config at some point
				NotificationId: j.Notification.GetId(),
			})

			if err == nil {
				status.NumDeleted++
			}
		default:
			llog.Info("Unknown server action for notification", "serverAction", j.ServerAction, "notificationID", j.Notification.GetId())
			return nil, fmt.Errorf("unknown server action '%s' for audience '%s'", j.ServerAction, j.Notification.GetId())
		}

		if err != nil {
			llog.Error(err, "Unable to complete server action", "action", j.ServerAction)
			return nil, fmt.Errorf("unable to complete server action '%s': %s", j.ServerAction, err)
		}
	}

	if status.NumCreated != 0 || status.NumUpdated != 0 || status.NumDeleted != 0 {
		r.Recorder.Event(rr.Config, v1.EventTypeNormal, "Notifications synced",
			fmt.Sprintf("Created: %d Updated: %d Deleted: %d", status.NumCreated, status.NumUpdated, status.NumDeleted))
	}

	return status, nil
}

// generateNotificationJobs will generate notification jobs by comparing the
// desired state in the CR and what's on the streamdal server.
func (r *StreamdalConfigReconciler) generateNotificationJobs(
	action ReconcileAction,
	wantedConfigs []*protos.NotificationConfig,
	serverConfigs []*protos.NotificationConfig,
) []*NotificationJob {
	llog := log.Log.WithValues("method", "generateNotificationJobs")
	jobs := make([]*NotificationJob, 0)

	for _, wc := range wantedConfigs {
		// Check if server configs contain config with ID in CR
		sc := util.GetNotificationConfigByID(wc.GetId(), serverConfigs)

		switch action {
		// If this is an "update", we will create a jobs that contains steps to
		// ensure the server and CR have the same state.
		case ReconcileActionUpdate:
			if sc == nil {
				// Server does not contain a config with same ID - mark it for addition
				wc.XCreatedBy = proto.String(CreatedBy)

				jobs = append(jobs, &NotificationJob{
					ServerAction: ReconcileActionCreate,
					Notification: wc,
				})
			} else {
				// Server contains a config with the same id. Was the config
				// created by this operator?
				if sc.GetXCreatedBy() != CreatedBy {
					llog.Info("Wanted to mark notification for update but it is not managed by this operator",
						"notificationID", sc.GetId())
					continue
				}

				// Set this so that the comparison works correctly
				wc.XCreatedBy = proto.String(CreatedBy)

				// Server config was crated by this operator but we need to check
				// if the contents of the config are the same as the wanted config.
				if equal, _ := util.CompareNotificationConfig(wc, sc); !equal {
					jobs = append(jobs, &NotificationJob{
						ServerAction: ReconcileActionUpdate,
						Notification: wc,
					})
				}
			}
		case ReconcileActionDelete:
			// If CR config is in server - mark it for deletion
			if sc != nil {
				jobs = append(jobs, &NotificationJob{
					ServerAction: ReconcileActionDelete,
					Notification: wc,
				})
			}
		}
	}

	// Same thing but backwards - if this is an "update", we need to ensure that
	// server does NOT have notification configs that are defined the CR.
	//
	// NOTE: We only care about this during an "update" action - if we're deleting
	// the CR, we don't care about what's on the server.
	if action == ReconcileActionUpdate {
		for _, sn := range serverConfigs {
			// If server notification is not defined in CRD - we should delete
			// it from the server ONLY if it is managed by this k8s operator.
			wn := util.GetNotificationConfigByID(sn.GetId(), wantedConfigs)

			if wn == nil {
				if sn.GetXCreatedBy() == CreatedBy {
					jobs = append(jobs, &NotificationJob{
						ServerAction: ReconcileActionDelete,
						Notification: sn,
					})
				} else {
					llog.Info("Wanted to mark notification for deletion but it is not managed by this operator",
						"notificationID", sn.GetId())
				}
			}
		}
	}

	return jobs
}
