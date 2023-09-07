import {SuccessType} from "../_middleware.ts";
import {Handlers} from "$fresh/src/server/types.ts";
import {logFormData} from "../../lib/utils.ts";
import {ErrorType, validate} from "../../components/form/validate.ts";
import {NotificationSchema} from "../../islands/notifications.tsx";
import {createNotification} from "../../lib/mutation.ts";
import {NotificationConfig} from "snitch-protos/protos/sp_notify.ts";
import {ResponseCode} from "snitch-protos/protos/sp_common.ts";

export const handler: Handlers<SuccessType> = {
    async POST(req, ctx) {
        const notificationData = await req.formData();
        logFormData(notificationData);
        const {data: notification, errors}: {
            notification: NotificationConfig;
            errors: ErrorType;
        } = validate(
            NotificationSchema,
            notificationData,
        );

        const {session} = ctx.state;

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
                    headers: {Location: `/notifications`},
                },
            );
        }
        console.log("notification", notification);

        const response = await createNotification(notification);

        session.set("success", {
            status: response.code === ResponseCode.OK,
            message: response.code === ResponseCode.OK
                ? "Success!"
                : "Configure notification failed. Please try again later",
            ...response.code !== ResponseCode.OK
                ? {errors: {apiError: response.message, status: response.code}}
                : {},
        });

        return new Response(
            "",
            {
                status: 307,
                headers: {
                    Location: "/notifications",
                },
            },
        );
    },
};

export default function NotificationConfigureRoute() {
    return null;
}
