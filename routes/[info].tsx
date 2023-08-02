import { Layout } from "../components/layout.tsx";
import Flow from "../islands/flow.tsx";
import {
  ReactFlowProvider,
} from "https://esm.sh/v128/@reactflow/core@11.7.4/X-YS9AdHlwZXMvcmVhY3Q6cHJlYWN0L2NvbXBhdCxyZWFjdC1kb206cHJlYWN0L2NvbXBhdCxyZWFjdDpwcmVhY3QvY29tcGF0CmUvcHJlYWN0L2NvbXBhdA/denonext/core.mjs";
import { InfoModal } from "../components/modals/InfoModal.tsx";
import { PageProps } from "$fresh/src/server/types.ts";



export default function FlowRoute(props: PageProps, data: any) {
  console.log(props);
  console.log("hellish", data);
  return (
    <Layout>
      <InfoModal name={props} />
      <ReactFlowProvider>
        <Flow data={data}/>
      </ReactFlowProvider>
    </Layout>
  );
}
