import { Handlers, PageProps } from "$fresh/src/server/types.ts";
import { Pipeline } from "streamdal-protos/protos/sp_pipeline.ts";
import Pipelines from "root/islands/pipelines/pipelines.tsx";
import { getNotifications, getPipelines } from "../../lib/fetch.ts";
import { SuccessType } from "../_middleware.ts";
import { NotificationConfig } from "streamdal-protos/protos/sp_notify.ts";

export type PipelineRoute = {
  pipelines?: Pipeline[];
  notifications: NotificationConfig[];
  success?: SuccessType;
};

export const handler: Handlers<PipelineRoute> = {
  async GET(_req, ctx) {
    return ctx.render({
      pipelines: await getPipelines(),
      notifications: await getNotifications(),
    });
  },

  async POST(_req, ctx) {
    const { session }: any = ctx.state;
    const success = session.flash("success");
    return ctx.render({
      success,
      pipelines: await getPipelines(),
      notifications: await getNotifications(),
    });
  },
};

export const PipelinesRoute = (
  props: PageProps<
    PipelineRoute
  >,
) => {
  return (
    <Pipelines
      pipelines={props?.data?.pipelines}
      notifications={props?.data?.notifications}
    />
  );
};

export default PipelinesRoute;
