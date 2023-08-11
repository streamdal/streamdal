import { Handlers, PageProps } from "$fresh/src/server/types.ts";
import { GetServiceMapResponse } from "snitch-protos/protos/external.ts";
import { Pipeline } from "snitch-protos/protos/pipeline.ts";
import { Layout } from "../../components/layout.tsx";
import Flow from "../../islands/flow.tsx";
import Pipelines from "../../islands/pipelines.tsx";
import { getPipelines, getServiceMap } from "../../lib/fetch.ts";
import { SuccessType } from "../_middleware.ts";

export type PipelineRoute = {
  pipelines?: Pipeline[];
  serviceMap?: GetServiceMapResponse;
  success?: SuccessType;
};

export const handler: Handlers<PipelineRoute> = {
  async GET(_req, ctx) {
    return ctx.render({
      pipelines: await getPipelines(),
      serviceMap: await getServiceMap(),
    });
  },

  async POST(_req, ctx) {
    return ctx.render({
      pipelines: await getPipelines(),
      serviceMap: await getServiceMap(),
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
      <Flow data={props?.data?.serviceMap} />
    </Layout>
  );
}
