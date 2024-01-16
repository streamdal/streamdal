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
