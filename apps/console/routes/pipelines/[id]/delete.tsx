import { Handlers, PageProps } from "$fresh/src/server/types.ts";
import { Pipeline } from "streamdal-protos/protos/sp_pipeline.ts";
import {
  getNotifications,
  getPipeline,
  getPipelines,
} from "../../../lib/fetch.ts";
import { ResponseCode } from "streamdal-protos/protos/sp_common.ts";
import { deletePipeline } from "../../../lib/mutation.ts";
import { RoutedDeleteModal } from "../../../components/modals/routedDeleteModal.tsx";
import Pipelines from "../../../islands/pipelines.tsx";

export type DeletePipeline = {
  pipeline: Pipeline;
  pipelines: Pipeline[];
};

export const handler: Handlers<DeletePipeline> = {
  async GET(req, ctx) {
    const pipeline = await getPipeline(ctx.params.id);
    if (!pipeline) {
      return ctx.renderNotFound();
    }
    return ctx.render({
      pipeline,
      pipelines: await getPipelines(),
      notifications: await getNotifications(),
    });
  },
  async POST(req, ctx) {
    const response = await deletePipeline(ctx.params.id);

    return new Response("", {
      status: 307,
      success: {
        status: response.code === ResponseCode.OK,
        message: response.code === ResponseCode.OK
          ? "Successfully deleted"
          : response.message,
      },
      headers: { Location: "/pipelines" },
    });
  },
};

export default function DeletePipelineRoute(
  props: PageProps<DeletePipeline>,
) {
  return (
    <>
      <RoutedDeleteModal
        id={props?.params?.id}
        entityType="pipeline"
        entityName={props?.data?.pipeline?.name}
        redirect={`/pipelines/${props?.params?.id}`}
      />
      <Pipelines
        notifications={props?.data?.notifications}
        pipelines={props?.data?.pipelines}
      />
    </>
  );
}
