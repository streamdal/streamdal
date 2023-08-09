import { Handlers, PageProps } from "$fresh/src/server/types.ts";
import {
  ReactFlowProvider,
} from "https://esm.sh/v128/@reactflow/core@11.7.4/X-YS9AdHlwZXMvcmVhY3Q6cHJlYWN0L2NvbXBhdCxyZWFjdC1kb206cHJlYWN0L2NvbXBhdCxyZWFjdDpwcmVhY3QvY29tcGF0CmUvcHJlYWN0L2NvbXBhdA/denonext/core.mjs";
import { Layout } from "../../components/layout.tsx";
import Flow from "../../islands/flow.tsx";
import Pipelines from "../../islands/pipelines.tsx";

import { handler as pipelineHandler, PipelineRoute } from "./index.tsx";

export const handler: Handlers<PipelineRoute> = pipelineHandler;

export default function PipelinesRoute(
  props: PageProps<
    PipelineRoute
  >,
) {
  return (
    <Layout>
      <Pipelines
        pipelines={props?.data?.pipelines}
        add={true}
      />
      <ReactFlowProvider>
        <Flow data={props?.data?.serviceMap} />
      </ReactFlowProvider>
    </Layout>
  );
}
