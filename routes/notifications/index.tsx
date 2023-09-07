import { NotificationConfigModal } from "../../components/modals/notificationConfigModal.tsx";
import { PageProps } from "$fresh/src/server/types.ts";
import { SuccessType } from "../_middleware.ts";

export type NotificationsRoute = {
  success?: SuccessType;
};

export default function configNotificationsRoute(
  props: PageProps<NotificationsRoute>,
) {
  return <NotificationConfigModal success={props?.data?.success} />;
}
