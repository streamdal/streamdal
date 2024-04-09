import IconTrash from "tabler-icons/tsx/trash.tsx";
import IconX from "tabler-icons/tsx/x.tsx";

export const DeleteModal = (
  { entityType, entityName, onDelete, onClose }: {
    entityType: string;
    entityName: string;
    onDelete: () => void;
    //
    // controlling this ourselves as flowbites controls are too flakey
    onClose: () => void;
  },
) => {
  return (
    <div class="absolute top-[8%] left-[35%] z-50 p-4 overflow-x-hidden overflow-y-auto inset-0 max-h-[80vh]">
      <div class="relative w-full max-w-md max-h-full">
        <div class="relative bg-white rounded-lg border border-streamdalRed shadow-2xl shadow-streamdalRed">
          <a href="/">
            <button
              type="button"
              className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center"
              onClick={onClose}
            >
              <IconX class="w-6 h-6" />
            </button>
          </a>
          <div class="p-6 text-center">
            <IconTrash class="w-10 h-10 mt-3 mx-auto text-eyelid" />
            <div class="my-4">
              Delete{"  "}{entityType}{" "}
              <span class="my-5 text-medium font-bold ">
                {entityName}
              </span>?
            </div>

            <button
              className="btn-secondary mr-2"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              class="btn-delete"
              type="submit"
              onClick={onDelete}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
