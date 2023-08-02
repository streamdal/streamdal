import { Layout } from "../components/layout.tsx";
import Flow from "../islands/flow.tsx";
import {
  ReactFlowProvider,
} from "https://esm.sh/v128/@reactflow/core@11.7.4/X-YS9AdHlwZXMvcmVhY3Q6cHJlYWN0L2NvbXBhdCxyZWFjdC1kb206cHJlYWN0L2NvbXBhdCxyZWFjdDpwcmVhY3QvY29tcGF0CmUvcHJlYWN0L2NvbXBhdA/denonext/core.mjs";
import { InfoModal } from "../components/modals/InfoModal.tsx";
import { client } from "./index.tsx";
import { Handlers, PageProps } from "$fresh/src/server/types.ts";

interface ServiceMap {
  serviceMap: any;
}

export const handler: Handlers<ServiceMap> = {
  async GET(_req, ctx) {
    try {
      const { response } = await client.getServiceMap({}, {
        meta: { "auth-token": "1234" },
      });
      console.dir(response, { depth: 20 });
      console.log("in info");
      return ctx.render(response);
    } catch (error) {
      console.log(error);
      return new Response("Project not found", { status: 404 });
    }
  },
};

export default function FlowRoute(props: PageProps) {
  console.log(props);
  return (
    <Layout>
      <InfoModal name={props} />
      <ReactFlowProvider>
        <Flow data={props.data} />
      </ReactFlowProvider>
    </Layout>
  );
}
