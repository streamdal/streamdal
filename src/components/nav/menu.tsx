import { Menu } from "@headlessui/react";
import React from "react";
import { Slack } from "../icons/social";
import { MonitorIcon } from "../icons/streamdal";
import { Bars3Icon } from "@heroicons/react/20/solid";

export const NavMenu = () => {
  return (
    <Menu as="div" className="text-right align-text-bottom pt-[6px] relative">
      <div>
        <Menu.Button>
          <Bars3Icon className="mr-4 w-[20px] text-white cursor-pointer" />
        </Menu.Button>
      </div>

      <Menu.Items className="absolute z-[100] right-0 mt-2 mr-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none opacity-100">
        <div className="p-2 pb-1">
          <Menu.Item>
            {({ active }) => (
              <a href={`/`}>
                <button
                  className={`${
                    active ? "bg-sunset" : ""
                  } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                >
                  <MonitorIcon className="w-[14px] mr-2" aria-hidden="true" />
                  Rules
                </button>
              </a>
            )}
          </Menu.Item>
        </div>
        <div className="p-2 pt-1">
          <Menu.Item>
            {({ active }) => (
              <a href={`/slack`}>
                <button
                  className={`${
                    active ? "bg-sunset" : ""
                  } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                >
                  <Slack className="w-[18px] mr-2" aria-hidden="true" />
                  Slack
                </button>
              </a>
            )}
          </Menu.Item>
        </div>
      </Menu.Items>
    </Menu>
  );
};
