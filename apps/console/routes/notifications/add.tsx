import { Handlers, PageProps } from "$fresh/src/server/types.ts";
import { handler as notificationHandler, NotificationsType } from "./index.tsx";
import { Notifications } from "../../islands/notifications.tsx";

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
