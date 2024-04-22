import { Handlers, PageProps } from "$fresh/src/server/types.ts";
import Notifications from "root/islands/notifications.tsx";
import { handler as notificationHandler, NotificationsType } from "./index.tsx";

export const handler: Handlers<NotificationsType> = notificationHandler;

export default function NotificationAddRoute(
  props: PageProps<
    NotificationsType
  >,
) {
  return (
    <Notifications
      notifications={props?.data?.notifications}
      add={true}
    />
  );
}
