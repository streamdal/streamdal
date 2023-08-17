import { Handlers, PageProps } from "$fresh/src/server/types.ts";
import { Layout } from "../../components/layout.tsx";
import Pipelines from "../../islands/pipelines.tsx";

import { handler as pipelineHandler, PipelineRoute } from "./index.tsx";
import ServiceMap, { serviceSignal } from "../../islands/serviceMap.tsx";

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
