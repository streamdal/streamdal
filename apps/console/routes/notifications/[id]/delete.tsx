import { Handlers, PageProps } from "$fresh/src/server/types.ts";
import { ResponseCode } from "streamdal-protos/protos/sp_common.ts";
import { NotificationConfig } from "streamdal-protos/protos/sp_notify.ts";
import IconTrash from "tabler-icons/tsx/trash.tsx";
import { RoutedActionModal } from "../../../components/modals/routedActionModal.tsx";
import Notifications from "../../../islands/notifications.tsx";
import { getNotification, getNotifications } from "../../../lib/fetch.ts";
import { deleteNotification } from "../../../lib/mutation.ts";

export type DeleteNotification = {
  notification: NotificationConfig;
  notifications: any[];
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
      <RoutedActionModal
        icon={<IconTrash class="w-10 h-10 mx-auto text-eyelid" />}
        message={
          <div>
            Delete notification{"  "}
            <span class="my-5 text-medium font-bold ">
              {props?.data?.notification?.name}
            </span>?
          </div>
        }
        actionText="Delete"
        cancelUrl={`/notifications/${props?.params?.id}`}
        destructive={true}
      />
      <Notifications notifications={props?.data?.notifications} />
    </>
  );
}
