import { SuccessType } from "../_middleware.ts";
import { Handlers } from "$fresh/src/server/types.ts";
import { ErrorType, validate } from "../../components/form/validate.ts";
import {
  createNotification,
  updateNotification,
  upsertNotification,
} from "../../lib/mutation.ts";
import { NotificationConfig } from "streamdal-protos/protos/sp_notify.ts";
import { ResponseCode } from "streamdal-protos/protos/sp_common.ts";
import { NotificationSchema } from "../../islands/notification.tsx";

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
      session.flash("success", {
        status: false,
        message: "Validation failed",
        errors,
      });
      return new Response(
        "",
        {
          status: 307,
          headers: {
            Location: `/notifications/${
              notification.id ? notification.id : ""
            }`,
          },
        },
      );
    }

    const response = notification.id
      ? await updateNotification(notification)
      : await createNotification(notification);

    session.flash("success", {
      status: response.code === ResponseCode.OK,
      message: response.code === ResponseCode.OK
        ? "Success!"
        : "Update notification failed. Please try again later",
      ...response.code !== ResponseCode.OK
        ? { errors: { apiError: response.message, status: response.code } }
        : {},
    });

    return new Response(
      "",
      {
        status: 307,
        headers: {
          Location: `/notifications/${
            response.id
              ? response.id
              : response.notification?.id
              ? response.notification.id
              : ""
          }`,
        },
      },
    );
  },
};

export default function NotificationSaveRoute() {
  return null;
}
