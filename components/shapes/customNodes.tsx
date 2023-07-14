import { Handle, Position } from "reactflow";
import { ParticipantsMenu } from "../rules/participantsMenu.tsx";

const handleStyle = { left: 10 };

export const Service = ({ data }) => {
  return (
    <div class="h-[100px]">
      <div class="h-[80px] w-[271px] flex items-center justify-between bg-white rounded shadow-lg z-10 border-1 border-purple-200 px-4">
        <img
          src={"/images/service-placeholder-icon.png"}
          className={"h-[60px]"}
        />
        <div>
          <h2 className={"text-xl mr-3"}>$Service Name</h2>
          <p class="text-streamdalPurple text-xs font-semibold mt-1">
            4 instances
          </p>
        </div>
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
    <div className="h-[96px] flex items-center z-40">
      <div className="w-[185px] h-[56px] bg-white rounded-md shadow-lg border-1 border-purple-200 flex items-center justify-between px-3">
        <img src={"/images/placeholder-icon.png"} className="w-[30px]" />
        <div className={"flex flex-col"}>
          <h2 className={"text-md"}>
            Item Name
          </h2>
          <h3 class="text-sm text-gray-500">{data.label}</h3>
        </div>
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
      <p className={"z-10 absolute text-white"}>Kafka</p>
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
