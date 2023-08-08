import {Handlers, PageProps} from "$fresh/src/server/types.ts";
import {getPipelines, getServiceMap} from "../../../../../../../../../../lib/fetch.ts";
import {Pipeline} from "snitch-protos/protos/pipeline.ts";
import {GetServiceMapResponse} from "snitch-protos/protos/external.ts";
import {SuccessType} from "../../../../../../../../../pipelines/[id]/delete.tsx";
import {Layout} from "../../../../../../../../../../components/layout.tsx";
import {
    ReactFlowProvider
} from "https://esm.sh/v128/@reactflow/core@11.7.4/X-YS9AdHlwZXMvcmVhY3Q6cHJlYWN0L2NvbXBhdCxyZWFjdC1kb206cHJlYWN0L2NvbXBhdCxyZWFjdDpwcmVhY3QvY29tcGF0CmUvcHJlYWN0L2NvbXBhdA/denonext/core.mjs";
import Flow from "../../../../../../../../../../islands/flow.tsx";
import {PauseModal} from "../../../../../../../../../../components/modals/pauseModal.tsx";


export const handler: Handlers<any> = {
    async GET(_req, ctx) {
        return ctx.render({
            pipelines: await getPipelines(),
            serviceMap: await getServiceMap(),
        });
    },
};

export default function PipelinesRoute(
    props: PageProps<
        {
            pipelines: Pipeline[];
            serviceMap: GetServiceMapResponse;
            success: SuccessType;
        }
    >,
) {
    console.log("hellish", props?.params)
    return (
        <Layout>
            <PauseModal id={props?.params.id} message={`Pipeline ${props?.params.id} has been paused`}/>
            <ReactFlowProvider>
                <Flow data={props?.data?.serviceMap}/>
            </ReactFlowProvider>
        </Layout>
    );
}