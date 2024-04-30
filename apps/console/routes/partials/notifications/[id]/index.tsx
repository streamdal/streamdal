import { Handlers, PageProps, RouteConfig } from "$fresh/src/server/types.ts";
import {
  NotificationsRoute,
  NotificationsType,
} from "root/routes/notifications/index.tsx";
import { handler as notificationHandler } from "../index.tsx";
import { Partial } from "$fresh/runtime.ts";
import Notifications from "root/islands/notifications.tsx";

export const config: RouteConfig = {
  skipAppWrapper: true,
  skipInheritedLayouts: true,
};

export const handler: Handlers<NotificationsType> = notificationHandler;

const PartialNotificationRoute = (
  props: PageProps<
    & NotificationsType
    & {
      id: string;
    }
  >,
) => {
  return (
    <Partial name="overlay-content">
      <Notifications
        id={props?.params?.id}
        notifications={props?.data?.notifications}
      />
    </Partial>
  );
};

export default PartialNotificationRoute;
