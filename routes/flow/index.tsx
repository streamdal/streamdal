import { Handlers } from "$fresh/src/server/types.ts";
import {
  ReactFlowProvider,
} from "https://esm.sh/v128/@reactflow/core@11.7.4/X-YS9AdHlwZXMvcmVhY3Q6cHJlYWN0L2NvbXBhdCxyZWFjdC1kb206cHJlYWN0L2NvbXBhdCxyZWFjdDpwcmVhY3QvY29tcGF0CmUvcHJlYWN0L2NvbXBhdA/denonext/core.mjs";
import { Layout } from "../../components/layout.tsx";
import Flow from "../../islands/flow.tsx";
import { getServiceMap } from "../../lib/fetch.ts";

interface ServiceMap {
  serviceMap: any;
}

export const handler: Handlers<ServiceMap> = {
  async GET(_req, ctx) {
    return ctx.render(await getServiceMap());
  },
};

export default function FlowRoute({ data }: any) {
  return (
    <Layout>
      <ReactFlowProvider>
        <Flow data={data} />
      </ReactFlowProvider>
    </Layout>
  );
}
