import { Kebab } from "../icons/nav.tsx";
import IconEye from "https://deno.land/x/tabler_icons_tsx@0.0.3/tsx/eye.tsx";
import { Delete, Edit } from "../icons/crud.tsx";

export const RuleMenu = ({ id }: { id: string }) => (
  <>
    <div
      id="dropdownDefaultButton"
      data-dropdown-toggle="dropdown"
      type="button"
      className="cursor-pointer"
    >
      <Kebab
        className="hover:text-web h-[20px] relative"
        aria-hidden="true"
      />
    </div>

    <div
      id="dropdown"
      class="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700"
    >
      <ul
        class="py-2 text-sm text-gray-700 dark:text-gray-200"
        aria-labelledby="dropdownDefaultButton"
      >
        <a href="#">
          <li className="flex w-full flex-start py-2 hover:bg-sunset text-sm">
            <IconEye className="w-5 h-5 text-red mx-1" />
            View
          </li>
        </a>
        <a href="#">
          <li className="flex w-full flex-start py-2 hover:bg-sunset text-sm">
            <Edit className="w-4 text-web mx-1" />
            Edit
          </li>
        </a>
        <a href="#">
          <li className="flex w-full flex-start py-2 text-eyelid hover:text-white hover:bg-eyelid text-sm">
            <Delete className="w-4 mx-1 text-eyelid hover:text-white fill-current" />
            Delete
          </li>
        </a>
      </ul>
    </div>
  </>
);
