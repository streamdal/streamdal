import { Partial } from "$fresh/runtime.ts";
import { LayoutContext } from "$fresh/server.ts";
import { ReactFlowProvider } from "reactflow";
import { CustomError } from "../components/error/custom.tsx";
import { serviceSignal } from "../components/serviceMap/serviceSignal.ts";
import { InfoDrawer } from "../islands/drawer/infoDrawer.tsx";
import { NavBar } from "../islands/nav.tsx";

import { ServiceModals } from "../islands/modals/serviceModals.tsx";
import ServiceDisplay from "../islands/serviceDisplay.tsx";
import { GRPC_TOKEN } from "../lib/configs.ts";
import { initAllServices } from "../lib/fetch.ts";

const tokenError = () => (
  <CustomError
    children={
      <span>
        You must supply STREAMDAL_CONSOLE_GRPC_AUTH_TOKEN as an environment
        variable or in a .env file. See{" "}
        <a
          class="text-underline "
          href="https://github.com/streamdal/console/blob/master/example.env."
        >
          example
        </a>.
      </span>
    }
  />
);

export default async function Layout(req: Request, ctx: LayoutContext) {
  if (!GRPC_TOKEN) {
    return (
      <>
        <NavBar />
        {tokenError()}
      </>
    );
  }

  await initAllServices();

  return (
    <div className="flex flex-col w-full text-web h-screen">
      <NavBar />
      <div className="flex flex-row w-full justify-between">
        <div className="grow">
          <Partial name="overlay-content">
            <ctx.Component />
          </Partial>
        </div>
        <div className="w-[308px]">
          {!req.url.includes("/email") && (
            <InfoDrawer serviceMap={serviceSignal.value} />
          )}
          <ServiceModals />
        </div>
      </div>

      <ReactFlowProvider>
        <ServiceDisplay
          serviceMap={serviceSignal.value}
          success={ctx.data?.success}
        />
      </ReactFlowProvider>

      <div class="absolute bottom-0 left-0 text-web ml-2 mb-2 flex justify-center items-center text-xs">
        <a
          className={"mr-2 cursor-pointer"}
          href={"https://discord.com/channels/1121896696801132636"}
        >
          <img
            className="w-5"
            src={"/images/discord-mark-black.png"}
          />
        </a>
        <a
          className={"mr-2 cursor-pointer"}
          href={"https://github.com/streamdal/streamdal"}
        >
          <img className="w-5" src={"/images/github-logo.svg"} />
        </a>
        {await Deno.readTextFile("VERSION")}
      </div>
    </div>
  );
}
