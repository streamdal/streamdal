import { SuccessType } from "../_middleware.ts";
import { Handlers } from "$fresh/src/server/types.ts";
import { Pipeline } from "snitch-protos/protos/sp_pipeline.ts";
import { logFormData } from "../../lib/utils.ts";
import { ErrorType, validate } from "../../components/form/validate.ts";
import { NotificationSchema } from "../../islands/notifications.tsx";

export const handler: Handlers<SuccessType> = {
  async POST(req, ctx) {
    const notificationData = await req.formData();
    logFormData(notificationData);
    const { data: notification, errors }: {
      pipeline: Pipeline;
      errors: ErrorType;
    } = validate(
      NotificationSchema,
      notificationData,
    );

    const { session } = ctx.state;

    if (errors) {
      session.set("success", {
        status: false,
        message: "Validation failed",
        errors,
      });
      return new Response(
        "",
        {
          status: 307,
          headers: { Location: `/notifications` },
        },
      );
    }
  },
};

export default function NotificationConfigureRoute() {
  return <h2>YO</h2>;
}
