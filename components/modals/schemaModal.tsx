import { opModal } from "../serviceMap/opModalSignal.ts";
import IconWindowMaximize from "tabler-icons/tsx/window-maximize.tsx";
import hljs from "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/es/highlight.min.js";
import { OP_MODAL_WIDTH } from "../../islands/opModal.tsx";

export const SchemaModal = (
  { schema, version, setClose }: {
    schema: string;
    version: number;
    setClose: () => void;
  },
) => {
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
            <button
              type="button"
              className="absolute right-0 mt-1 mr-1 flex justify-center items-center text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8"
              onClick={() => setClose()}
            >
              <svg
                className="w-3 h-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 14"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                />
              </svg>
              <span class="sr-only">Close modal</span>
            </button>
            <div className="w-full mx-6 mt-10 mb-6 p-4 rounded flex overflow-x-scroll bg-black text-white text-base flex flex-col justify-start">
              <img
                alt="Static Badge"
                className={"w-16 h-5 mb-5"}
                src={`https://img.shields.io/badge/version-${version}-956CFF`}
              />
              <pre>
              <code>
                <div
                    class={"pb-2 px-4"}
                    dangerouslySetInnerHTML={{
                      __html: `${
                          hljs.highlight(`${schema}`, {language: 'json'})
                              .value
                      }`,
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
