import { Handlers, PageProps, RouteConfig } from "$fresh/src/server/types.ts";
import { Partial } from "$fresh/runtime.ts";
import { Tail } from "root/islands/drawer/tail.tsx";
import { audienceFromKey } from "root/lib/utils.ts";

export const config: RouteConfig = {
  skipAppWrapper: true,
  skipInheritedLayouts: true,
};

const handler: Handlers = {};

export const PartialTailRoute = (
  props: PageProps<
    {
      id: string;
    }
  >,
) => (
  <Partial name="overlay-content">
    <Tail
      audience={audienceFromKey(decodeURIComponent(props?.params?.id))}
    />
  </Partial>
);

export default PartialTailRoute;
