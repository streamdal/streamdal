import { Handlers, PageProps } from "$fresh/src/server/types.ts";
import { Layout } from "../components/layout.tsx";
import ServiceMap from "../islands/serviceMap.tsx";
import { getServiceNodes, ServiceNodes } from "../lib/fetch.ts";
import OpModal from "../islands/opModal.tsx";

export const handler: Handlers<ServiceNodes> = {
  async GET(_req, ctx) {
    return ctx.render(await getServiceNodes());
  },
};

export default function IndexRoute(
  props: PageProps<ServiceNodes>,
) {
  return (
    <>
      <link rel="prefetch" href="/pipelines" as="document" />
      <Layout>
        <ServiceMap nodesData={props.data.nodes} edgesData={props.data.edges} />

        <OpModal
          serviceMap={props.data.serviceMap}
        />
      </Layout>
    </>
  );
}
