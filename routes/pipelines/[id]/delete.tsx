import { Handlers, PageProps } from "$fresh/src/server/types.ts";
import {
  ReactFlowProvider,
} from "https://esm.sh/v128/@reactflow/core@11.7.4/X-YS9AdHlwZXMvcmVhY3Q6cHJlYWN0L2NvbXBhdCxyZWFjdC1kb206cHJlYWN0L2NvbXBhdCxyZWFjdDpwcmVhY3QvY29tcGF0CmUvcHJlYWN0L2NvbXBhdA/denonext/core.mjs";
import { GetServiceMapResponse } from "snitch-protos/protos/external.ts";
import { Pipeline } from "snitch-protos/protos/pipeline.ts";
import { Layout } from "../../../components/layout.tsx";
import Flow from "../../../islands/flow.tsx";
import {
  getPipeline,
  getPipelines,
  getServiceMap,
} from "../../../lib/fetch.ts";
import { ResponseCode } from "snitch-protos/protos/common.ts";
import { deletePipeline } from "../../../lib/mutation.ts";
import { RoutedDeleteModal } from "../../../components/modals/routedDeleteModal.tsx";
import Pipelines from "../../../islands/pipelines.tsx";

export type DeletePipeline = {
  pipeline: Pipeline;
  pipelines: Pipeline[];
  serviceMap: GetServiceMapResponse;
};

export const handler: Handlers<DeletePipeline> = {
  async GET(req, ctx) {
    const pipeline = await getPipeline(ctx.params.id);
    if (!pipeline) {
      return ctx.renderNotFound();
    }
    return ctx.render({
      pipeline,
      serviceMap: await getServiceMap(),
      pipelines: await getPipelines(),
    });
  },
  async POST(req, ctx) {
    const response = await deletePipeline(ctx.params.id);

    return new Response("", {
      status: 307,
      success: {
        status: response.code === ResponseCode.OK,
        message: response.code === ResponseCode.OK
          ? "Successfully deleted"
          : response.message,
      },
      headers: { Location: "/pipelines" },
    });
  },
};

export default function DeletePipelineRoute(
  props: PageProps<DeletePipeline>,
) {
  return (
    <>
      <div>
        <Pipelines pipelines={props?.data?.pipelines} />
        <RoutedDeleteModal
          id={props?.params?.id}
          entityType="pipeline"
          entityName={props?.data?.pipeline?.name}
          redirect={`/pipelines/${props?.params?.id}`}
        />
      </div>
      <Layout>
        <ReactFlowProvider>
          <Flow data={props?.data?.serviceMap} />
        </ReactFlowProvider>
      </Layout>
    </>
  );
}
