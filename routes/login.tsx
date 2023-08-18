import { PageProps } from "$fresh/src/server/types.ts";
import { RuleSetType } from "../components/rules/sets.tsx";
import { LoginForm } from "../components/auth/loginForm.tsx";

import { RouteConfig } from "$fresh/server.ts";

export const config: RouteConfig = {
  skipInheritedLayouts: true,
};

export default function Login(props: PageProps<RuleSetType>) {
  return <LoginForm />;
}
