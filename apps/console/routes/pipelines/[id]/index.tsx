import { Handlers, PageProps } from "$fresh/src/server/types.ts";
import Pipelines from "root/islands/pipelines/pipelines.tsx";
import { handler as pipelineHandler, PipelineRoute } from "../index.tsx";

export const handler: Handlers<PipelineRoute> = pipelineHandler;

export default function PipelinesRoute(
  props: PageProps<
    & PipelineRoute
    & {
      id: string;
    }
  >,
) {
  return (
    <Pipelines
      id={props?.params?.id}
      notifications={props?.data?.notifications}
      pipelines={props?.data?.pipelines}
      success={props?.data?.success}
    />
  );
}
