import { Handlers, PageProps } from "$fresh/src/server/types.ts";
import { NotificationsType } from "../index.tsx";
import { getNotifications } from "../../../lib/fetch.ts";
import Notifications from "../../../islands/notifications.tsx";

export const handler: Handlers<NotificationsType> = {
  async GET(_req, ctx) {
    return ctx.render({
      notifications: await getNotifications(),
    });
  },
  async POST(req, ctx) {
    const { session }: any = ctx.state;
    const success = session.flash("success");
    return ctx.render({
      success,
      notifications: await getNotifications(),
    });
  },
};

export const NotificationRoute = (
  props: PageProps<
    & NotificationsType
    & {
      id: string;
    }
  >,
) => {
  return (
    <Notifications
      id={props?.params?.id}
      notifications={props?.data?.notifications}
    />
  );
};

export default NotificationRoute;
