import { Handlers, PageProps } from "$fresh/src/server/types.ts";
import { handler as pipelineHandler, PipelineRoute } from "./index.tsx";
import Pipelines from "root/islands/pipelines/pipelines.tsx";

export const handler: Handlers<PipelineRoute> = pipelineHandler;

export default function PipelineAddRoute(
  props: PageProps<
    PipelineRoute
  >,
) {
  return (
    <Pipelines
      pipelines={props?.data?.pipelines}
      notifications={props?.data?.notifications}
      add={true}
    />
  );
}
