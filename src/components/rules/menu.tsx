import { Menu } from "@headlessui/react";
import React from "react";
import { Kebab } from "../icons/nav";
import { Delete, Edit, View } from "../icons/crud";
import { EyeIcon } from "@heroicons/react/20/solid";
import { Dropdown, Navbar } from "flowbite-react";

export const RuleSetMenu = ({ id }: { id: string }) => {
  return (
    <Menu as="div" className="text-right align-text-bottom pt-[6px] relative">
      <div>
        <Menu.Button>
          <Kebab className="hover:text-web h-[20px]" aria-hidden="true" />
        </Menu.Button>
      </div>

      <Menu.Items className="absolute z-[100] right-0 mt-2 mr-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none opacity-100">
        <div className="p-2 pb-1">
          <Menu.Item>
            {({ active }) => (
              <a href={`/ruleset?id=${id}`}>
                <button
                  className={`${
                    active ? "bg-sunset" : ""
                  } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                >
                  <EyeIcon
                    className="w-[14px] mr-2 text-web"
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
              <a href={`/ruleset/edit?id=${id}`}>
                <button
                  className={`${
                    active ? "bg-sunset" : ""
                  } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                >
                  <Edit className="mr-2 text-web" aria-hidden="true" />
                  Edit
                </button>
              </a>
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

export const NewRuleSetMenu = ({ id }: { id: string }) => {
  return (
    <Dropdown
      inline
      label={<Kebab className="hover:text-web h-[20px]" aria-hidden="true" />}
      arrowIcon={false}
      className="w-48"
    >
      <a href={`/ruleset?id=${id}`}>
        <Dropdown.Item icon={View}>View</Dropdown.Item>
      </a>
      <a href={`/ruleset/edit?id=${id}`}>
        <Dropdown.Item icon={Edit}>Edit</Dropdown.Item>
      </a>
      <a href={`/ruleset/delete/?id=${id}`}>
        <Dropdown.Item
          className="hover:bg-red-400 hover:text-white hover:fill-white"
          icon={Delete}
        >
          Delete
        </Dropdown.Item>
      </a>
    </Dropdown>
  );
};
