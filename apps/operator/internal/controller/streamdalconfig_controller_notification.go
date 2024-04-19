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
	// Indicates what the handler should do on server
	ServerAction ReconcileAction

	// The target notification that should be created or deleted
	Notification *protos.NotificationConfig
}

func (r *StreamdalConfigReconciler) handleNotifications(
	ctx context.Context,
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
		case ReconcileActionUpdate:
			_, err = rr.Client.CreateNotification(ctx, &protos.CreateNotificationRequest{
				Notification: j.Notification,
			})

			if err == nil {
				status.NumCreated++
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

	if status.NumCreated != 0 || status.NumDeleted != 0 {
		r.Recorder.Event(rr.Config, v1.EventTypeNormal, "Notifications synced",
			fmt.Sprintf("Created: %d Updated: %d Deleted: %d", status.NumCreated, status.NumUpdated, status.NumDeleted))
	}

	return status, nil
}

// generateNotificationJobs will generate notification jobs by comparing the
// desired state in the CR and what's on the streamdal server.
func (r *StreamdalConfigReconciler) generateNotificationJobs(
	action ReconcileAction,
	wantedNotifications []*protos.NotificationConfig,
	serverNotifications []*protos.NotificationConfig,
) []*NotificationJob {
	llog := log.Log.WithValues("method", "generateNotificationJobs")
	diff := make([]*NotificationJob, 0)

	for _, wn := range wantedNotifications {
		switch action {
		// If this is an "update", we will create a diff that contains steps to
		// ensure the server and CR have the same state.
		case ReconcileActionUpdate:
			// If CR notification not in server - mark it for addition
			if !util.NotificationInList(wn, serverNotifications) {
				wn.XCreatedBy = proto.String(CreatedBy)

				diff = append(diff, &NotificationJob{
					ServerAction: ReconcileActionUpdate,
					Notification: wn,
				})
			}
		case ReconcileActionDelete:
			// If CR notification in server notifications - mark it for deletion
			if util.NotificationInList(wn, serverNotifications) {
				diff = append(diff, &NotificationJob{
					ServerAction: ReconcileActionDelete,
					Notification: wn,
				})
			}
		}
	}

	// Same thing but backwards - if this is an "update", we need to ensure that
	// server does NOT have notification configs that are defined the CR.
	if action == ReconcileActionUpdate {
		for _, sn := range serverNotifications {
			// If server notification is not defined in CRD - we should delete
			// it from the server ONLY if it is managed by this k8s operator.
			if !util.NotificationInList(sn, wantedNotifications) {
				if sn.GetXCreatedBy() == CreatedBy {
					diff = append(diff, &NotificationJob{
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

	return diff
}
