import {SuccessType} from "../routes/_middleware.ts";
import {FormInput} from "../components/form/formInput.tsx";
import {FormSelect, optionsFromEnum} from "../components/form/formSelect.tsx";
import {FormHidden} from "../components/form/formHidden.tsx";
import {ErrorType, validate} from "../components/form/validate.ts";
import {useState} from "preact/hooks";
import {zfd} from "https://esm.sh/v130/zod-form-data@2.0.1/denonext/zod-form-data.mjs";
import {z} from "zod/index.ts";
import {NotificationType} from "snitch-protos/protos/sp_notify.ts";

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

const NotificationKindSchema = z.discriminatedUnion("oneofKind", [
    z.object({
        oneofKind: z.literal("slack"),
        slack: z.object({
            botToken: z.string().min(1, {message: "Required"}),
            channel: z.string().min(1, {message: "Required"}),
        }),
    }),
    //TO DO: set up email and pager configs
    z.object({
        oneofKind: z.literal("email"),
        email: z.object({
            botToken: z.string().min(1, {message: "Required"}),
            channel: z.string().min(1, {message: "Required"}),
        }),
    }),
]);

export const NotificationSchema = zfd.formData({
    id: z.string().optional(),
    name: z.string().min(1, {message: "Required"}),
    type: zfd.numeric(NotificationTypeEnum),
    config: NotificationKindSchema,
});

export const NotificationDetail = (success: SuccessType) => {
    const e: ErrorType = {};

    const [errors, setErrors] = useState(e);
    const [data, setData] = useState(newNotificationConfig);


    const onSubmit = async (e: any) => {
        const notificationFormData = new FormData(e.target);
        const {errors} = validate(NotificationSchema, notificationFormData);
        setErrors(errors || {});

        if (errors) {
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
            <div class="flex justify-between rounded-t items-center min-w-full px-[18px] pt-[18px] pb-[8px]">
                <div class="flex flex-row items-center">
                    <div class="text-[16px] font-medium mr-2 h-[54px]">
                        <FormInput
                            name="name"
                            data={data}
                            setData={setData}
                            label="Notification Name"
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
                            name={`config.oneofKind`}
                            value={NotificationType[data?.type].toLowerCase()}
                        />
                        {data?.type === "1" &&
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
                                    />
                                    <FormInput
                                        name={`config.slack.channel`}
                                        data={data}
                                        setData={setData}
                                        label="Slack Channel"
                                        placeHolder=""
                                        errors={errors}
                                    />
                                </>
                            )}
                        <div class="flex flex-row justify-end mr-6 mb-6">
                            <button
                                className={`${
                                    data.type === "1" ? "btn-heimdal" : "btn-disabled"
                                }`}
                                type="submit"
                                disabled={data.type !== "1"}
                            >
                                Configure Notifications
                            </button>
                        </div>
                        {data.type !== "1" && (
                            <p class="text-center">
                                {`Notifications for ${
                                    NotificationType[data?.type].toLowerCase()
                                } coming soon!`} <br/>{" "}
                                Please choose a different notification method.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </form>
    );
};
