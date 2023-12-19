import { Handlers } from "$fresh/src/server/types.ts";
import {
  handler as notificationsHandler,
  NotificationsRoute,
  NotificationsType,
} from "../../notifications/index.tsx";

export const handler: Handlers<NotificationsType> = notificationsHandler;

export default NotificationsRoute;
