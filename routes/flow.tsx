import { Layout } from "../components/layout.tsx";
import { RuleSetType } from "../components/rules/sets.tsx";
import { PageProps } from "$fresh/src/server/types.ts";
import Flow from "../islands/flow.tsx";

export default function FlowRoute() {
  return (
    <Layout>
      <Flow />
    </Layout>
  );
}
