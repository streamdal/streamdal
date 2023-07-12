import { PageProps } from "$fresh/src/server/types.ts";
import { RuleSets, RuleSetType } from "../components/rules/sets.tsx";
import { Layout } from "../components/layout.tsx";
import { LoginForm } from "../components/auth/loginForm.tsx";

export default function Home(props: PageProps<RuleSetType>) {
  return (
    <Layout hideNav={true}>
      <LoginForm />
    </Layout>
  );
}
