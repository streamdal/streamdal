import { Handle, Position } from "reactflow";
import { ParticipantsMenu } from "../rules/participantsMenu.tsx";

const handleStyle = { left: 10 };

export const Service = ({ data }) => {
  return (
    <div className={"h-[100px]"}>
      <div
        className={"h-[80px] w-[271px] flex items-center justify-between bg-white rounded shadow-lg z-10 border-1 px-4"}
      >
        <img
          src={"/images/service-placeholder-icon.png"}
          className={"h-[60px]"}
        />
        <h2 className={"text-xl mr-3"}>$Service Name</h2>
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
    <div className={"h-[96px] flex items-center z-40"}>
      <div
        className={"w-[185px] h-[56px] bg-white rounded shadow-lg flex items-center justify-between px-3"}
      >
        <img src={"/images/placeholder-icon.png"} className="w-[30px]" />
        <h2 className={"text-lg"}>
          {data.label}
        </h2>
        <ParticipantsMenu id={data.label} />
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
      className={"h-[224px] w-[224px] z-10 flex items-center justify-center"}
    >
      <p className={"z-10 absolute text-white"}>Testing</p>
      <div
        className={"bg-web rounded-md border-1 border-black rotate-45 h-[145px] w-[145px] shadow-xl"}
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
