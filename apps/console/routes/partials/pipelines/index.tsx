import { Handlers, PageProps, RouteConfig } from "$fresh/src/server/types.ts";
import { Partial } from "$fresh/runtime.ts";
import {
  handler as pipelineHandler,
  PipelineRoute,
} from "../../pipelines/index.tsx";
import Pipelines from "root/islands/pipelines.tsx";

export const config: RouteConfig = {
  skipAppWrapper: true,
  skipInheritedLayouts: true,
};

export const handler: Handlers<PipelineRoute> = pipelineHandler;

const PartialPipelinesRoute = (
  props: PageProps<
    PipelineRoute
  >,
) => {
  return (
    <Partial name="overlay-content">
      <Pipelines
        pipelines={props?.data?.pipelines}
        notifications={props?.data?.notifications}
        success={props?.data?.success}
      />
    </Partial>
  );
};

export default PartialPipelinesRoute;
