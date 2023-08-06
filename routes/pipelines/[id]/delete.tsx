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
import { DeleteModal } from "../../../components/modals/deleteModal.tsx";
import Pipelines from "../../../islands/pipelines.tsx";

export type Success = {
  status: boolean;
  message: string;
};

export const handler: Handlers = {
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
        successMessage: "Successfully deleted",
      },
      headers: { Location: "/pipelines" },
    });
  },
};

export default function DeletePipelineRoute(
  props: PageProps<
    {
      pipeline: Pipeline;
      pipelines: Pipeline[];
      serviceMap: GetServiceMapResponse;
    }
  >,
) {
  return (
    <>
      <DeleteModal
        id={props?.params?.id}
        message={`Delete Pipeline ${props?.data?.pipeline?.name}?`}
      />
      <Layout>
        {/*I want to draw this below the modal but I can't because there is something*/}
        {/*strange going on with our react flow z-index.*/}
        {/*<Pipelines pipelines={props?.data?.pipelines} />*/}
        <ReactFlowProvider>
          <Flow data={props?.data?.serviceMap} />
        </ReactFlowProvider>
      </Layout>
    </>
  );
}
