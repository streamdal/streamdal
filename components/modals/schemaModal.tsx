import { OP_MODAL_WIDTH } from "../../islands/drawer/infoDrawer.tsx";
import { opModal } from "../serviceMap/opModalSignal.ts";
import { humanDateFormat } from "../../lib/utils.ts";
import IconX from "tabler-icons/tsx/x.tsx";

export const SchemaUpdated = (
  { updatedDate }: { updatedDate?: strin },
) => {
  try {
    return (
      updatedDate
        ? (
          <img
            class="ml-2"
            alt="Schema Version"
            src={`https://img.shields.io/badge/updated-${
              new Date(updatedDate).toLocaleDateString(
                "en-us",
                humanDateFormat,
              )
            }-4595e6`}
          />
        )
        : null
    );
  } catch (e) {
    console.error("error getting schema updated date", e);
  }
  return null;
};

export const SchemaModal = () => {
  return (
    <div
      class={`absolute h-screen w-[calc(100vw-${OP_MODAL_WIDTH})] z-50`}
    >
      <div
        id="schemaModal"
        aria-modal="true"
        class="absolute mt-12 z-40 w-full h-full px-4 py-2 max-h-full justify-evenly items-center flex"
        role="dialog"
      >
        <div class="relative h-full w-[700px] min-w-[400px] max-w-5xl">
          <div class="flex justify-center relative bg-white h-5/6 overflow-y-auto rounded-lg shadow-2xl shadow-stormCloud">
            <IconX
              class="w-6 h-6 absolute right-0 mt-2 mr-2 cursor-pointer hover:text-gray-200"
              onClick={() =>
                opModal.value = {
                  ...opModal.value,
                  schemaModal: false,
                }}
            />
            <div className="w-full mx-6 mt-10 mb-6 p-4 rounded flex overflow-x-scroll bg-black text-white text-base flex flex-col justify-start">
              <div class="flex flex-row justify-start items-center">
                <img
                  alt="Schema Version"
                  src={`https://img.shields.io/badge/version-${opModal.value?.schemaInfo?.version}-956CFF`}
                />
                <SchemaUpdated
                  updatedDate={opModal.value?.schemaInfo?.metaData
                    ?.last_updated}
                />
              </div>
              <pre>
                <code>
                  <div
                      class={"py-2"}
                      dangerouslySetInnerHTML={{
                        __html: opModal.value?.schemaInfo?.schema ? opModal.value.schemaInfo.schema:
                          ""
                      }}
                  >
                  </div>
                </code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
