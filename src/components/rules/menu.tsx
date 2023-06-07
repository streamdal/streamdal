import { Menu } from "@headlessui/react";
import { EyeIcon } from "@heroicons/react/20/solid";
import React from "react";
import { Kebab } from "../icons/nav";
import { Delete, Edit } from "../icons/crud";

export const RuleSetMenu = ({ id }: { id: string }) => {
  return (
    <Menu as="div" className="text-right align-text-bottom pt-[6px] relative">
      <div>
        <Menu.Button>
          <Kebab className="hover:text-shadow h-[20px]" aria-hidden="true" />
        </Menu.Button>
      </div>

      <Menu.Items className="absolute z-[100] right-0 mt-2 mr-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none opacity-100">
        <div className="p-2 pb-1">
          <Menu.Item>
            {({ active }) => (
              <a href={`/ruleset/?id=${id}`}>
                <button
                  className={`${
                    active ? "bg-sunset" : ""
                  } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                >
                  <EyeIcon
                    className="mr-2 text-web w-[14px]"
                    aria-hidden="true"
                  />
                  View
                </button>
              </a>
            )}
          </Menu.Item>
        </div>
        <div className="p-2 pb-1">
          <Menu.Item>
            {({ active }) => (
              <button
                className={`${
                  active ? "bg-sunset" : ""
                } group flex w-full items-center rounded-md px-2 py-2 text-sm cursor-not-allowed`}
              >
                <Edit className="mr-2 text-web" aria-hidden="true" />
                Edit
              </button>
            )}
          </Menu.Item>
        </div>
        <div className="p-2 pt-1">
          <Menu.Item>
            {({ active }) => (
              <a href={`/ruleset/delete/?id=${id}`}>
                <button
                  className={`${
                    active ? "bg-eyelid text-white" : "text-eyelid"
                  } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                >
                  <Delete
                    className="mr-2"
                    fill={active ? "white" : "#FF7D68"}
                    aria-hidden="true"
                  />
                  Delete
                </button>
              </a>
            )}
          </Menu.Item>
        </div>
      </Menu.Items>
    </Menu>
  );
};
