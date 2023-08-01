import { Layout } from "../../components/layout.tsx";
import { RuleSetType } from "../../components/rules/sets.tsx";
import { Handlers, PageProps } from "$fresh/src/server/types.ts";
import Flow from "../../islands/flow.tsx";
import {
  ReactFlowProvider,
} from "https://esm.sh/v128/@reactflow/core@11.7.4/X-YS9AdHlwZXMvcmVhY3Q6cHJlYWN0L2NvbXBhdCxyZWFjdC1kb206cHJlYWN0L2NvbXBhdCxyZWFjdDpwcmVhY3QvY29tcGF0CmUvcHJlYWN0L2NvbXBhdA/denonext/core.mjs";
import { client } from "../grpc.tsx";
import { useEffect, useState } from "https://esm.sh/preact@10.15.1/hooks";

interface ServiceMap {
  serviceMap: any;
}

export const handler: Handlers<ServiceMap> = {
  async GET(_req, ctx) {
    try {
      const { response } = await client.getServiceMap({}, {
            meta: { "auth-token": "1234" },
          });
          console.dir(response, {depth: 20})
          return ctx.render(response);
        } catch (error) {
          console.log(error)
          return new Response("Project not found", { status: 404 });
        }
    },
};

export default function FlowRoute({data}: any) {
  return (
    <Layout>
      <ReactFlowProvider>
        <Flow data={data}/>
      </ReactFlowProvider>
    </Layout>
  );
}
