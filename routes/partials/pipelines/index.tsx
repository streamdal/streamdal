import { Handlers } from "$fresh/src/server/types.ts";
import {
  handler as pipelineHandler,
  PipelineRoute,
  PipelinesRoute,
} from "../../pipelines/index.tsx";

export const handler: Handlers<PipelineRoute> = pipelineHandler;

export default PipelinesRoute;
