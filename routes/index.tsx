import { Handlers, PageProps } from "$fresh/src/server/types.ts";
import { Layout } from "../components/layout.tsx";
import ServiceMap from "../islands/serviceMap.tsx";
import { getServiceNodes, ServiceNodes } from "../lib/fetch.ts";

export const handler: Handlers<ServiceNodes> = {
  async GET(_req, ctx) {
    return ctx.render(await getServiceNodes());
  },
};

export default function IndexRoute(
  props: PageProps<ServiceNodes>,
) {
  return (
    <Layout>
      <ServiceMap nodesData={props.data.nodes} edgesData={props.data.edges} />
    </Layout>
  );
}
