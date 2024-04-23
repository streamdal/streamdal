import { Handlers, PageProps, RouteConfig } from "$fresh/src/server/types.ts";
import Pipelines from "root/islands/pipelines/pipelines.tsx";
import { handler as pipelineHandler } from "../index.tsx";
import { Partial } from "$fresh/runtime.ts";
import { PipelineRoute } from "root/routes/pipelines/index.tsx";

export const config: RouteConfig = {
  skipAppWrapper: true,
  skipInheritedLayouts: true,
};

export const handler: Handlers<PipelineRoute> = pipelineHandler;

const PartialPipelineRoute = (
  props: PageProps<
    & PipelineRoute
    & {
      id: string;
    }
  >,
) => {
  return (
    <Partial name="overlay-content">
      <Pipelines
        id={props?.params?.id}
        notifications={props?.data?.notifications}
        pipelines={props?.data?.pipelines}
        success={props?.data?.success}
      />
    </Partial>
  );
};

export default PartialPipelineRoute;
