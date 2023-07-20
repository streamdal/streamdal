import { Handle, Position } from "reactflow";
import { ParticipantsMenu } from "../rules/participantsMenu.tsx";
import IconGripVertical from "https://deno.land/x/tabler_icons_tsx@0.0.3/tsx/grip-vertical.tsx";

// const handleStyle = { left: 2 };

const getHandlePosition = (input: any) => {
  if (input === "top") {
    return Position.Top;
  } else {
    return Position.Bottom;
  }
};

export const Service = ({ data }) => {
  return (
    <div class="h-[100px]">
      <div class="h-[80px] w-[280px] flex items-center justify-between bg-white rounded shadow-lg z-10 border-1 border-purple-200 px-2">
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
        <ParticipantsMenu id={data.label} />
      </div>
      <div className={"flex justify-evenly w-1/2 mt-2"}>
        <Handle
          type="target"
          id="c"
          position={Position.Bottom}
          className="bg-transparent border-0 relative"
        />
        <Handle
          type="source"
          id="d"
          position={Position.Bottom}
          className="bg-transparent border-0 relative"
        />
      </div>
    </div>
  );
};

export const Participants = ({ data }) => {
  return (
    <div className="h-[96px] flex items-center z-40">
      <div className="w-[205px] h-[64px] bg-white rounded-md shadow-lg border-1 border-purple-200 flex items-center justify-between px-1">
        <IconGripVertical
          class="w-6 h-6 text-purple-100 cursor-grab"
          id="dragHandle"
        />
        <img src={"/images/placeholder-icon.png"} className="w-[30px]" />
        <div className={"flex flex-col"}>
          <h2 className={"text-[16px]"}>
            Item Name
          </h2>
          <h3 class="text-xs text-gray-500">{data.label}</h3>
        </div>
        <ParticipantsMenu id={data.label} />
      </div>
      <Handle
        type="source"
        position={getHandlePosition(data.source)}
        className="bg-transparent border-0"
      />
      <Handle
        type="target"
        position={getHandlePosition(data.target)}
        className="bg-transparent border-0"
      />
    </div>
  );
};

export const Platform = ({ data }) => {
  return (
    <div
      className={"z-0 bg-web rounded-md border-1 border-black h-[145px] w-[145px] shadow-xl flex justify-center" +
        " items-center"}
    >
      <p className={"z-10 text-white"}>Kafka</p>
      <Handle
        type="source"
        position={Position.Left}
        id="a"
        className="bg-transparent border-0"
      />
      <Handle
        type="target"
        position={Position.Right}
        id="b"
        className="bg-transparent border-0"
      />
    </div>
  );
};
