import IconWindowMaximize from "tabler-icons/tsx/window-maximize.tsx";
import { Tooltip } from "../../components/tooltip/tooltip.tsx";
import { getAudienceOpRoute } from "../../lib/utils.ts";
import { Audience } from "streamdal-protos/protos/sp_common.ts";
import { useEffect } from "preact/hooks";
import { opModal } from "../../components/serviceMap/opModalSignal.ts";

export const Schema = (
  { audience }: { audience: Audience },
) => {
  const getSchema = async () => {
    const response = await fetch(`${getAudienceOpRoute(audience)}/schema`, {
      method: "GET",
    });
    return response.json();
  };

  useEffect(async () => {
    try {
      const schemaInfo = await getSchema();
      opModal.value = {
        ...opModal.value,
        schemaInfo,
      };
    } catch (e) {
      console.error("Error fetching schema", e);
    }
  }, [audience]);

  return (
    <>
      <div
        class={"flex w-full items-center justify-start mb-5 "}
      >
        <p class="text-left text-gray-400 mr-2 text-sm">
          Display
        </p>
        <button
          id="dropdownCheckboxButton"
          className="text-web font-medium text-sm text-center inline-flex items-center"
          type="button"
        >
          JSON
          <svg
            class="w-2.5 h-2.5 ml-2.5"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 10 6"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="m1 1 4 4 4-4"
            />
          </svg>
        </button>
      </div>

      <div className="w-full rounded flex overflow-x-scroll bg-black text-white pt-2 pb-6 px-4 text-sm flex flex-col justify-start">
        <div class={"w-full flex justify-end"}>
          <button
            className={"cursor-pointer"}
            onClick={() =>
              opModal.value = {
                ...opModal.value,
                schemaModal: !opModal.value?.schemaModal,
              }}
            data-tooltip-target="maximize"
          >
            <IconWindowMaximize class="w-5 h-5 text-white mx-1 my-1" />
          </button>
          <Tooltip
            targetId="maximize"
            message={"Click to maximize schema"}
          />
        </div>
        <pre className={"h-[150px]"}>
          <code>
            <div
                class={"font-sm "}
                dangerouslySetInnerHTML={{
                    __html: opModal.value?.schemaInfo?.schema ? opModal.value.schemaInfo?.schema:
                        ""
                }}
            >
            </div>
          </code>
        </pre>
      </div>
    </>
  );
};
