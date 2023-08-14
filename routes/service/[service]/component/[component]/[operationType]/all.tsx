import { Handlers, PageProps } from "$fresh/src/server/types.ts";
import { getPipelines, getServiceNodes } from "../../../../../../lib/fetch.ts";
import ServiceMap from "../../../../../../islands/serviceMap.tsx";
import { Layout } from "../../../../../../components/layout.tsx";
import { ExpandedNodes } from "../../../../../../components/serviceMap/expandedNodes.tsx";
import { PipelineRoute } from "../../../../../pipelines/index.tsx";

export const handler: Handlers<PipelineRoute> = {
  async GET(_req, ctx) {
    return ctx.render({
      pipelines: await getPipelines(),
      serviceNodes: await getServiceNodes(),
    });
  },
};

export default function DeletePipelineRoute(
  props: PageProps<PipelineRoute>,
) {
  return (
    <Layout>
      <ExpandedNodes
        nodes={props?.data.pipelines}
        params={props.params}
      />
      <ServiceMap
        nodesData={props.data.serviceNodes.nodes}
        edgesData={props.data.serviceNodes.edges}
      />
    </Layout>
  );
}
