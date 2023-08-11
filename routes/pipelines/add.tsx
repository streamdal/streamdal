import { Handlers, PageProps } from "$fresh/src/server/types.ts";
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
      <Flow data={props?.data?.serviceMap} />
    </Layout>
  );
}
