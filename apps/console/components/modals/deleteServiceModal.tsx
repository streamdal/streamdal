import { ActionModal } from "root/components/modals/actionModal.tsx";
import { Audience } from "streamdal-protos/protos/sp_common.ts";
import IconTrash from "tabler-icons/tsx/trash.tsx";
import { opModal } from "../serviceMap/opModalSignal.ts";
import { toastSignal } from "../toasts/toast.tsx";

export const DeleteServiceModal = (
  { audience }: { audience: Audience },
) => {
  const close = () =>
    opModal.value = { ...opModal.value, deleteService: false };

  const deleteService = async () => {
    const response = await fetch(
      `/service/${audience.serviceName}/delete`,
      {
        method: "POST",
      },
    );

    const { success } = await response.json();

    if (success.message) {
      toastSignal.value = {
        id: "serviceModal",
        type: success.status ? "success" : "error",
        message: success.message,
      };
      opModal.value = { clients: 0 };
    }
  };

  return (
    <ActionModal
      icon={<IconTrash class="w-10 h-10text-eyelid" />}
      message={
        <div>
          Delete service{" "}
          <span class="text-medium font-bold ">{audience.serviceName}</span>?
        </div>
      }
      actionText="Delete"
      destructive={true}
      onClose={close}
      onAction={deleteService}
    />
  );
};
