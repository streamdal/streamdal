import { opModal } from "../serviceMap/opModalSignal.ts";
import { Toast } from "../toasts/toast.tsx";
import { useState } from "preact/hooks";
import { ErrorType, validate } from "../form/validate.ts";
import { FormSelect } from "../form/formSelect.tsx";
import { NotificationType } from "snitch-protos/protos/sp_notify.ts";
import { FormInput } from "../form/formInput.tsx";
import { zfd } from "https://esm.sh/v130/zod-form-data@2.0.1/denonext/zod-form-data.mjs";
import { z } from "zod/index.ts";
import { titleCase } from "../../lib/utils.ts";

const NotificationTypeEnum = z.nativeEnum(NotificationType);

const NotificationKindSchema = z.object({
  oneofKind: z.literal("slack"),
  slack: z.object({
    botToken: z.string().min(1, { message: "Required" }),
    channel: z.string().min(1, { message: "Required" }),
  }),
});

export const NotificationSchema = zfd.formData({
  id: z.string().optional(),
  name: z.string().min(1, { message: "Required" }),
  type: z.string(),
  notificationType: zfd.numeric(NotificationTypeEnum),
  config: NotificationKindSchema,
});

export type NotificationType = z.infer<typeof NotificationSchema>;

export const NotificationConfigModal = (props: any) => {
  const close = () => opModal.value = { ...opModal.value, pause: false };
  const e: ErrorType = {};

  const [errors, setErrors] = useState(e);
  const [data, setData] = useState();

  const onSubmit = async (e: any) => {
    const notificationFormData = new FormData(e.target);
    const { errors } = validate(NotificationSchema, notificationFormData);
    setErrors(errors || {});

    if (errors) {
      console.log("there was an error");
      e.preventDefault();
      return;
    }
  };

  return (
    <>
      <div
        id="notificationModal"
        aria-modal="true"
        class="absolute mt-12 z-40 w-full h-full px-4 py-2 overflow-x-hidden overflow-y-hidden max-h-full justify-center items-center flex"
        role="dialog"
      >
        <div class="relative w-1/2 h-full max-w-5xl">
          <div class="relative bg-white h-1/2 rounded-lg shadow-2xl shadow-stormCloud">
            <div class="flex flex-col justify-between items-center px-10 py-10">
              <div class="text-[16px] font-bold">Notifications</div>
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
                        name={"notificationType"}
                        data={data}
                        setData={setData}
                        label="Notification Type"
                        errors={errors}
                        inputClass="w-36"
                        children={
                          <option
                            key={"notification-slack"}
                            value={"slack"}
                            label={titleCase("slack")}
                          />
                        }
                      />
                      <h2 className="mb-6">
                        In order to get Slack Alerts, you'll need to provide a
                        Slack API token. To generate a token, follow the
                        instructions{" "}
                        <a
                          href="https://api.slack.com/tutorials/tracks/getting-a-token"
                          target="_new"
                          className="underline underline-offset-2"
                        >
                          here
                        </a>
                        .
                      </h2>
                      <FormInput
                        name={`notificationType.oneOfKind`}
                        data={data}
                        setData={setData}
                        label="Slack token"
                        placeHolder=""
                        errors={errors}
                      />
                      <div class="flex flex-row justify-end mr-6 mb-6">
                        <button className="btn-heimdal" type="submit">
                          Configure Slack
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Toast id="pipeline" />
    </>
  );
};
