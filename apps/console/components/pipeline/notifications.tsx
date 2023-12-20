import { NotificationConfig } from "streamdal-protos/protos/sp_notify.ts";
import { useEffect, useState } from "preact/hooks";

export type PipelineNotificationsType = {
  notifications: NotificationConfig[];
  data: any;
  setData: (data: any) => void;
};

const NotificationCheck = (
  { notification, data, setData }: {
    notification: NotificationConfig;
    data: any;
    setData: (data: any) => void;
  },
) => {
  const [checked, setChecked] = useState(data?.notifications?.includes(id));

  useEffect(() => {
    return checked
      ? setData({
        ...data,
        notifications: [...data?.notifications || [], notification.id],
      })
      : setData({
        ...data,
        notifications: data?.notifications?.filter((n) =>
          n.id !== notification.id
        ),
      });
  }, [checked]);

  return (
    <div class="flex flex-row items-center">
      <input
        type="checkbox"
        id="notifications"
        name="notifications"
        className={`w-4 h-4 rounded border mx-2 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2`}
        checked={checked}
        value={notification.id}
        onChange={(e) => setChecked(e.target.checked)}
      />
      <label className="text-web font-medium text-[14px]">
        {`${notification.config.oneofKind} -  ${notification.name}`}
      </label>
    </div>
  );
};

export const PipelineNotifications = (
  { notifications, data, setData }: PipelineNotificationsType,
) =>
  notifications.map((n: NotificationConfig, i) => (
    <NotificationCheck notification={n} data={data} setData={setData} />
  ));
