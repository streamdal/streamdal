import { Partial } from "$fresh/runtime.ts";
import { Handlers, PageProps, RouteConfig } from "$fresh/src/server/types.ts";
import Pipelines from "root/islands/pipelines.tsx";
import { PipelineRoute } from "root/routes/pipelines/index.tsx";
import { handler as pipelineHandler } from "../pipelines/index.tsx";

export const config: RouteConfig = {
  skipAppWrapper: true,
  skipInheritedLayouts: true,
};

export const handler: Handlers<PipelineRoute> = pipelineHandler;

const PartialPipelineAddRoute = (
  props: PageProps<
    PipelineRoute
  >,
) => {
  return (
    <Partial name="overlay-content">
      <Pipelines
        pipelines={props?.data?.pipelines}
        notifications={props?.data?.notifications}
        add={true}
      />
    </Partial>
  );
};

export default PartialPipelineAddRoute;
