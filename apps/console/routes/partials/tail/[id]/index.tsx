import { Handlers, PageProps } from "$fresh/src/server/types.ts";
import { Tail } from "root/islands/drawer/tail.tsx";
import { audienceFromKey } from "root/lib/utils.ts";

export const handler: Handlers = {};

export const PartialTailRoute = (
  props: PageProps<
    {
      id: string;
    }
  >,
) => (
  <Tail
    audience={audienceFromKey(decodeURIComponent(props?.params?.id))}
  />
);

export default PartialTailRoute;
