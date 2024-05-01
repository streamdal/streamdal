import { useEffect, useRef } from "preact/hooks";
import { showNav } from "root/components/nav/signals.ts";
import IconBell from "tabler-icons/tsx/bell.tsx";
import IconFileDownload from "tabler-icons/tsx/file-download.tsx";
import IconListCheck from "tabler-icons/tsx/list-check.tsx";
import IconMenu2 from "tabler-icons/tsx/menu-2.tsx";
import IconHome from "tabler-icons/tsx/home.tsx";
import IconUsers from "tabler-icons/tsx/users.tsx";
import IconLogout from "tabler-icons/tsx/logout.tsx";

export const NavBar = () => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const clickAway = (event: any) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        showNav.value = false;
      }
    };
    document.addEventListener("mousedown", clickAway);
    return () => {
      document.removeEventListener("mousedown", clickAway);
    };
  }, [menuRef]);

  return (
    <div ref={menuRef}>
      <ul
        class={`${
          showNav.value ? "" : "hidden"
        } z-50 fixed mt-[70px] top-0 left-0 font-medium bg-white ml-4 w-72 rounded border shadow`}
        onClick={() => showNav.value = false}
      >
        <li>
          <a
            href="/"
            f-partial="/partials"
            className="flex items-center p-2 text-gray-900 hover:bg-sunset group"
          >
            <IconHome class="w-6 h-6 text-gray-500 pointer-events-none" />
            <span class="ml-3">Dashboard</span>
          </a>
        </li>
        <li>
          <a
            href="/pipelines"
            f-partial="/partials/pipelines"
            className="flex items-center p-2 text-gray-900 hover:bg-sunset group"
          >
            <IconListCheck class="w-6 h-6 text-gray-500 pointer-events-none" />
            <span class="ml-3">Pipelines</span>
          </a>
        </li>
        <li>
          <a
            href="/notifications"
            f-partial="/partials/notifications"
            className="flex items-center p-2 text-gray-500 hover:bg-sunset group"
          >
            <IconBell class="w-6 h-6 pointer-events-none" />
            <span class="ml-3 text-gray-900">Notifications</span>
          </a>
        </li>
        <li>
          <a
            className="flex items-center p-2 text-gray-500 hover:bg-sunset group"
            target="_download"
            href="/configs"
          >
            <IconFileDownload class="w-6 h-6" />
            <span class="ml-3 text-gray-900">
              Download Configs
            </span>
          </a>
        </li>
        <li className="cursor-not-allowed">
          <div className="flex items-center p-2 text-gray-400 hover:bg-sunset group ">
            <IconUsers class="w-6 h-6" />
            <span class="flex-1 ml-3 whitespace-nowrap">Users</span>
          </div>
        </li>
        <li>
          <div class="flex items-center p-2 text-gray-400 hover:bg-sunset group cursor-not-allowed">
            <IconLogout class="w-6 h-6" />
            <span class="flex-1 ml-3 whitespace-nowrap">Sign Out</span>
          </div>
        </li>
      </ul>
      <div
        className="sticky top-0 left-0 flex flex-row items-center w-full h-16 bg-white border-1 border-gray-100 shadow-sm rounded-br-lg"
        onClick={() => showNav.value = false}
      >
        <IconMenu2
          class="w-6 h-6 ml-4 cursor-pointer"
          onClick={(e: MouseEvent) => {
            e.stopPropagation();
            showNav.value = !showNav.value;
          }}
        />

        <a href="/" f-partial="/partials" type="submit" class="outline-none ">
          <img src="/images/logo.png" className="z-50 w-199 ml-3 my-1" />
        </a>
      </div>
    </div>
  );
};
