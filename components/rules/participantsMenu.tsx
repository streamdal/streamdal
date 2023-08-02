import {Edit, Info, Pause, Silence} from "../icons/crud.tsx";
import IconDots from "https://deno.land/x/tabler_icons_tsx@0.0.3/tsx/dots.tsx";
import {useState} from "https://esm.sh/stable/preact@10.15.1/denonext/hooks.js";

export const ParticipantsMenu = ({id}: { id: string }) => {
    const [isOpen, setIsOpen] = useState();

    const handleClick = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className={"rounded bg-purple-50 ml-4"}>
            <div
                id="dropdownButton"
                type="button"
                class="cursor-pointer"
                onClick={handleClick}
            >
                <IconDots class="w-6 h-6 text-gray-400" aria-hidden="true"/>
            </div>
            <div
                id={`flow-${id}`}
                className={`z-40 bg-white divide-y divide-gray-100 rounded-lg shadow w-[200px] dark:bg-gray-700 top-20 absolute ${
                    isOpen ? null : "hidden"
                }`}
            >
                <ul
                    class="py-2 text-sm text-gray-700 dark:text-gray-200"
                    aria-labelledby="dropdownButton"
                >
                    <a href="#">
                        <li className="flex w-full flex-start px-2 py-2 hover:bg-sunset text-sm">
                            <Edit className="text-red mx-2"/>
                            Edit Rules
                        </li>
                    </a>
                    <a href="#">
                        <li className="flex w-full flex-start py-2 px-2 hover:bg-sunset text-sm">
                            <Silence className="text-web mx-2"/>
                            Silence Notifications
                        </li>
                    </a>
                    <a href="#">
                        <li className="flex w-full flex-start py-2 px-2 hover:bg-sunset text-sm">
                            <Info className="w-4 text-web mx-1"/>
                            More Information
                        </li>
                    </a>
                    <a href="#">
                        <li className="group flex w-full flex-start py-2 px-2 text-eyelid hover:text-white hover:bg-eyelid text-sm">
                            <Pause className="w-4 mx-1 text-eyelid group-hover:text-white fill-current"/>
                            Pause
                        </li>
                    </a>
                </ul>
            </div>
        </div>
    );
};
