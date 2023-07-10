import { Layout } from "../components/layout.tsx";
import { RuleSets, RuleSetType } from "../components/rules/sets.tsx";
import { getJson, getText } from "../lib/fetch.ts";
import { parseMetrics } from "../lib/metrics.ts";
import { PageProps } from "$fresh/src/server/types.ts";
import Flow from "../islands/flow.tsx";

export const handler: Handlers<RuleSetType> = {
  async GET(_req, ctx) {
    return ctx.render({
      ruleSets: await getJson(`/v1/ruleset`),
      metrics: parseMetrics(await getText(`/metrics`)),
    });
  },
};

export default function Home(props: PageProps<RuleSetType>) {
  return (
    <Layout>
      <RuleSets data={props.data} />
    </Layout>
  );
}
