import { RouteConfig } from "$fresh/server.ts";
import { DemoHttpRequest } from "../../../islands/demo/http-request.tsx";

export const config: RouteConfig = {
  skipInheritedLayouts: true,
};

export default function DemoHttpIndexRoute() {
  return <DemoHttpRequest />;
}
