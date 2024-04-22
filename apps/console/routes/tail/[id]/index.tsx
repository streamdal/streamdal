import { Handlers, PageProps } from "$fresh/src/server/types.ts";
import { Tail } from "../../../islands/drawer/tail.tsx";
import { audienceFromKey } from "../../../lib/utils.ts";

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
