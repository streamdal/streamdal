import { SuccessType } from "../routes/_middleware.ts";
import { FormInput } from "../components/form/formInput.tsx";
import { FormSelect, optionsFromEnum } from "../components/form/formSelect.tsx";
import { FormHidden } from "../components/form/formHidden.tsx";
import { ErrorType, validate } from "../components/form/validate.ts";
import { useEffect, useState } from "preact/hooks";
import { zfd } from "https://esm.sh/v130/zod-form-data@2.0.1/denonext/zod-form-data.mjs";
import { z } from "zod/index.ts";
import {
  NotificationEmail_Type,
  NotificationPagerDuty_Urgency,
  NotificationType,
} from "snitch-protos/protos/sp_notify.ts";
import IconPlus from "tabler-icons/tsx/plus.tsx";

const slack = {
  botToken: "",
  channel: "",
};

const newNotificationConfig = {
  name: "",
  type: "1",
  config: {
    oneofKind: "slack",
    slack: slack,
  },
};

const NotificationTypeEnum = z.nativeEnum(NotificationType);
const EmailNotificationTypeEnum = z.nativeEnum(NotificationEmail_Type);
const NotificationPaterDutyUrgencyEnum = z.nativeEnum(
  NotificationPagerDuty_Urgency,
);

const SMTPEmailNotificationSchema = z.object({
  host: z.string().min(1, { message: "Required" }),
  port: zfd.numeric(z.number({ message: "Required" })),
  user: z.string().min(1, { message: "Required" }),
  password: z.string().min(1, { message: "Required" }),
  useTls: zfd.text(z.string({ required_error: "Required" })),
});

const SESEmailNotificationSchema = z.object({
  sesRegion: z.string().min(1, { message: "Required" }),
  sesAccessKeyId: z.string().min(1, { message: "Required" }),
  sesSecretAccessKey: z.string().min(1, { message: "Required" }),
});

