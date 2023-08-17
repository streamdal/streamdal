import { AppContext } from "$fresh/server.ts";
import { getServiceMap, getServiceNodes } from "../lib/fetch.ts";
import { Head } from "$fresh/src/runtime/head.ts";
import { NavBar } from "../components/nav/nav.tsx";
import { ReactFlowProvider } from "reactflow";
import ServiceMap, { serviceSignal } from "../islands/serviceMap.tsx";

export default async function App(
  req: Request,
  ctx: AppContext,
) {
  const serviceMap = await getServiceMap();
  const service = await getServiceNodes(serviceMap);
  serviceSignal.value = service;

  return (
    <html lang="en">
      <Head>
        <title>{"Snitch Console"}</title>
        <meta
          content="Streamdal's Snitch Console"
          name="description"
        />
        <link rel="icon" type="image/png" href="/images/favicon.png" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=Space+Grotesk:wght@400;500&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://esm.sh/reactflow@11.8.2/dist/base.css"
        />
        <link
          rel="stylesheet"
          href="https://esm.sh/reactflow@11.8.2/dist/style.css"
        />
        <link rel="stylesheet" type="text/css" href="/style.css" />
      </Head>
      <body className="h-screen bg-purple-50 m-0 overflow-hidden">
        <NavBar />
        <div className="flex flex-col w-screen text-web">
          <ReactFlowProvider>
            <ctx.Component />
            <ServiceMap
              nodesData={service.nodes}
              edgesData={service.edges}
              blur={req.url.includes("pipelines")}
            />
          </ReactFlowProvider>
        </div>
      </body>
    </html>
  );
}
