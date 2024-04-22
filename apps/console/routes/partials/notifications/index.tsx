import { Partial } from "$fresh/runtime.ts";
import { Handlers, PageProps, RouteConfig } from "$fresh/src/server/types.ts";
import Notifications from "root/islands/notifications.tsx";
import {
  handler as notificationsHandler,
  NotificationsType,
} from "../../notifications/index.tsx";

export const config: RouteConfig = {
  skipAppWrapper: true,
  skipInheritedLayouts: true,
};

export const handler: Handlers<NotificationsType> = notificationsHandler;

const PartialNotificationsRoute = (
  props: PageProps<NotificationsType>,
) => {
  return (
    <Partial name="overlay-content">
      <Notifications
        notifications={props?.data?.notifications}
        success={props?.data?.success}
      />
    </Partial>
  );
};

export default PartialNotificationsRoute;
