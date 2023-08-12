import { Handlers, PageProps } from "$fresh/src/server/types.ts";
import { Layout } from "../../components/layout.tsx";
import ServiceMap from "../../islands/serviceMap.tsx";
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
      <ServiceMap
        nodesData={props.data.serviceNodes.nodes}
        edgesData={props.data.serviceNodes.edges}
      />
    </Layout>
  );
}
