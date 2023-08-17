import { Handlers, PageProps } from "$fresh/src/server/types.ts";
import { Pipeline } from "snitch-protos/protos/pipeline.ts";
import { Layout } from "../../components/layout.tsx";
import Pipelines from "../../islands/pipelines.tsx";
import {
  getPipelines,
  getServiceNodes,
  ServiceNodes,
} from "../../lib/fetch.ts";
import { SuccessType } from "../_middleware.ts";
import ServiceMap from "../../islands/serviceMap.tsx";

export type PipelineRoute = {
  pipelines?: Pipeline[];
  serviceNodes?: ServiceNodes;
  success?: SuccessType;
};

export const handler: Handlers<PipelineRoute> = {
  async GET(_req, ctx) {
    return ctx.render({
      pipelines: await getPipelines(),
      serviceNodes: await getServiceNodes(),
    });
  },

  async POST(_req, ctx) {
    return ctx.render({
      pipelines: await getPipelines(),
      serviceNodes: await getServiceNodes(),
    });
  },
};

export default function PipelinesRoute(
  props: PageProps<
    PipelineRoute
  >,
) {
  return (
    <Layout>
      <Pipelines
        pipelines={props?.data?.pipelines}
        success={props?.data?.success}
      />
      <ServiceMap
        nodesData={props.data.serviceNodes.nodes}
        edgesData={props.data.serviceNodes.edges}
        blur={true}
      />
    </Layout>
  );
}
