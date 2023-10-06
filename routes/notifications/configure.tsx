import { SuccessType } from "../_middleware.ts";
import { Handlers } from "$fresh/src/server/types.ts";
import { ErrorType, validate } from "../../components/form/validate.ts";
import { NotificationSchema } from "../../islands/notifications.tsx";
import { createNotification } from "../../lib/mutation.ts";
import { NotificationConfig } from "snitch-protos/protos/sp_notify.ts";
import { ResponseCode } from "snitch-protos/protos/sp_common.ts";

export const handler: Handlers<SuccessType> = {
  async POST(req, ctx) {
    const notificationData = await req.formData();
    const { data: notification, errors }: {
      notification: NotificationConfig;
      errors: ErrorType;
    } = validate(
      NotificationSchema,
      notificationData,
    );

    const { session } = ctx.state;

    if (errors) {
      console.error(errors);
      session.flash("success", {
        status: false,
        message: "Validation failed",
        errors,
      });
      return new Response(
        "",
        {
          status: 307,
          headers: { Location: `/` },
        },
      );
    }

    const response = await createNotification(notification);

    session.flash("success", {
      status: response.code === ResponseCode.OK,
      message: response.code === ResponseCode.OK
        ? "Success!"
        : "Configure notification failed. Please try again later",
      ...response.code !== ResponseCode.OK
        ? { errors: { apiError: response.message, status: response.code } }
        : {},
    });

    return new Response(
      "",
      {
        status: 307,
        headers: {
          Location: "/",
        },
      },
    );
  },
};

export default function NotificationConfigureRoute() {
  return null;
}
