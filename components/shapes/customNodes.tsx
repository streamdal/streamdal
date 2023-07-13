import { memo } from "react";
import { Handle, Position } from "reactflow";
import IconChevronDown from "https://deno.land/x/tabler_icons_tsx@0.0.3/tsx/chevron-down.tsx";

const handleStyle = { left: 10 };

export const Service = ({ data }) => {
  return (
    <div className={"h-[100px]"}>
      <div
        className={"h-[80px] w-[271px] flex items-center justify-center bg-white rounded shadow-lg z-10 border-1"}
      >
        <h2 className={"text-xl"}>$Service Name</h2>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2 h-2 bg-purple-500"
      />
    </div>
  );
};

export const Participants = ({ data }) => {
  return (
    <div className={"h-[96px] flex items-center"}>
      <div
        className={"w-[185px] h-[56px] bg-white rounded shadow-lg flex items-center justify-center"}
      >
        <h2 className={"text-lg"}>
          {data.label}
        </h2>
        <IconChevronDown class="w-6 h-6 ml-2" />
      </div>
      <Handle
        type="target"
        position={Position.Top}
        className="bg-transparent"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2 h-2 bg-purple-500"
      />
    </div>
  );
};

export const Platform = ({ data }) => {
  return (
    <div
      className={"h-[224px] w-[224px] flex items-center justify-center z-10 border-1"}
    >
      <p className={"z-10 absolute text-white"}>Testing</p>
      <div
        className={"bg-web rounded-md border-1 border-black rotate-45 h-[145px] w-[145px] shadow-lg"}
      >
      </div>
      <Handle
        type="target"
        position={Position.Left}
        id="a"
        className="bg-transparent"
      />
      <Handle
        type="target"
        position={Position.Right}
        id="b"
        className="bg-transparent"
      />
    </div>
  );
};
