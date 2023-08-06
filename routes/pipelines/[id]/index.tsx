import { Handlers, PageProps } from "$fresh/src/server/types.ts";
import {
  ReactFlowProvider,
} from "https://esm.sh/v128/@reactflow/core@11.7.4/X-YS9AdHlwZXMvcmVhY3Q6cHJlYWN0L2NvbXBhdCxyZWFjdC1kb206cHJlYWN0L2NvbXBhdCxyZWFjdDpwcmVhY3QvY29tcGF0CmUvcHJlYWN0L2NvbXBhdA/denonext/core.mjs";
import { GetServiceMapResponse } from "snitch-protos/protos/external.ts";
import { Pipeline } from "snitch-protos/protos/pipeline.ts";
import { Layout } from "../../../components/layout.tsx";
import Flow from "../../../islands/flow.tsx";
import Pipelines from "../../../islands/pipelines.tsx";
import { getPipelines, getServiceMap } from "../../../lib/fetch.ts";
import { ErrorType, validate } from "../../../components/form/validate.ts";
import { pipelineSchema } from "../../../islands/pipeline.tsx";
import { ResponseCode } from "snitch-protos/protos/common.ts";
import { upsertPipeline } from "../../../lib/mutation.ts";

export const handler: Handlers<any> = {
  async GET(_req, ctx) {
    return ctx.render({
      pipelines: await getPipelines(),
      serviceMap: await getServiceMap(),
    });
  },
  async POST(req, ctx) {
    const formData = await req.formData();

    const { data: pipeline, errors }: {
      pipeline: Pipeline;
      errors: ErrorType;
    } = validate(
      pipelineSchema,
      formData,
    );

    const response = await upsertPipeline(pipeline);

    return ctx.render({
      errors: {
        ...errors,
        ...response.code !== ResponseCode.OK ? { response } : {},
      },
      success: response.code === ResponseCode.OK,
      pipelines: await getPipelines(),
      serviceMap: await getServiceMap(),
    });
  },
};

export default function PipelinesRoute(
  props: PageProps<
    { pipelines: Pipeline[]; serviceMap: GetServiceMapResponse; id: string }
  >,
) {
  return (
    <Layout>
      <Pipelines id={props?.params?.id} pipelines={props?.data?.pipelines} />
      <ReactFlowProvider>
        <Flow data={props?.data?.serviceMap} />
      </ReactFlowProvider>
    </Layout>
  );
}
