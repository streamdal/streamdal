import { SuccessType } from "../routes/_middleware.ts";
import { FormInput } from "../components/form/formInput.tsx";
import { FormSelect, optionsFromEnum } from "../components/form/formSelect.tsx";
import { FormHidden } from "../components/form/formHidden.tsx";
import { ErrorType, validate } from "../components/form/validate.ts";
import { useState } from "preact/hooks";
import { logFormData } from "../lib/utils.ts";
import { zfd } from "https://esm.sh/v130/zod-form-data@2.0.1/denonext/zod-form-data.mjs";
import { z } from "zod/index.ts";
import { NotificationType } from "snitch-protos/protos/sp_notify.ts";

const NotificationTypeEnum = z.nativeEnum(NotificationType);

const NotificationKindSchema = z.discriminatedUnion("oneofKind", [
  z.object({
    oneofKind: z.literal("slack"),
    slack: z.object({
      botToken: z.string().min(1, { message: "Required" }),
      channel: z.string().min(1, { message: "Required" }),
    }),
  }),
  z.object({
    oneofKind: z.literal("email"),
    email: z.object({
      botToken: z.string().min(1, { message: "Required" }),
      channel: z.string().min(1, { message: "Required" }),
    }),
  }),
]);

export const NotificationSchema = zfd.formData({
  id: z.string().optional(),
  name: z.string().min(1, { message: "Required" }),
  type: zfd.numeric(NotificationTypeEnum),
  config: NotificationKindSchema,
});

export const NotificationDetail = (success: SuccessType) => {
  const e: ErrorType = {};

  const [errors, setErrors] = useState(e);
  const [data, setData] = useState({});
  console.log("shit", data);

  const onSubmit = async (e: any) => {
    const notificationFormData = new FormData(e.target);
    logFormData(notificationFormData);
    const { errors } = validate(NotificationSchema, notificationFormData);
    setErrors(errors || {});

    if (errors) {
      console.log("there was an error");
      e.preventDefault();
      return;
    }
  };
  return (
    <form
      onSubmit={onSubmit}
      action="/notifications/configure"
      method="post"
    >
      <div class="flex justify-between rounded-t items-center px-[18px] pt-[18px] pb-[8px]">
        <div class="flex flex-row items-center">
          <div class="text-[16px] font-medium mr-2 h-[54px]">
            <FormInput
              name="name"
              data={data}
              setData={setData}
              label="Notification Label"
              placeHolder=""
              errors={errors}
            />
            <FormSelect
              name={"type"}
              data={data}
              setData={setData}
              label="Notification Type"
              errors={errors}
              inputClass="w-36"
              children={optionsFromEnum(NotificationType)}
            />
            <FormHidden
              name={"config.oneofKind"}
              value={data?.type}
            />
            <h2 className="mb-6">
              In order to get Slack Alerts, you'll need to provide a Slack API
              token. To generate a token, follow the instructions{" "}
              <a
                href="https://api.slack.com/tutorials/tracks/getting-a-token"
                target="_new"
                className="underline underline-offset-2"
              >
                here
              </a>
              .
            </h2>
            {data?.type === "slack" &&
              (
                <>
                  <FormInput
                    name={`config.slack.oneofKind.botToken`}
                    data={data}
                    setData={setData}
                    label="Slack token"
                    placeHolder=""
                    errors={errors}
                  />
                  <FormInput
                    name={`config.slack.oneofKind.channel`}
                    data={data}
                    setData={setData}
                    label="Slack Channel"
                    placeHolder=""
                    errors={errors}
                  />
                </>
              )}
            <div class="flex flex-row justify-end mr-6 mb-6">
              <button className="btn-heimdal" type="submit">
                Configure Slack
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
