import { Handlers, PageProps } from "$fresh/src/server/types.ts";
import { Pipeline } from "streamdal-protos/protos/sp_pipeline.ts";
import { SuccessType } from "../../_middleware.ts";
import { getPipelines } from "../../../lib/fetch.ts";
import Pipelines from "../../../islands/pipelines.tsx";
import { Partial } from "$fresh/runtime.ts";

export type PipelineRoute = {
  pipelines?: Pipeline[];
  success?: SuccessType;
};

export const handler: Handlers<PipelineRoute> = {
  async GET(_req, ctx) {
    return ctx.render({
      pipelines: await getPipelines(),
    });
  },

  async POST(_req, ctx) {
    return ctx.render({
      pipelines: await getPipelines(),
    });
  },
};

export default function PipelinesRoute(
  props: PageProps<
    PipelineRoute
  >,
) {
  return (
    <Partial name="main-content">
      <Pipelines
        pipelines={props?.data?.pipelines}
        success={props?.data?.success}
      />
    </Partial>
  );
}
