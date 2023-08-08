import {Handlers} from "$fresh/src/server/types.ts";
import {getServiceMap} from "../../../../../../lib/fetch.ts";
import {
    ReactFlowProvider
} from "https://esm.sh/v128/@reactflow/core@11.7.4/X-YS9AdHlwZXMvcmVhY3Q6cHJlYWN0L2NvbXBhdCxyZWFjdC1kb206cHJlYWN0L2NvbXBhdCxyZWFjdDpwcmVhY3QvY29tcGF0CmUvcHJlYWN0L2NvbXBhdA/denonext/core.mjs";
import Flow from "../../../../../../islands/flow.tsx";
import {Layout} from "../../../../../../components/layout.tsx";
import {ExpandedNodes} from "../../../../../../components/expandedNodes/expandedNodes.tsx";

export const handler: Handlers<ServiceMap> = {
    async GET(_req, ctx) {
        return ctx.render(await getServiceMap());
    },
};

export default function expandedNodes({data, params}: { data: getServiceMapResponse; params: any }) {
    return (
        <Layout>
            <ExpandedNodes nodes={data.serviceMap[params.service].pipelines} params={params}/>
            <ReactFlowProvider>
                <Flow data={data}/>
            </ReactFlowProvider>
        </Layout>
    )
}