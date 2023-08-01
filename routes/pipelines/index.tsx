import { Handlers, PageProps } from "$fresh/src/server/types.ts";
import {
  ReactFlowProvider,
} from "https://esm.sh/v128/@reactflow/core@11.7.4/X-YS9AdHlwZXMvcmVhY3Q6cHJlYWN0L2NvbXBhdCxyZWFjdC1kb206cHJlYWN0L2NvbXBhdCxyZWFjdDpwcmVhY3QvY29tcGF0CmUvcHJlYWN0L2NvbXBhdA/denonext/core.mjs";
import { GetServiceMapResponse } from "snitch-protos/protos/external.ts";
import { Pipeline } from "snitch-protos/protos/pipeline.ts";
import { Layout } from "../../components/layout.tsx";
import Flow from "../../islands/flow.tsx";
import Pipelines from "../../islands/pipelines.tsx";
import { client } from "../../lib/grpc.ts";

const dummyPipelines = [{
  id: "1234-1234-123456",
  name: "Best pipeline",
  steps: [
    {
      name: "Best step",
      onSuccess: [],
      onFailure: [1],
      step: {
        oneofKind: "detective",
        detective: {
          path: "object.field",
          args: [],
          negate: false,
          type: 1006,
        },
      },
      WasmId: "",
      WasmBytes: [],
      WasmFunction: "",
    },
  ],
}, {
  id: "5432-5432-32432",
  name: "Another pipeline",
  steps: [
    {
      name: "Another step",
      onSuccess: [],
      onFailure: [1],
      step: {
        oneofKind: "detective",
        detective: {
          path: "object.field",
          args: [],
          negate: false,
          type: 1006,
        },
      },
      WasmId: "",
      WasmBytes: [],
      WasmFunction: "",
    },
  ],
}];

export const handler: Handlers<any> = {
  async GET(_req, ctx) {
    let pipelines = [];
    let serviceMap = {};
    try {
      const { response: serviceResponse } = await client.getServiceMap({}, {
        meta: { "auth-token": "1234" },
      });

      serviceMap = serviceResponse;

      const { response: pipelineResponse } = await client.getPipelines({}, {
        meta: { "auth-token": "1234" },
      });
      pipelines = pipelineResponse?.pipelines;
    } catch (error) {
      console.log("error fetching pipelines", error);
      console.log("sending dummy data until this is implemented");
      pipelines = dummyPipelines;
    }

    return ctx.render({
      pipelines,
      serviceMap,
    });
  },
};

export default function PipelinesRoute(
  props: PageProps<
    { pipelines: Pipeline[]; serviceMap: GetServiceMapResponse }
  >,
) {
  return (
    <Layout>
      <Pipelines pipelines={props?.data?.pipelines} />
      <ReactFlowProvider>
        <Flow data={props?.data?.serviceMap} />
      </ReactFlowProvider>
    </Layout>
  );
}
