import { Layout } from "../../../../../../../../components/layout.tsx";
import ServiceMap from "../../../../../../../../islands/serviceMap.tsx";
import InfoModal from "../../../../../../../../islands/InfoModal.tsx";
import { Handlers, PageProps } from "$fresh/src/server/types.ts";
import {
  getServiceMap,
  getServiceNodes,
  ServiceMapType,
  ServiceNodes,
} from "../../../../../../../../lib/fetch.ts";

export type ServicePipelines = {
  serviceNodes: ServiceNodes;
  serviceMap: ServiceMapType;
};

export const handler: Handlers<ServicePipelines> = {
  async GET(_req, ctx) {
    return ctx.render({
      serviceNodes: await getServiceNodes(),
      serviceMap: await getServiceMap(),
    });
  },
};

export default function FlowRoute(
  props: PageProps<
    ServicePipelines
  >,
) {
  return (
    <Layout>
      <InfoModal
        params={props.params as any}
        pipelines={props.data.serviceMap.pipes}
        serviceMap={props.data.serviceMap[props.params.service]}
      />
      <ServiceMap
        nodesData={props.data.serviceNodes.nodes}
        edgesData={props.data.serviceNodes.edges}
      />
    </Layout>
  );
}
