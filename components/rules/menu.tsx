import {Kebab} from "../icons/nav.tsx";
import IconEye from "https://deno.land/x/tabler_icons_tsx@0.0.3/tsx/eye.tsx";
import {Info, Pause} from "../icons/crud.tsx";

export const RuleMenu = ({id}: { id: string }) => (
    <div className="z-40">
        <div
            id="dropdownDefaultButton"
            data-dropdown-toggle="rule-dropdown"
            type="button"
            className="cursor-pointer z-40"
        >
            <Kebab
                className="hover:text-web h-[20px] relative"
                aria-hidden="true"
            />
        </div>

        <div
            id="rule-dropdown"
            class="z-40 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700"
        >
            <ul
                class="py-2 text-sm text-gray-700 dark:text-gray-200"
                aria-labelledby="dropdownDefaultButton"
            >
                <a href="#">
                    <li className="flex w-full flex-start px-2 py-2 hover:bg-sunset text-sm">
                        <IconEye className="w-5 h-5 text-red mx-1"/>
                        View
                    </li>
                </a>
                <a href="#">
                    <li className="flex w-full flex-start py-2 px-2 hover:bg-sunset text-sm">
                        <Info className="w-4 text-web mx-1"/>
                        Edit
                    </li>
                </a>
                <a href="#" className={"flex items-center"}>
                    <li className="group flex w-full items-center py-2 px-2 text-eyelid hover:text-white hover:bg-eyelid text-sm">
                        <Pause className="w-4 h-4 mx-1 text-eyelid group-hover:text-white"/>
                        Delete
                    </li>
                </a>
            </ul>
        </div>
    </div>
);
