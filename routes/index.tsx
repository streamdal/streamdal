import { Handlers, PageProps } from "$fresh/src/server/types.ts";
import { Layout } from "../components/layout.tsx";
import Flow from "../islands/flow.tsx";
import { getServiceMap, ServiceMap } from "../lib/fetch.ts";

export const handler: Handlers<ServiceMap> = {
  async GET(_req, ctx) {
    return ctx.render(await getServiceMap());
  },
};

export default function IndexRoute(
  props: PageProps<ServiceMap>,
) {
  return (
    <Layout>
      <Flow audiences={props.data.audiences} pipes={props.data.pipes} />
    </Layout>
  );
}
