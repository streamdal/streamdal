import IconCopy from "tabler-icons/tsx/copy.tsx";
import IconDots from "tabler-icons/tsx/dots.tsx";
import IconTrash from "tabler-icons/tsx/trash.tsx";

export const PipelineMenu = ({ id }: { id?: string }) => (
  <>
    <div
      id="pipelineMenuButton"
      data-dropdown-toggle="pipeline-menu"
      type="button"
      className="cursor-pointer"
    >
      <IconDots class="w-6 h-6 ml text-lunar cursor-pointer" />
    </div>

    <div
      id="pipeline-menu"
      class="z-40 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700"
    >
      <ul
        class="py-2 text-sm text-gray-700 dark:text-gray-200"
        aria-labelledby="pipelineMenuButton"
      >
        <a href="#">
          <li className="flex flex-start items-center px-2 py-2 hover:bg-sunset text-sm">
            <IconCopy class="w-4 h-4 mr-2" />
            Duplicate Pipeline
          </li>
        </a>
        <a href={`/pipelines/${id}/delete`}>
          <li className="cursor-pointer group flex w-full items-center py-2 px-2 text-eyelid hover:text-white hover:bg-eyelid text-sm">
            <IconTrash class="w-4 h-4 mr-2 text-eyelid group-hover:text-white" />
            Delete
          </li>
        </a>
      </ul>
    </div>
  </>
);
