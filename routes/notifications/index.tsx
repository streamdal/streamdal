import { NotificationConfigModal } from "../../components/modals/notificationConfigModal.tsx";
import { Handlers, PageProps } from "$fresh/src/server/types.ts";
import { SuccessRoute, SuccessType } from "../_middleware.ts";

export type NotificationsRoute = {
  success?: SuccessType;
};

export const handler: Handlers<SuccessRoute> = {
  async POST(req, ctx) {
    const { session } = ctx.state;
    const success = session.flash("success");
    return ctx.render({
      success,
    });
  },
};

export default function configNotificationsRoute(
  props: PageProps<NotificationsRoute>,
) {
  return <NotificationConfigModal success={props?.data?.success} />;
}
