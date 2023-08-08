import { Handlers } from "$fresh/src/server/types.ts";
import { Pipeline } from "snitch-protos/protos/pipeline.ts";
import { ErrorType, validate } from "../../components/form/validate.ts";
import { pipelineSchema } from "../../islands/pipeline.tsx";
import { ResponseCode } from "snitch-protos/protos/common.ts";
import { upsertPipeline } from "../../lib/mutation.ts";
import { SuccessType } from "./[id]/delete.tsx";

export const handler: Handlers<SuccessType> = {
  async POST(req, ctx) {
    const formData = await req.formData();

    const { data: pipeline, errors }: {
      pipeline: Pipeline;
      errors: ErrorType;
    } = validate(
      pipelineSchema,
      formData,
    );

    if (errors) {
      return new Response(JSON.stringify({
        success: {
          status: false,
          message: "Validation failed",
          errors,
        },
      }));
    }

    const response = await upsertPipeline(pipeline);

    return new Response(JSON.stringify({
      success: {
        status: response.code === ResponseCode.OK,
        message: response.code === ResponseCode.OK
          ? "Success!"
          : "There was a problem. Your request could not be completed",
      },
    }));
  },
};

export default function PipelinesRoute() {
  return null;
}
