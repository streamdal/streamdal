import { Handlers, PageProps } from "$fresh/src/server/types.ts";
import { getNotification, getNotifications } from "../../../lib/fetch.ts";
import { ResponseCode } from "streamdal-protos/protos/sp_common.ts";
import { deleteNotification } from "../../../lib/mutation.ts";
import { RoutedDeleteModal } from "../../../components/modals/routedDeleteModal.tsx";
import { NotificationConfig } from "streamdal-protos/protos/sp_notify.ts";
import Notifications from "../../../islands/notifications.tsx";

export type DeleteNotification = {
  notification: NotificationConfig;
  notifications: NotificationConfig[];
};

export const handler: Handlers<DeleteNotification> = {
  async GET(req, ctx) {
    const notification = await getNotification(ctx.params.id);
    if (!notification) {
      return ctx.renderNotFound();
    }
    return ctx.render({
      notification,
      notifications: await getNotifications(),
    });
  },
  async POST(req, ctx) {
    const response = await deleteNotification(ctx.params.id);
    const { session }: any = ctx.state;

    session.flash("success", {
      status: response.code === ResponseCode.OK,
      message: response.code === ResponseCode.OK
        ? "Success!"
        : "Delete notification failed. Please try again later",
      ...response.code !== ResponseCode.OK
        ? { errors: { apiError: response.message, status: response.code } }
        : {},
    });

    return new Response("", {
      status: 307,
      headers: { Location: "/notifications" },
    });
  },
};

export default function DeleteNotificationRoute(
  props: PageProps<DeleteNotification>,
) {
  return (
    <>
      <RoutedDeleteModal
        id={props?.params?.id}
        entityType="notification"
        entityName={props?.data?.notification?.name}
        redirect={`/notifications/${props?.params?.id}`}
      />
      <Notifications notifications={props?.data?.notifications} />
    </>
  );
}
