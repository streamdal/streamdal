import IconDots from "tabler-icons/tsx/dots.tsx";
import IconTrash from "tabler-icons/tsx/trash.tsx";

export const StepMenu = ({ onDelete }: { onDelete: () => void }) => (
  <div className="z-40">
    <div
      id="stepMenuButton"
      data-dropdown-toggle="step-menu"
      type="button"
      className="cursor-pointer z-40"
    >
      <IconDots class="w-6 h-6 ml text-lunar cursor-pointer" />
    </div>

    <div
      id="step-menu"
      class="z-40 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700"
    >
      <ul
        class="py-2 text-sm text-gray-700 dark:text-gray-200"
        aria-labelledby="stepMenuButton"
      >
        <a href="#" className={"flex items-center"}>
          <li className="group flex w-full items-center py-2 px-2 text-eyelid hover:text-white hover:bg-eyelid text-sm">
            <IconTrash class="w-4 h-4 mr-2 text-eyelid group-hover:text-white" />
            Delete
          </li>
        </a>
      </ul>
    </div>
  </div>
);
