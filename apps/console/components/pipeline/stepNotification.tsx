import { NotificationConfig } from "streamdal-protos/protos/sp_notify.ts";
import { useEffect, useState } from "preact/hooks";
import { resolveValue } from "../form/validate.ts";

export type StepNotificationType = {
  notification: NotificationConfig;
  name: string;
  data: any;
  setData: (data: any) => void;
};

export const StepNotificationCheck = (
  { notification, name, data, setData }: StepNotificationType,
) => {
  const existingNotifications = resolveValue(
    data,
    `${name}.notificationConfigIds`,
  );
  const exists = existingNotifications?.includes(notification.id);
  const [checked, setChecked] = useState(exists);

  useEffect(() => {
    setChecked(exists);
  }, [exists]);

  return (
    <div
      class="flex flex-row items-center mb"
      onClick={() => setChecked(!checked)}
    >
      <input
        type="checkbox"
        name={`${name}.notificationConfigIds`}
        className={`w-4 h-4 rounded border mx-2 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2`}
        checked={checked}
        value={notification.id}
      />
      <label className="text-web font-medium text-[14px]">
        {`${notification.config.oneofKind} -  ${notification.name}`}
      </label>
    </div>
  );
};
