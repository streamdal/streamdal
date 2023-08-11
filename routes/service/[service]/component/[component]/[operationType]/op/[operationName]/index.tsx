import { Layout } from "../../../../../../../../components/layout.tsx";
import Flow from "../../../../../../../../islands/flow.tsx";
import InfoModal from "../../../../../../../../islands/InfoModal.tsx";
import { Handlers, PageProps } from "$fresh/src/server/types.ts";
import {
  getPipelines,
  getServiceMap,
} from "../../../../../../../../lib/fetch.ts";

interface ServiceMap {
  serviceMap: any;
}

export const handler: Handlers<any> = {
  async GET(_req, ctx) {
    return ctx.render({
      pipelines: await getPipelines(),
      serviceMap: await getServiceMap(),
    });
  },
};

export default function FlowRoute(props: PageProps) {
  console.dir(props, { depth: 20 });
  return (
    <Layout>
      <InfoModal
        params={props.params}
        pipelines={props.data.pipelines}
        serviceMap={props.data.serviceMap.serviceMap[props.params.service]}
      />
      <Flow data={props.data.serviceMap} />
    </Layout>
  );
}
