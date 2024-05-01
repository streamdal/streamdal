import { Handlers, PageProps } from "$fresh/src/server/types.ts";
import { Tail } from "root/islands/tail.tsx";
import { audienceFromKey } from "root/lib/utils.ts";

export const handler: Handlers = {};

export const TailRoute = (
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

export default TailRoute;
