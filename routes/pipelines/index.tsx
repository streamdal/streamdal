import { Handlers, PageProps } from "$fresh/src/server/types.ts";
import {
  ReactFlowProvider,
} from "https://esm.sh/v128/@reactflow/core@11.7.4/X-YS9AdHlwZXMvcmVhY3Q6cHJlYWN0L2NvbXBhdCxyZWFjdC1kb206cHJlYWN0L2NvbXBhdCxyZWFjdDpwcmVhY3QvY29tcGF0CmUvcHJlYWN0L2NvbXBhdA/denonext/core.mjs";
import { GetServiceMapResponse } from "snitch-protos/protos/external.ts";
import { Pipeline } from "snitch-protos/protos/pipeline.ts";
import { Layout } from "../../components/layout.tsx";
import Flow from "../../islands/flow.tsx";
import Pipelines from "../../islands/pipelines.tsx";
import { getPipelines, getServiceMap } from "../../lib/fetch.ts";
import { Success } from "./[id]/delete.tsx";

export const handler: Handlers<any> = {
  async GET(_req, ctx) {
    return ctx.render({
      pipelines: await getPipelines(),
      serviceMap: await getServiceMap(),
    });
  },

  async POST(_req, ctx) {
    return ctx.render({
      pipelines: await getPipelines(),
      serviceMap: await getServiceMap(),
    });
  },
};

export default function PipelinesRoute(
  props: PageProps<
    {
      pipelines: Pipeline[];
      serviceMap: GetServiceMapResponse;
      success: Success;
    }
  >,
) {
  return (
    <Layout>
      <Pipelines pipelines={props?.data?.pipelines} />
      <ReactFlowProvider>
        <Flow data={props?.data?.serviceMap} />
      </ReactFlowProvider>
    </Layout>
  );
}
