import { useEffect, useRef, useState } from "preact/hooks";
import { demoHttpRequestSocket } from "../../lib/sockets.ts";
import {
  demoHttpRequestSignal,
  HttpRequestType,
} from "../../routes/demo/http/index.tsx";
import IconPlayerPlayFilled from "tabler-icons/tsx/player-play-filled.tsx";
import IconPlayerPauseFilled from "tabler-icons/tsx/player-pause-filled.tsx";

export const RequestRow = (
  { request }: { request: HttpRequestType },
) => {
  return (
    <div className="bg-black text-white py-2 px-4 text-sm flex flex-col justify-start dark-scrollbar border-b border-stormCloud">
      <div className="text-stormCloud w-full">
        {request.time}
      </div>
      <div class="flex flex-col justify-between item-center w-full">
        <div class="w-full overflow-x-scroll my">
          <div className="text-stormCloud text-sm mb">
            method: {request.method}
          </div>
        </div>
        <div class="w-full overflow-x-scroll my">
          <div className="text-stormCloud text-sm mb">
            headers:
          </div>
          <div>
            <pre>
                <code>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: JSON.stringify(request.headers, null, 2)
                    }}
                  >
                  </div>
                </code>
            </pre>
          </div>
        </div>
        <div class="w-full overflow-x-scroll my">
          <div className="text-stormCloud text-sm mb">
            body:
          </div>
          <div>
            <pre>
                <code>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: JSON.stringify(request.data, null, 2)
                    }}
                  >
                  </div>
                </code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export const DemoHttpRequest = () => {
  const scrollBottom = useRef<HTMLDivElement | null>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const socket = demoHttpRequestSocket(
      "/ws/demo/http-request",
    );
    return () => {
      socket?.close();
    };
  }, []);

  useEffect(() => {
    !paused && scrollBottom.current &&
      scrollBottom.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "start",
      });
  }, [demoHttpRequestSignal.value]);

  return (
    <div class="bg-black text-white dark-scrollbar">
      <div class="flex flex-row justify-start items-center h-[60px] p-4 fixed top-0 bg-black w-full shadow">
        <div class="mr-2">
          {demoHttpRequestSignal.value
            ? "Received Test Http Requests"
            : "No demo http requests found"}
        </div>
        <div class="cursor-pointer" onClick={() => setPaused(!paused)}>
          {paused
            ? <IconPlayerPlayFilled class="w-6 h-6 text-white" />
            : <IconPlayerPauseFilled class="w-6 h-6 text-white" />}
        </div>
      </div>
      <div
        class={`flex flex-col pt-[60px] h-screen w-full overflow-y-scroll`}
      >
        {demoHttpRequestSignal.value?.map((r) => <RequestRow request={r} />)}
        <div ref={scrollBottom} />
      </div>
    </div>
  );
};
