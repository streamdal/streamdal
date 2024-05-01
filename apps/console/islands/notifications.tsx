import { useEffect } from "preact/hooks";
import {
  NotificationConfig,
  NotificationType,
} from "streamdal-protos/protos/sp_notify.ts";
import IconPencil from "tabler-icons/tsx/pencil.tsx";
import IconPlus from "tabler-icons/tsx/plus.tsx";
import { initFlowBite } from "../components/flowbite/init.tsx";
import { Tooltip } from "../components/tooltip/tooltip.tsx";
import NotificationDetail from "./notification.tsx";

const slack = {
  botToken: "",
  channel: "",
};

const newNotificationConfig: NotificationConfig = {
  id: "",
  name: "",
  type: NotificationType.SLACK,
  config: {
    oneofKind: "slack",
    slack,
  },
};

export default function Notifications(
  { id, notifications, add = false }: {
    id?: string;
    notifications?: NotificationConfig[];
    add?: boolean;
  },
) {
  useEffect(() => {
    void initFlowBite();
  }, []);

  //
  // wrapper supports adding a new entry
  const wrapper = [
    ...notifications ? notifications : [],
    ...notifications?.length === 0 || add ? [newNotificationConfig] : [],
  ];

  const index = id && wrapper?.findIndex((n) => n.id === id);
  const selected = add ? wrapper.length - 1 : index && index > -1 ? index : 0;

  return (
    <>
      <div
        className={`relative flex flex-col h-screen w-full`}
      >
        <div className="h-46 w-full bg-streamdalPurple p-4 text-white font-semibold text-sm">
          <span className="opacity-50">Home</span> / Manage Notifications
        </div>
        <div class="relative bg-white h-full">
          <div class="flex justify-start h-full">
            <div class="border-r w-1/3 flex flex-col pb-[16px] overflow-y-auto">
              <div class="flex justify-between items-center pt-[26px] pb-[16px] px-[14px]">
                <div class="text-[16px] font-bold">Notifications</div>
                <a
                  href="/notifications/add"
                  f-partial="/partials/notifications/add"
                  data-tooltip-target="notification-add"
                >
                  <IconPlus class="w-6 h-6 pointer-events-none" />
                </a>
                <Tooltip
                  targetId="notification-add"
                  message="Add a new notification"
                />
              </div>
              {wrapper?.map((n: NotificationConfig, i: number) => (
                <a
                  href={`/notifications/${n.id}`}
                  f-partial={`/partials/notifications/${n.id}`}
                >
                  <div
                    class={`flex flex-row items-center justify-between py-[14px] pl-[30px] pr-[12px] ${
                      i === selected && "bg-sunset"
                    } cursor-pointer hover:bg-sunset`}
                  >
                    {n.name}
                    {selected === i &&
                      <IconPencil class="w-4 h-4 text-web" />}
                  </div>
                </a>
              ))}
            </div>
            <div class="w-full max-h-[80vh] overflow-y-auto">
              <NotificationDetail notification={wrapper[selected]} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
