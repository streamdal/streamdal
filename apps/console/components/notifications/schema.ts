import {
  NotificationEmail_Type,
  NotificationPagerDuty_Urgency,
  NotificationType,
} from "streamdal-protos/protos/sp_notify.ts";
import { z } from "zod/mod.ts";
import { numeric, repeatable, text } from "root/components/form/validate.ts";

export const NotificationTypeEnum = z.nativeEnum(NotificationType);
export const EmailNotificationTypeEnum = z.nativeEnum(NotificationEmail_Type);
export const NotificationPaterDutyUrgencyEnum = z.nativeEnum(
  NotificationPagerDuty_Urgency,
);

export const SMTPEmailNotificationSchema = z.object({
  host: z.string().min(1, { message: "Required" }),
  port: numeric(z.number()),
  user: z.string().min(1, { message: "Required" }),
  password: z.string().min(1, { message: "Required" }),
  useTls: text(z.string({ required_error: "Required" })),
});

export const SESEmailNotificationSchema = z.object({
  sesRegion: z.string().min(1, { message: "Required" }),
  sesAccessKeyId: z.string().min(1, { message: "Required" }),
  sesSecretAccessKey: z.string().min(1, { message: "Required" }),
});

export const EmailNotificationKindSchema = z.discriminatedUnion("oneofKind", [
  z.object({
    oneofKind: z.literal("smtp"),
    smtp: SMTPEmailNotificationSchema,
  }),
  z.object({
    oneofKind: z.literal("ses"),
    ses: SESEmailNotificationSchema,
  }),
]);

export const NotificationKindSchema = z.discriminatedUnion("oneofKind", [
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
      type: numeric(EmailNotificationTypeEnum),
      recipients: repeatable(
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
      urgency: numeric(NotificationPaterDutyUrgencyEnum),
    }),
  }),
]);

export const NotificationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, { message: "Required" }),
  type: numeric(NotificationTypeEnum),
  config: NotificationKindSchema,
});
