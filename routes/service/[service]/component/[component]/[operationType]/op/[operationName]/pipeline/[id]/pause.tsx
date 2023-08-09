import { Handlers, PageProps } from "$fresh/src/server/types.ts";
import {
  getServiceMap,
  pausePipeline,
} from "../../../../../../../../../../lib/fetch.ts";
import { GetServiceMapResponse } from "snitch-protos/protos/external.ts";
import { SuccessType } from "../../../../../../../../../pipelines/[id]/delete.tsx";
import { Layout } from "../../../../../../../../../../components/layout.tsx";
import {
  ReactFlowProvider,
} from "https://esm.sh/v128/@reactflow/core@11.7.4/X-YS9AdHlwZXMvcmVhY3Q6cHJlYWN0L2NvbXBhdCxyZWFjdC1kb206cHJlYWN0L2NvbXBhdCxyZWFjdDpwcmVhY3QvY29tcGF0CmUvcHJlYWN0L2NvbXBhdA/denonext/core.mjs";
import Flow from "../../../../../../../../../../islands/flow.tsx";
import { PauseModal } from "../../../../../../../../../../components/modals/pauseModal.tsx";
import { ResponseCode } from "snitch-protos/protos/common.ts";

export const handler: Handlers<any> = {
  async GET(_req, ctx) {
    return ctx.render({
      serviceMap: await getServiceMap(),
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
    {
      serviceMap: GetServiceMapResponse;
      success: SuccessType;
    }
  >,
) {
  return (
    <Layout>
      <PauseModal
        id={props?.params.id}
        message={`Pipeline ${props?.params.id} has been paused`}
      />
      <ReactFlowProvider>
        <Flow data={props?.data?.serviceMap} />
      </ReactFlowProvider>
    </Layout>
  );
}
