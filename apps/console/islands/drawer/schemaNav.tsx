import { useEffect, useState } from "preact/hooks";
import { Audience } from "streamdal-protos/protos/sp_common.ts";
import IconWindowMaximize from "tabler-icons/tsx/window-maximize.tsx";
import { Tooltip } from "../../components/tooltip/tooltip.tsx";
import { audienceKey, getAudienceOpRoute } from "../../lib/utils.ts";

export const SchemaNav = (
  { audience }: { audience: Audience },
) => {
  const key = audienceKey(audience);
  const [schema, setSchema] = useState({
    schema: "",
    version: 0,
    metaData: "",
  });
  const getSchema = async () => {
    try {
      const response = await fetch(`${getAudienceOpRoute(audience)}/schema`, {
        method: "GET",
      });

      setSchema(await response.json());
    } catch (e) {
      console.error("Error fetching schema", e);
    }
  };

  useEffect(() => {
    void getSchema();
  }, [audience]);

  return (
    <>
      <div className="w-full rounded flex overflow-x-scroll bg-black text-white pt-2 pb-6 px-4 text-sm flex flex-col justify-start">
        <div class={"w-full flex justify-end"}>
          <a
            href={`/schema/${encodeURIComponent(key)}`}
            f-partial={`/partials/schema/${encodeURIComponent(key)}`}
            className="cursor-pointer"
            data-tooltip-target="maximize"
          >
            <IconWindowMaximize class="w-5 h-5 text-white mx-1 my-1 pointer-events-none" />
          </a>

          <Tooltip
            targetId="maximize"
            message={"Click to maximize schema"}
          />
        </div>
        <pre className={"h-[150px]"}>
          <code class={"schema"}>
            <div
                class={"font-sm "}
                dangerouslySetInnerHTML={{
                    __html: schema.schema
                }}
            >
            </div>
          </code>
        </pre>
      </div>
    </>
  );
};
