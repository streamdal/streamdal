import {Handle, Position} from "reactflow";
import {ParticipantsMenu} from "./rules/participantsMenu.tsx";
import IconGripVertical from "https://deno.land/x/tabler_icons_tsx@0.0.3/tsx/grip-vertical.tsx";
import "flowbite";
import "twind";
import {useState} from "https://esm.sh/stable/preact@10.15.1/denonext/hooks.js";

const getHandlePosition = (input: string) => {
    return input === "top" ? Position.Top : Position.Bottom;
};

export const Service = ({data}) => {
    return (
        <div class="h-[100px]">
            <div
                class="h-[80px] w-[280px] flex items-center justify-between bg-white rounded shadow-lg z-10 border-1 border-purple-200 px-2">
                <IconGripVertical
                    class="w-6 h-6 text-purple-100 cursor-grab"
                    id="dragHandle"
                />
                <img
                    src={"/images/placeholder-icon.png"}
                    className={"h-[40px]"}
                />
                <div>
                    <h2 className={"text-lg mr-3"}>$Service Name</h2>
                    <p class="text-streamdalPurple text-xs font-semibold mt-1">
                        4 instances
                    </p>
                </div>
                <ParticipantsMenu id={data.label}/>
            </div>
            <div
                class="absolute inline-flex items-center justify-evenly w-8 h-5 text-xs text-[#652015] bg-red-200 rounded-md -top-2 -right-2 dark:border-gray-900">
                <svg
                    width="11"
                    height="12"
                    viewBox="0 0 11 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M7.41667 9.16667H10.3333L9.51375 8.34708C9.40369 8.237 9.31639 8.10631 9.25684 7.96248C9.19728 7.81865 9.16664 7.6645 9.16667 7.50883V5.66667C9.16676 4.94271 8.94242 4.23653 8.52455 3.64535C8.10668 3.05417 7.51583 2.60706 6.83333 2.36558V2.16667C6.83333 1.85725 6.71042 1.5605 6.49162 1.34171C6.27283 1.12292 5.97609 1 5.66667 1C5.35725 1 5.0605 1.12292 4.84171 1.34171C4.62292 1.5605 4.5 1.85725 4.5 2.16667V2.36558C3.14083 2.84625 2.16667 4.143 2.16667 5.66667V7.50942C2.16667 7.82325 2.04183 8.12483 1.81958 8.34708L1 9.16667H3.91667M7.41667 9.16667H3.91667M7.41667 9.16667V9.75C7.41667 10.2141 7.23229 10.6592 6.9041 10.9874C6.57592 11.3156 6.1308 11.5 5.66667 11.5C5.20254 11.5 4.75742 11.3156 4.42923 10.9874C4.10104 10.6592 3.91667 10.2141 3.91667 9.75V9.16667"
                        stroke="#652015"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />
                </svg>
                8
            </div>
            <span class="sr-only">Notifications</span>

            <div className={"flex justify-evenly w-1/2 mt-2"}>
                <Handle
                    type="target"
                    id="c"
                    position={Position.Bottom}
                    style={{opacity: 0, background: "#FFFFFF", position: "relative"}}
                />
                <Handle
                    type="source"
                    id="d"
                    position={Position.Bottom}
                    style={{opacity: 0, background: "#FFFFFF", position: "relative"}}
                />
            </div>
        </div>
    );
};

export const Participants = ({data}) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const handleModalOpen = () => {
        setIsOpen(true);
    };

    return (
        <div className="h-[96px] flex items-center z-40">
            <div
                data-popover-target="popover"
                data-popover-trigger="hover"
                type="button"
                onClick={handleModalOpen}
                className="w-[205px] h-[64px] bg-white rounded-md shadow-lg border-1 border-purple-200 flex items-center justify-between px-1"
            >
                <IconGripVertical
                    class="w-6 h-6 text-purple-100 cursor-grab"
                    id="dragHandle"
                />
                <img src={"/images/placeholder-icon.png"} className="w-[30px]"/>
                <a href={`/flow/${data.label.toLowerCase()}`}>
                    <div className={"flex flex-col"}>
                        <h2 className={"text-[16px]"}>
                            Item Name
                        </h2>
                        <h3 class="text-xs text-gray-500">{data.label}</h3>
                    </div>
                </a>
                <ParticipantsMenu id={data.label}/>
            </div>
            <div
                data-popover
                id="popover"
                role="tooltip"
                class="absolute z-10 invisible inline-block w-64 text-sm text-gray-500 transition-opacity duration-300 bg-white border border-gray-200 rounded-lg shadow-sm opacity-0 dark:text-gray-400 dark:border-gray-600 dark:bg-gray-800"
            >
                <div
                    class="px-3 py-2 bg-gray-100 border-b border-gray-200 rounded-t-lg dark:border-gray-600 dark:bg-gray-700">
                    <h3 class="font-semibold text-gray-900 dark:text-white">
                        Popover no arrow
                    </h3>
                </div>
                <div class="px-3 py-2">
                    <p>And here's some amazing content. It's very engaging. Right?</p>
                </div>
            </div>
            <span class="sr-only">Notifications</span>
            <div
                class="absolute inline-flex items-center justify-evenly w-8 h-5 text-xs text-[#652015] bg-red-200 rounded-md top-2 -right-2 dark:border-gray-900">
                <svg
                    width="11"
                    height="12"
                    viewBox="0 0 11 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M7.41667 9.16667H10.3333L9.51375 8.34708C9.40369 8.237 9.31639 8.10631 9.25684 7.96248C9.19728 7.81865 9.16664 7.6645 9.16667 7.50883V5.66667C9.16676 4.94271 8.94242 4.23653 8.52455 3.64535C8.10668 3.05417 7.51583 2.60706 6.83333 2.36558V2.16667C6.83333 1.85725 6.71042 1.5605 6.49162 1.34171C6.27283 1.12292 5.97609 1 5.66667 1C5.35725 1 5.0605 1.12292 4.84171 1.34171C4.62292 1.5605 4.5 1.85725 4.5 2.16667V2.36558C3.14083 2.84625 2.16667 4.143 2.16667 5.66667V7.50942C2.16667 7.82325 2.04183 8.12483 1.81958 8.34708L1 9.16667H3.91667M7.41667 9.16667H3.91667M7.41667 9.16667V9.75C7.41667 10.2141 7.23229 10.6592 6.9041 10.9874C6.57592 11.3156 6.1308 11.5 5.66667 11.5C5.20254 11.5 4.75742 11.3156 4.42923 10.9874C4.10104 10.6592 3.91667 10.2141 3.91667 9.75V9.16667"
                        stroke="#652015"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />
                </svg>
                4
            </div>
            <Handle
                type="source"
                position={getHandlePosition(data.source)}
                style={{opacity: 0}}
            />
            <Handle
                type="target"
                position={getHandlePosition(data.target)}
                style={{opacity: 0}}
            />
        </div>
    );
};

export const Platform = ({data}) => {
    return (
        <div
            className={"z-0 bg-web rounded-md border-1 border-black h-[145px] w-[145px] shadow-xl flex justify-center" +
                " items-center"}
        >
            <div className={"flex justify-center flex-col items-center"}>
                <img src={"/images/kafka-dark.svg"} className="w-[30px]"/>
                <p className={"z-10 mt-2 text-white"}>Kafka</p>
            </div>
            <Handle
                type="source"
                position={Position.Left}
                id="a"
                style={{opacity: 0}}
            />
            <Handle
                type="target"
                position={Position.Right}
                id="b"
                style={{opacity: 0}}
            />
        </div>
    );
};
