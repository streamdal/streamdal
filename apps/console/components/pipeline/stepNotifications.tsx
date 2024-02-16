import { ErrorType } from "../form/validate.ts";
import { Tooltip } from "../tooltip/tooltip.tsx";
import IconInfoCircle from "tabler-icons/tsx/info-circle.tsx";
import { NotificationConfig } from "streamdal-protos/protos/sp_notify.ts";

import {
  StepNotificationCheck,
  StepNotificationType,
} from "./stepNotification.tsx";
import { NotificationPayload } from "./notificationPayload.tsx";

export type NotificationsType = {
  notifications: NotificationConfig[];
  name: string;
  data: any;
  setData: (data: any) => void;
  errors: ErrorType;
};

export const PipelineNotifications = (
  { notifications, name, data, setData }: NotificationsType,
) => (
  <>
    {notifications.map((n: NotificationConfig, i) => (
      <StepNotificationCheck
        key={`${name}-${i}`}
        notification={n}
        name={name}
        data={data}
        setData={setData}
      />
    ))}
  </>
);

export const StepNotifications = (
  { notifications, name, data, setData, errors }: NotificationsType,
) => {
  return (
    <div class="my-2">
      <div class="flex flex-row justify-start items-center mb-1">
        <label
          className={`text-xs `}
        >
          Notifications
        </label>
        <IconInfoCircle
          class="w-4 h-4 ml-1"
          data-tooltip-target={`${name}-notification-tooltip`}
        />
        <Tooltip
          targetId={`${name}-notification-tooltip`}
          message="Configure notifications to send for this step result condition"
        />
      </div>
      <div className="flex flex-col py-2 mb-2 border rounded-sm w-full">
        {notifications.length
          ? (
            <>
              <PipelineNotifications
                notifications={notifications}
                name={name}
                data={data}
                setData={() => null}
                errors={errors}
              />
              <NotificationPayload
                name={name}
                data={data}
                setData={setData}
                errors={errors}
              />
            </>
          )
          : (
            <div class="p-2 text-sm text-stormCloud">
              No notification configs.{" "}
              <a class="text-underline" href="/notifications" target="_">
                Add notification config
              </a>.
            </div>
          )}
      </div>
    </div>
  );
};
