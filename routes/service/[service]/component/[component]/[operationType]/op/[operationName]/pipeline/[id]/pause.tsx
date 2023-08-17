import { Handlers, PageProps } from "$fresh/src/server/types.ts";
import {
  getServiceNodes,
  pausePipeline,
  ServiceNodes,
} from "../../../../../../../../../../lib/fetch.ts";
import { Layout } from "../../../../../../../../../../components/layout.tsx";
import { PauseModal } from "../../../../../../../../../../components/modals/pauseModal.tsx";
import { ResponseCode } from "snitch-protos/protos/common.ts";
import { SuccessType } from "../../../../../../../../../_middleware.ts";
import ServiceMap from "../../../../../../../../../../islands/serviceMap.tsx";

export type ServiceNodesSuccess = {
  serviceNodes?: ServiceNodes;
  success?: SuccessType;
};
export const handler: Handlers<ServiceNodesSuccess> = {
  async GET(_req, ctx) {
    return ctx.render({
      serviceNodes: await getServiceNodes(),
    });
  },
  async POST(req, ctx) {
    const response = await pausePipeline(ctx.params.id);
    return new Response("", {
      status: 307,
      success: {
        status: response.code === ResponseCode.OK,
        message: response.code === ResponseCode.OK
          ? "Successfully paused"
          : response.message,
      },
      headers: { Location: "/" },
    });
  },
};

export default function PausePipelineRoute(
  props: PageProps<
    ServiceNodesSuccess
  >,
) {
  return (
    <Layout>
      <PauseModal
        id={props?.params.id}
        message={`Pipeline ${props?.params.id} has been paused`}
      />
      <ServiceMap
        nodesData={props.data.serviceNodes.nodes}
        edgesData={props.data.serviceNodes.edges}
      />
    </Layout>
  );
}
