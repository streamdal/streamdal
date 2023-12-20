import IconDots from "tabler-icons/tsx/dots.tsx";
import IconTrash from "tabler-icons/tsx/trash.tsx";

export const NotificationMenu = ({ id }: { id?: string }) => (
  <>
    <div
      id="notificationMenuButton"
      data-dropdown-toggle="notification-menu"
      type="button"
      className="cursor-pointer"
    >
      <IconDots class="w-6 h-6 ml text-lunar cursor-pointer" />
    </div>

    <div
      id="notification-menu"
      class="z-40 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-44"
    >
      <ul
        class="py-2 text-sm text-gray-700"
        aria-labelledby="notificationMenuButton"
      >
        <a href={`/notifications/${id}/delete`}>
          <li className="cursor-pointer group flex w-full items-center py-2 px-2 text-eyelid hover:text-white hover:bg-eyelid text-sm">
            <IconTrash class="w-4 h-4 mr-2 text-eyelid group-hover:text-white" />
            Delete
          </li>
        </a>
      </ul>
    </div>
  </>
);
