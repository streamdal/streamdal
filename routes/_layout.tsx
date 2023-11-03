import { LayoutContext } from "$fresh/server.ts";
import ServiceMapComponent from "../islands/serviceMap.tsx";
import { NavBar } from "../components/nav/nav.tsx";
import { ReactFlowProvider } from "reactflow";
import OpModal from "../islands/opModal.tsx";
import { serviceSignal } from "../components/serviceMap/serviceSignal.ts";
import { initAllServices } from "../lib/fetch.ts";
import { GRPC_TOKEN } from "../lib/configs.ts";
import { CustomError } from "../components/error/custom.tsx";

export default async function Layout(req: Request, ctx: LayoutContext) {
  if (!GRPC_TOKEN) {
    return (
      <>
        <NavBar />
        <CustomError
          children={
            <span>
              You must supply STREAMDAL_CONSOLE_GRPC_AUTH_TOKEN as an
              environment variable or in a .env file. See{" "}
              <a
                class="text-underline "
                href="https://github.com/streamdal/console/blob/master/example.env."
              >
                example
              </a>.
            </span>
          }
        />
      </>
    );
  }

  await initAllServices();
  const success = ctx.data?.success;

  return (
    <>
      <NavBar />
      {!req.url.includes("/email") && (
        <OpModal serviceMap={serviceSignal.value} />
      )}
      <div className="flex flex-col w-screen text-web">
        <ReactFlowProvider>
          <ctx.Component />
          {!req.url.includes("/pipeline") && (
            <ServiceMapComponent
              initNodes={serviceSignal.value
                ? Array.from(serviceSignal.value.nodesMap.values())
                : []}
              initEdges={serviceSignal.value
                ? Array.from(serviceSignal.value.edgesMap.values())
                : []}
              blur={req.url.includes("pipelines") ||
                req.url.includes("notifications")}
              success={success}
            />
          )}
        </ReactFlowProvider>

        <div class="absolute bottom-0 left-0 text-web ml-2 mb-1 flex justify-center items-center text-xs">
          <a className={"mr-2"} href={"https://github.com/streamdal/streamdal"}>
            <img src={"/images/github-logo.svg"} />
          </a>
          {await Deno.readTextFile("VERSION")}
        </div>
      </div>
    </>
  );
}
