import { Handlers, PageProps } from "$fresh/src/server/types.ts";
import { Pipeline } from "snitch-protos/protos/pipeline.ts";
import Pipelines from "../../islands/pipelines.tsx";
import { getPipelines } from "../../lib/fetch.ts";
import { SuccessType } from "../_middleware.ts";

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
    <Pipelines
      pipelines={props?.data?.pipelines}
      success={props?.data?.success}
    />
  );
}
