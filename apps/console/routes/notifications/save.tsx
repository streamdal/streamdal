import { SuccessType } from "../_middleware.ts";
import { Handlers } from "$fresh/src/server/types.ts";
import { validate } from "../../components/form/validate.ts";
import { createNotification, updateNotification } from "../../lib/mutation.ts";
import { ResponseCode } from "streamdal-protos/protos/sp_common.ts";
import { NotificationSchema } from "root/components/notifications/schema.ts";
import { NotificationConfig } from "streamdal-protos/protos/sp_notify.ts";

export const handler: Handlers<SuccessType> = {
  async POST(req) {
    const notificationData = await req.formData();
    const { data: notification, errors } = validate(
      NotificationSchema,
      notificationData,
    );

    if (errors) {
      return new Response(
        JSON.stringify({
          code: ResponseCode.BAD_REQUEST,
          message: JSON.stringify(errors),
        }),
      );
    }

    const response = notification?.id
      ? await updateNotification(notification as NotificationConfig)
      : await createNotification(notification as NotificationConfig);

    return new Response(JSON.stringify(response));
  },
};
