import { Handlers, PageProps } from "$fresh/src/server/types.ts";
import { Layout } from "root/components/layout.tsx";
import Pipelines from "root/islands/pipelines.tsx";
import { getPipelines, getServiceNodes } from "root/lib/fetch.ts";
import { PipelineRoute } from "../index.tsx";
import ServiceMap from "../../../islands/serviceMap.tsx";

export const handler: Handlers<PipelineRoute> = {
  async GET(_req, ctx) {
    return ctx.render({
      pipelines: await getPipelines(),
    });
  },
  async POST(req, ctx) {
    const { session } = ctx.state;
    const success = session.get("success");
    //
    // TODO: unsetting after read because session.flash doesn't seem to work
    // find another middleware or roll our own
    session.set("success", null);
    return ctx.render({
      success,
      pipelines: await getPipelines(),
    });
  },
};

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
      pipelines={props?.data?.pipelines}
      success={props?.data?.success}
    />
  );
}
