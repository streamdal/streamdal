import { LayoutContext } from "$fresh/server.ts";
import ServiceMapComponent from "../islands/serviceMap.tsx";
import { NavBar } from "../components/nav/nav.tsx";
import { ReactFlowProvider } from "reactflow";
import OpModal from "../islands/opModal.tsx";
import {
  serviceSignal,
  setServiceSignal,
} from "../components/serviceMap/serviceSignal.ts";
import { getAll } from "../lib/fetch.ts";

export default async function Layout(req: Request, ctx: LayoutContext) {
  const allServices = await getAll();
  setServiceSignal(allServices);

  return (
    <>
      <NavBar />
      <OpModal
        serviceMap={serviceSignal.value}
      />
      <div className="flex flex-col w-screen text-web">
        <ReactFlowProvider>
          <ctx.Component />
          <ServiceMapComponent
            initNodes={Array.from(serviceSignal.value.nodesMap.values())}
            initEdges={Array.from(serviceSignal.value.edgesMap.values())}
            blur={req.url.includes("pipelines")}
          />
        </ReactFlowProvider>
      </div>
    </>
  );
}
