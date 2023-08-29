import {LayoutContext} from "$fresh/server.ts";
import {getDisplayNodes, getServiceMap} from "../lib/fetch.ts";
import ServiceMap, {serviceSignal} from "../islands/serviceMap.tsx";
import {NavBar} from "../components/nav/nav.tsx";
import {ReactFlowProvider} from "reactflow";

export default async function Layout(req: Request, ctx: LayoutContext) {
    const serviceMap = await getServiceMap();
    const {edges, nodes} = await getDisplayNodes(serviceMap);
    serviceSignal.value = serviceMap;

    return (
        <>
            <NavBar/>
            {/*<OpModal*/}
            {/*  modalOpen={true}*/}
            {/*  params={props.params as any}*/}
            {/*  serviceMap={serviceSignal.value}*/}
            {/*  success={props.data.success}*/}
            {/*/>*/}
            <div className="flex flex-col w-screen text-web">
                <ReactFlowProvider>
                    <ctx.Component/>
                    <ServiceMap
                        nodesData={nodes}
                        edgesData={edges}
                        blur={req.url.includes("pipelines")}
                    />
                </ReactFlowProvider>
            </div>
        </>
    );
}
