import { useEffect, useState } from "preact/hooks";
import IconPlus from "tabler-icons/tsx/plus.tsx";
import { zfd } from "zod-form-data";
import * as z from "zod/index.ts";
import { validate } from "../components/form/validate.ts";
import { FormInput } from "../components/form/formInput.tsx";
import { FormHidden } from "../components/form/formHidden.tsx";
import { FormSelect, optionsFromEnum } from "../components/form/formSelect.tsx";
import {
  NotificationConfig,
  NotificationEmail_Type,
  NotificationPagerDuty_Urgency,
  NotificationType,
} from "streamdal-protos/protos/sp_notify.ts";
import { InlineInput } from "../components/form/inlineInput.tsx";
import { NotificationMenu } from "../components/notifications/notificationMenu.tsx";

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
        z.array(z.string().min(1, { message: "Required" })),
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

const NotificationDetail = ({
  notification,
}: {
  notification: NotificationConfig;
}) => {
  const [errors, setErrors] = useState({});
  const [data, setData] = useState(notification);

  useEffect(() => {
    setData({
      ...notification,
    });
  }, [notification]);

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
    const oneofKind = NotificationType[data.type].toLowerCase();
    setData({
      ...data,
      config: {
        ...data.config,
        oneofKind,
      },
    });
  }, [data.type]);

  const addRecipient = () => {
    setData({
      ...data,
      config: {
        ...data.config,
        email: {
          ...data.config.email,
          recipients: [...(data.config.email?.recipients || []), ""],
        },
      },
    });
  };

  return (
    <>
      <form onSubmit={onSubmit} action="/notifications/save" method="post">
        <div class="flex items-center justify-between rounded-t px-[18px] pb-[8px] pt-[18px]">
          <div class="flex flex-row items-center">
            <div class="mr-2 h-[54px] text-[30px] font-medium">
              <FormHidden name="id" value={data?.id} />
              <InlineInput
                placeHolder="Name your notification"
                name="name"
                data={data}
                setData={setData}
                errors={errors}
              />
            </div>
            {<NotificationMenu id={notification?.id} />}
          </div>
          <div>
            <a href="/" f-partial="/partials">
              <img src="/images/x.svg" className="w-[14px]" />
            </a>
          </div>
        </div>
        <div class="flex w-full items-center justify-between rounded-t px-[18px] pb-[8px] pt-[18px]">
          <div class="flex w-full flex-row items-center justify-between">
            <div class="mr-2 flex h-[54px] w-full flex-col justify-between text-[16px] font-medium">
              <FormSelect
                name={"type"}
                data={data}
                setData={setData}
                label="Notification Type"
                errors={errors}
                children={optionsFromEnum(NotificationType)}
              />
              <FormHidden
                name={`config.oneofKind`}
                value={data.config.oneofKind}
              />

              {data?.type == NotificationType.SLACK && (
                <>
                  <h2 className="mb-2 mt-4 w-full text-sm">
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
              {data?.type == NotificationType.EMAIL && (
                <div>
                  <FormSelect
                    name={"config.email.type"}
                    data={data}
                    setData={setData}
                    label="Email Notification Type"
                    errors={errors}
                    children={optionsFromEnum(NotificationEmail_Type)}
                  />
                  <FormHidden
                    name={`config.email.config.oneofKind`}
                    value={NotificationEmail_Type[
                      data?.config?.email?.type || 1
                    ]?.toLowerCase()}
                  />
                  <div
                    class={"btn-secondary border-web flex w-[175px] cursor-pointer items-center justify-evenly border"}
                    onClick={addRecipient}
                  >
                    Add a new recipient
                    <IconPlus class="h-5 w-5 cursor-pointer" />
                  </div>

                  {data?.config?.email?.recipients?.length
                    ? (
                      data?.config?.email?.recipients?.map((r, i) => (
                        <FormInput
                          name={`config.email.recipients.${i}`}
                          data={data}
                          label={`Recipient ${i + 1}.`}
                          setData={setData}
                          placeHolder={""}
                          errors={errors}
                        />
                      ))
                    )
                    : (
                      <FormInput
                        name={`config.email.recipients.0`}
                        data={data}
                        label={`Recipient 1.`}
                        setData={setData}
                        placeHolder={""}
                        errors={errors}
                      />
                    )}
                  <FormInput
                    name={"config.email.fromAddress"}
                    label={"Origin email address"}
                    data={data}
                    setData={setData}
                    errors={errors}
                  />
                  {data?.config.email?.type != NotificationEmail_Type.SES && (
                    <>
                      <div class={"flex flex-row items-center justify-between"}>
                        <FormInput
                          name={"config.email.config.smtp.host"}
                          data={data}
                          setData={setData}
                          label="Host name"
                          placeHolder=""
                          errors={errors}
                          wrapperClass="w-[49%]"
                        />
                        <FormInput
                          name={"config.email.config.smtp.port"}
                          data={data}
                          setData={setData}
                          label="Port"
                          errors={errors}
                          isNumber={true}
                          wrapperClass="w-[49%]"
                        />
                      </div>
                      <div class={"flex flex-row items-center justify-between"}>
                        <FormInput
                          name={"config.email.config.smtp.user"}
                          data={data}
                          setData={setData}
                          label="User"
                          placeHolder=""
                          errors={errors}
                          wrapperClass="w-[49%]"
                        />
                        <FormInput
                          name={"config.email.config.smtp.password"}
                          data={data}
                          setData={setData}
                          label="Password"
                          placeHolder=""
                          errors={errors}
                          wrapperClass="w-[49%]"
                        />
                      </div>
                      <FormSelect
                        name={"config.email.config.smtp.useTls"}
                        data={data}
                        setData={setData}
                        label="Use TLS?"
                        errors={errors}
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
                    </>
                  )}
                  {data?.config.email?.type == NotificationEmail_Type.SES && (
                    <>
                      <div class={"flex-col"}>
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
              {data?.type == NotificationType.PAGERDUTY && (
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
              <div class="mb-4 flex flex-row justify-end">
                <button className="btn-heimdal" type="submit">
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </>
  );
};

export default NotificationDetail;
