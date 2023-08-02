import { Handlers, PageProps } from "$fresh/src/server/types.ts";
import { Layout } from "../components/layout.tsx";
import { RuleSetType } from "../components/rules/sets.tsx";
import Flow from "../islands/flow.tsx";
import { ExternalClient } from "snitch-protos/protos/external.client.ts";
import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";
import { getEnv } from "../lib/utils.ts";
import {
  ReactFlowProvider,
} from "https://esm.sh/v128/@reactflow/core@11.7.4/X-YS9AdHlwZXMvcmVhY3Q6cHJlYWN0L2NvbXBhdCxyZWFjdC1kb206cHJlYWN0L2NvbXBhdCxyZWFjdDpwcmVhY3QvY29tcGF0CmUvcHJlYWN0L2NvbXBhdA/denonext/core.mjs";
import { useEffect, useState } from "https://esm.sh/preact@10.15.1/hooks";

interface ServiceMap {
  serviceMap: any;
}

const transport = new GrpcWebFetchTransport({
  baseUrl: `${await getEnv("SNITCH_GRPC_WEB_URL") || "http://localhost:9091"}`,
  format: "binary",
});

export const client = new ExternalClient(transport);

export const handler: Handlers<ServiceMap> = {
  async GET(_req, ctx) {
    try {
      const { response } = await client.getServiceMap({}, {
        meta: { "auth-token": "1234" },
      });
      console.dir(response, { depth: 20 });
      return ctx.render(response);
    } catch (error) {
      console.log(error);
      return new Response("Project not found", { status: 404 });
    }
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
