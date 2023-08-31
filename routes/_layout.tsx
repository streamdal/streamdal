import { LayoutContext } from "$fresh/server.ts";
import ServiceMap from "../islands/serviceMap.tsx";
import { NavBar } from "../components/nav/nav.tsx";
import { ReactFlowProvider } from "reactflow";
import OpModal from "../islands/opModal.tsx";
import { serviceSignal } from "../components/serviceMap/serviceSignal.ts";
import { grpcToken, grpcUrl } from "../lib/configs.ts";

export default async function Layout(req: Request, ctx: LayoutContext) {
  const url = await grpcUrl();
  const token = await grpcToken();
  return (
    <>
      <NavBar />
      <OpModal
        serviceMap={serviceSignal.value}
      />
      <div className="flex flex-col w-screen text-web">
        <ReactFlowProvider>
          <ctx.Component />
          <ServiceMap
            grpcConfigs={{
              grpcUrl: url,
              grpcToken: token,
            }}
            blur={req.url.includes("pipelines")}
          />
        </ReactFlowProvider>
      </div>
    </>
  );
}
