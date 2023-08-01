import { Handlers, PageProps } from "$fresh/src/server/types.ts";
import { Layout } from "../components/layout.tsx";
import { RuleSets, RuleSetType } from "../components/rules/sets.tsx";

export const handler: Handlers<RuleSetType> = {
  // deno-lint-ignore require-await
  async GET(_req, ctx) {
    return ctx.render({
      ruleSets: [],
      metrics: [],
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
