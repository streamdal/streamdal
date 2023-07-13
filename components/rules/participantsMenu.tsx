import IconEye from "https://deno.land/x/tabler_icons_tsx@0.0.3/tsx/eye.tsx";
import { Delete, Edit } from "../icons/crud.tsx";
import IconChevronDown from "https://deno.land/x/tabler_icons_tsx@0.0.3/tsx/chevron-down.tsx";

export const ParticipantsMenu = ({ id }: { id: string }) => (
  <>
    <div
      id="dropdownButton"
      data-dropdown-toggle={`flow-${id}`}
      type="button"
      className="cursor-pointer"
    >
      <IconChevronDown class="w-6 h-6" aria-hidden="true" />
    </div>
    <div
      id={`flow-${id}`}
      class="z-100 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700"
    >
      <ul
        class="py-2 text-sm text-gray-700 dark:text-gray-200"
        aria-labelledby="dropdownButton"
      >
        <a href="#">
          <li className="flex w-full flex-start px-2 py-2 hover:bg-sunset text-sm">
            <IconEye className="w-5 h-5 text-red mx-1" />
            View
          </li>
        </a>
        <a href="#">
          <li className="flex w-full flex-start py-2 px-2 hover:bg-sunset text-sm">
            <Edit className="w-4 text-web mx-1" />
            Edit
          </li>
        </a>
        <a href="#">
          <li className="group flex w-full flex-start py-2 px-2 text-eyelid hover:text-white hover:bg-eyelid text-sm">
            <Delete className="w-4 mx-1 text-eyelid group-hover:text-white fill-current" />
            Delete
          </li>
        </a>
      </ul>
    </div>
  </>
);
