import { Handlers, PageProps, RouteConfig } from "$fresh/src/server/types.ts";
import Notifications from "root/islands/notifications.tsx";
import { handler as notificationHandler } from "./index.tsx";
import { Partial } from "$fresh/runtime.ts";
import { NotificationsType } from "root/routes/notifications/index.tsx";

export const config: RouteConfig = {
  skipAppWrapper: true,
  skipInheritedLayouts: true,
};

export const handler: Handlers<NotificationsType> = notificationHandler;

const PartialNotificationAddRoute = (
  props: PageProps<
    NotificationsType
  >,
) => {
  return (
    <Partial name="overlay-content">
      <Notifications
        notifications={props?.data?.notifications}
        add={true}
      />
    </Partial>
  );
};

export default PartialNotificationAddRoute;
