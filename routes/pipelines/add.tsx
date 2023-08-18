import { Handlers, PageProps } from "$fresh/src/server/types.ts";
import Pipelines from "../../islands/pipelines.tsx";
import { handler as pipelineHandler, PipelineRoute } from "./index.tsx";

export const handler: Handlers<PipelineRoute> = pipelineHandler;

export default function PipelinesRoute(
  props: PageProps<
    PipelineRoute
  >,
) {
  return (
    <Pipelines
      pipelines={props?.data?.pipelines}
      add={true}
    />
  );
}
