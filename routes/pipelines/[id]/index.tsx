import { Handlers, PageProps } from "$fresh/src/server/types.ts";
import { Layout } from "../../../components/layout.tsx";
import Flow from "../../../islands/flow.tsx";
import Pipelines from "../../../islands/pipelines.tsx";
import { getPipelines, getServiceMap } from "../../../lib/fetch.ts";
import { PipelineRoute } from "../index.tsx";

export const handler: Handlers<PipelineRoute> = {
  async GET(_req, ctx) {
    return ctx.render({
      pipelines: await getPipelines(),
      serviceMap: await getServiceMap(),
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
      serviceMap: await getServiceMap(),
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
    <Layout>
      <Pipelines
        id={props?.params?.id}
        pipelines={props?.data?.pipelines}
        success={props?.data?.success}
      />
      <Flow data={props?.data?.serviceMap} />
    </Layout>
  );
}
