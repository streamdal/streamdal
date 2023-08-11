import IconX from "tabler-icons/tsx/x.tsx";
import { useRef } from "preact/denonext/hooks.js";
import { Operation } from "../customNodes.tsx";

export const ExpandedNodes = ({ nodes, params }) => {
  const actorType = params.operationType === "consumer" ? 1 : 2;
  const filteredNodes = nodes.filter((item) =>
    item.audience.operationType === actorType
  ).map((actor) => {
    return {
      label: actor.audience.operationName,
      pipeline: actor,
      params: params,
    };
  });

  const toClose = useRef(null);

  return (
    <div
      class={"w-screen h-screen absolute top-0 bottom-0 scroll-none inset-0 flex justify-center items-center"}
    >
      <div class={"z-50 bg-gray-900 opacity-30 absolute w-full h-full"}></div>
      <div
        class={"absolute z-50 h-1/2 flex flex-col justify-center items-center"}
      >
        <div class={"w-[520px] flex justify-end mr-[-50px]"}>
          <a href="/">
            <button
              type="button"
              className="text-gray-900 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center"
            >
              <IconX class="w-6 h-6" />
            </button>
          </a>
        </div>
        <div
          class={`w-[520px] flex ${
            filteredNodes.length > 1 ? "justify-between" : "justify-center"
          } items-center z-50 flex-wrap`}
          ref={toClose}
        >
          {filteredNodes.map((item) => {
            <Operation data={item} />;
          })}
        </div>
      </div>
    </div>
  );
};
