import { Handlers } from "$fresh/src/server/types.ts";
import PipelinesRoute, {
  handler as pipelineHandler,
  PipelineRoute,
} from "./index.tsx";

export const handler: Handlers<PipelineRoute> = pipelineHandler;

export default PipelinesRoute;
