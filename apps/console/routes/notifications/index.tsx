import { Handlers, PageProps } from "$fresh/src/server/types.ts";
import { SuccessType } from "../_middleware.ts";
import { getNotifications } from "../../lib/fetch.ts";
import { NotificationConfig } from "streamdal-protos/protos/sp_notify.ts";
import Notifications from "root/islands/notifications.tsx";

export type NotificationsType = {
  notifications?: NotificationConfig[];
  success?: SuccessType;
};

export const handler: Handlers<NotificationsType> = {
  async GET(_req, ctx) {
    return ctx.render({
      notifications: await getNotifications(),
    });
  },

  async POST(_req, ctx) {
    const { session }: any = ctx.state;
    const success = session.flash("success");
    return ctx.render({
      success,
      notifications: await getNotifications(),
    });
  },
};

export const NotificationsRoute = (
  props: PageProps<NotificationsType>,
) => {
  return (
    <Notifications
      notifications={props?.data?.notifications}
      success={props?.data?.success}
    />
  );
};

export default NotificationsRoute;
