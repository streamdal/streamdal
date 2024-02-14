import { SuccessType } from "../routes/_middleware.ts";
import { NotificationConfig } from "streamdal-protos/protos/sp_notify.ts";
import IconPlus from "tabler-icons/tsx/plus.tsx";
import { OP_MODAL_WIDTH } from "./drawer/infoDrawer.tsx";
import { Tooltip } from "../components/tooltip/tooltip.tsx";
import { Pipeline } from "streamdal-protos/protos/sp_pipeline.ts";
import IconPencil from "tabler-icons/tsx/pencil.tsx";
import { Toast, toastSignal } from "../components/toasts/toast.tsx";
import NotificationDetail from "./notification.tsx";
import { useLayoutEffect } from "preact/hooks";

const slack = {
  botToken: "",
  channel: "",
};

const newNotificationConfig = {
  name: "",
  type: "1",
  config: {
    oneofKind: "slack",
    slack,
  },
};

export const Notifications = (
  { id, notifications, success, add = false }: {
    id?: string;
    notifications?: NotificationConfig[];
    success: SuccessType;
    add?: boolean;
  },
) => {
  //
  // wrapper supports adding a new entry
  const wrapper = [
    ...notifications,
    ...notifications.length === 0 || add ? [newNotificationConfig] : [],
  ];

  const index = id && wrapper?.findIndex((p) => p.id === id);
  const selected = add ? wrapper.length - 1 : index > -1 ? index : 0;

  if (success?.message) {
    toastSignal.value = {
      id: "notifications",
      type: success.status ? "success" : "error",
      message: success.message,
    };
  }

  useLayoutEffect(async () => {
    const { initFlowbite } = await import("flowbite");
    initFlowbite();
  });

  return (
    <>
      <div
        className={`relative flex flex-col h-screen w-[calc(100vw-${OP_MODAL_WIDTH})]`}
      >
        <div className="h-46 w-full bg-streamdalPurple p-4 text-white font-semibold text-sm">
          <span className="opacity-50">Home</span> / Manage Notifications
        </div>
        <div class="relative bg-white h-full">
          <div class="flex justify-start h-full">
            <div class="border-r w-1/3 flex flex-col pb-[16px] overflow-y-auto">
              <div class="flex justify-between items-center pt-[26px] pb-[16px] px-[14px]">
                <div class="text-[16px] font-bold">Notifications</div>
                <a href="/notifications/add">
                  <IconPlus
                    data-tooltip-target="notification-add"
                    class="w-5 h-5 cursor-pointer"
                  />
                </a>
                <Tooltip
                  targetId="notification-add"
                  message="Add a new notification"
                />
              </div>
              {wrapper?.map((n: NotificationConfig, i: number) => (
                <a href={`/notifications/${n.id}`}>
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
              <NotificationDetail
                notification={wrapper[selected]}
                success={success}
              />
            </div>
          </div>
        </div>
      </div>
      <Toast id="notifications" />
    </>
  );
};
