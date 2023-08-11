import { Handlers, PageProps } from "$fresh/src/server/types.ts";
import {
  getServiceMap,
  pausePipeline,
} from "../../../../../../../../../../lib/fetch.ts";
import { GetServiceMapResponse } from "snitch-protos/protos/external.ts";
import { Layout } from "../../../../../../../../../../components/layout.tsx";
import Flow from "../../../../../../../../../../islands/flow.tsx";
import { PauseModal } from "../../../../../../../../../../components/modals/pauseModal.tsx";
import { ResponseCode } from "snitch-protos/protos/common.ts";
import { SuccessType } from "../../../../../../../../../_middleware.ts";

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
      <Flow data={props?.data?.serviceMap} />
    </Layout>
  );
}