const EmailNotificationKindSchema = z.discriminatedUnion("oneofKind", [
  z.object({
    oneofKind: z.literal("smtp"),
    smtp: SMTPEmailNotificationSchema,
  }),
  z.object({
    oneofKind: z.literal("ses"),
    ses: SESEmailNotificationSchema,
  }),
]);

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
      type: zfd.numeric(EmailNotificationTypeEnum),
      recipients: zfd.repeatable(
        z.array(z.string().min(1, { message: "Required" })).default([]),
      ),
      fromAddress: z.string().min(1, { message: "Required" }),
      config: EmailNotificationKindSchema,
    }),
  }),
  z.object({
    oneofKind: z.literal("pagerduty"),
    pagerduty: z.object({
      token: z.string().min(1, { message: "Required" }),
      email: z.string().min(1, { message: "Required" }),
      serviceId: z.string().min(1, { message: "Required" }),
      urgency: zfd.numeric(NotificationPaterDutyUrgencyEnum),
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

  const [errors, setErrors] = useState({});
  const [data, setData] = useState(newNotificationConfig);

  const onSubmit = async (e: any) => {
    const notificationFormData = new FormData(e.target);
    const { errors } = validate(NotificationSchema, notificationFormData);
    setErrors(errors || {});

    if (errors) {
      console.error("submit errors", errors);
      e.preventDefault();
      return;
    }
  };

  useEffect(() => {
    if (data?.type === NotificationType["EMAIL"].toString()) {
      setData({
        ...data,
        config: {
          email: {
            type: "1",
            recipients: [""],
          },
        },
      });
    }
  }, [data.type]);

  const addRecipients = () => {
    setData({
      ...data,
      config: {
        ...data.config,
        email: {
          ...data.config.email,
          recipients: [...data.config.email?.recipients, ""],
        },
      },
    });
  };

  return (
    <form
      onSubmit={onSubmit}
      action="/notifications/configure"
      method="post"
    >
      <div class="flex justify-between rounded-t items-center w-full px-[18px] pt-[18px] pb-[8px]">
        <div class="flex flex-row items-center w-full justify-between">
          <div class="text-[16px] flex flex-col justify-between font-medium mr-2 h-[54px] w-full">
            <div class={"flex justify-between w-[580px]"}>
              <FormInput
                name="name"
                data={data}
                setData={setData}
                label="Notification Name"
                placeHolder=""
                errors={errors}
                wrapperClass={"w-[275px]"}
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
                name={`config.oneofKind`}
                value={NotificationType[data?.type].toLowerCase()}
              />
            </div>

            {data?.type === NotificationType.SLACK.toString() &&
              (
                <>
                  <h2 className="mb-6 w-full">
                    In order to get Slack Alerts, you'll need to provide a Slack
                    API token. To generate a token, follow the instructions{" "}
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
                    name={`config.slack.botToken`}
                    data={data}
                    setData={setData}
                    label="Slack token"
                    placeHolder=""
                    errors={errors}
                    wrapperClass={"w-full"}
                  />
                  <FormInput
                    name={`config.slack.channel`}
                    data={data}
                    setData={setData}
                    label="Slack Channel"
                    placeHolder=""
                    errors={errors}
                    wrapperClass={"w-full"}
                  />
                </>
              )}
            {data?.type === NotificationType.EMAIL.toString() && (
              <div class={"w-[580px]"}>
                <FormSelect
                  name={"config.email.type"}
                  data={data}
                  setData={setData}
                  label="Email Notification Type"
                  errors={errors}
                  inputClass="w-36"
                  children={optionsFromEnum(NotificationEmail_Type)}
                />
                <FormHidden
                  name={`config.email.config.oneofKind`}
                  value={NotificationEmail_Type[data?.config.email?.type]
                    ?.toLowerCase()}
                />
                <button
                  class={"flex items-center justify-evenly btn-secondary w-[175px] border border-web"}
                  onClick={() => {
                    addRecipients();
                  }}
                >
                  Add a new recipient
                  <IconPlus
                    data-tooltip-target="step-add"
                    class="w-5 h-5 cursor-pointer"
                  />
                </button>

                {data.config.email && (
                  <div class={"flex w-[650px] flex-wrap"}>
                    {data.config.email &&
                      data?.config.email?.recipients?.map((r, i) => (
                        <FormInput
                          name={`config.email.recipients.${i}`}
                          data={data}
                          label={`Recipient ${i + 1}.`}
                          setData={setData}
                          placeHolder={""}
                          errors={errors}
                          wrapperClass={"w-[180px] mx-2"}
                        />
                      ))}
                  </div>
                )}
                <FormInput
                  name={"config.email.fromAddress"}
                  label={"Origin email address"}
                  data={data}
                  setData={setData}
                  errors={errors}
                />
                {data?.config.email?.type !==
                    NotificationEmail_Type.SES.toString() &&
                  (
                    <div class={"flex-col"}>
                      <div class={"flex"}>
                        <FormInput
                          name={"config.email.config.smtp.host"}
                          data={data}
                          setData={setData}
                          label="Host name"
                          placeHolder=""
                          errors={errors}
                          wrapperClass={"w-[225px] mr-2"}
                        />
                        <FormInput
                          name={"config.email.config.smtp.port"}
                          data={data}
                          setData={setData}
                          label="Port"
                          errors={errors}
                          wrapperClass={"w-[225px]"}
                          isNumber={true}
                        />
                      </div>
                      <div class={"flex"}>
                        <FormInput
                          name={"config.email.config.smtp.user"}
                          data={data}
                          setData={setData}
                          label="User"
                          placeHolder=""
                          errors={errors}
                          wrapperClass={"w-[225px] mr-2"}
                        />
                        <FormInput
                          name={"config.email.config.smtp.password"}
                          data={data}
                          setData={setData}
                          label="Password"
                          placeHolder=""
                          errors={errors}
                          wrapperClass={"w-[225px]"}
                        />
                      </div>
                      <FormSelect
                        name={"config.email.config.smtp.useTls"}
                        data={data}
                        setData={setData}
                        label="Use Tls?"
                        errors={errors}
                        inputClass="w-36"
                        children={[
                          <option
                            key={`option-type-key-true`}
                            value={true}
                            label={"true"}
                          />,
                          <option
                            key={`option-type-key-false`}
                            value={false}
                            label={"false"}
                          />,
                        ]}
                      />
                    </div>
                  )}
                {data?.config.email?.type ===
                    NotificationEmail_Type.SES.toString() &&
                  (
                    <>
                      <div class={"flex justify-between"}>
                        <FormInput
                          name={"config.email.config.ses.sesRegion"}
                          data={data}
                          label="Region"
                          setData={setData}
                          errors={errors}
                        />
                        <FormInput
                          name={"config.email.config.ses.sesAccessKeyId"}
                          data={data}
                          label="Access Key Id"
                          setData={setData}
                          errors={errors}
                        />
                      </div>

                      <FormInput
                        name={"config.email.config.ses.sesSecretAccessKey"}
                        data={data}
                        label="Secret Access Key"
                        setData={setData}
                        errors={errors}
                      />
                    </>
                  )}
              </div>
            )}
            {data?.type === NotificationType.PAGERDUTY.toString() && (
              <>
                <FormInput
                  name={"config.pagerduty.token"}
                  data={data}
                  label="Token"
                  setData={setData}
                  errors={errors}
                />
                <FormInput
                  name={"config.pagerduty.email"}
                  data={data}
                  label="Email"
                  setData={setData}
                  errors={errors}
                />
                <FormInput
                  name={"config.pagerduty.serviceId"}
                  data={data}
                  label="Service ID"
                  setData={setData}
                  errors={errors}
                />
                <FormSelect
                  name={"config.pagerduty.urgency"}
                  data={data}
                  setData={setData}
                  label="Urgency"
                  errors={errors}
                  inputClass="w-36"
                  children={optionsFromEnum(NotificationPagerDuty_Urgency)}
                />
              </>
            )}
            <div class="flex flex-row justify-end mb-4">
              <button
                className="btn-heimdal"
                type="submit"
              >
                Configure Notifications
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
