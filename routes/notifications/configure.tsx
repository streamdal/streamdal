import { SuccessType } from "../_middleware.ts";
import { Handlers } from "$fresh/src/server/types.ts";
import { Pipeline } from "snitch-protos/protos/sp_pipeline.ts";
import { ErrorType, validate } from "../../components/form/validate.ts";
import { NotificationSchema } from "../../components/modals/notificationConfigModal.tsx";

export const handler: Handlers<SuccessType> = {
  async POST(req, ctx) {
    const notificationData = await req.formData();

    const { data: notification, errors }: {
      pipeline: Pipeline;
      errors: ErrorType;
    } = validate(
      NotificationSchema,
      notificationData,
    );
  },
};

export default function NotificationConfigureRoute() {
  return <h2>YO</h2>;
}
