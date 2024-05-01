import { Handlers, PageProps } from "$fresh/src/server/types.ts";
import { Pipeline } from "streamdal-protos/protos/sp_pipeline.ts";
import {
  getNotifications,
  getPipeline,
  getPipelines,
} from "../../../lib/fetch.ts";
import { ResponseCode } from "streamdal-protos/protos/sp_common.ts";
import { deletePipeline } from "../../../lib/mutation.ts";
import Pipelines from "root/islands/pipelines/pipelines.tsx";
import { NotificationConfig } from "streamdal-protos/protos/sp_notify.ts";
import IconTrash from "tabler-icons/tsx/trash.tsx";
import { RoutedActionModal } from "root/components/modals/routedActionModal.tsx";

export type DeletePipeline = {
  pipeline: Pipeline;
  pipelines: Pipeline[];
  notifications: NotificationConfig[];
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

    const { session }: any = ctx.state;

    session.flash("success", {
      status: response.code === ResponseCode.OK,
      message: response.code === ResponseCode.OK
        ? "Success!"
        : "Delete pipeline failed. Please try again later",
      ...(response.code !== ResponseCode.OK
        ? { errors: { apiError: response.message } }
        : {}),
    });

    return new Response("", {
      status: 307,
      headers: { Location: "/pipelines" },
    });
  },
};

export default function DeletePipelineRoute(
  props: PageProps<DeletePipeline>,
) {
  return (
    <>
      <RoutedActionModal
        icon={<IconTrash class="w-10 h-10 mx-auto text-eyelid" />}
        message={
          <div>
            Delete pipeline{"  "}
            <span class="text-medium font-bold ">
              {props?.data?.pipeline?.name}
            </span>?
          </div>
        }
        actionText="Delete"
        cancelUrl={`/pipelines/${props?.params?.id}`}
        destructive={true}
      />
      <Pipelines
        notifications={props?.data?.notifications}
        pipelines={props?.data?.pipelines}
      />
    </>
  );
}
