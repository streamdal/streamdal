import {Layout} from "../../../../../../../../components/layout.tsx";
import Flow from "../../../../../../../../islands/flow.tsx";
import {
    ReactFlowProvider,
} from "https://esm.sh/v128/@reactflow/core@11.7.4/X-YS9AdHlwZXMvcmVhY3Q6cHJlYWN0L2NvbXBhdCxyZWFjdC1kb206cHJlYWN0L2NvbXBhdCxyZWFjdDpwcmVhY3QvY29tcGF0CmUvcHJlYWN0L2NvbXBhdA/denonext/core.mjs";
import InfoModal from "../../../../../../../../islands/InfoModal.tsx";
import {Handlers, PageProps} from "$fresh/src/server/types.ts";
import {getPipelines, getServiceMap} from "../../../../../../../../lib/fetch.ts";

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
    console.dir(props, {depth: 20});
    return (
        <Layout>
            <InfoModal
                params={props.params}
                pipelines={props.data.pipelines}
                serviceMap={props.data.serviceMap.serviceMap[props.params.service]}
            />
            <ReactFlowProvider>
                <Flow data={props.data.serviceMap}/>
            </ReactFlowProvider>
        </Layout>
    );
}
