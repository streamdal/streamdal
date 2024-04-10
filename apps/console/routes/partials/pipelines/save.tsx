import { Handlers } from "$fresh/src/server/types.ts";
import { Pipeline } from "streamdal-protos/protos/sp_pipeline.ts";
import { ErrorType, validate } from "../../../components/form/validate.ts";
import { ResponseCode } from "streamdal-protos/protos/sp_common.ts";
import { upsertPipeline } from "../../../lib/mutation.ts";
import { SuccessType } from "../../_middleware.ts";
import { PipelineSchema } from "root/components/pipeline/pipeline.ts";

export const handler: Handlers<SuccessType> = {
  async POST(req, ctx) {
    const formData = await req.formData();

    const {
      data: pipeline,
      errors,
    }: { data: Pipeline | null; errors: ErrorType | null } = validate(
      PipelineSchema as any,
      formData,
    );

    if (errors) {
      return new Response(
        JSON.stringify({
          code: ResponseCode.BAD_REQUEST,
          message: JSON.stringify(errors),
        }),
      );
    }

    const response = pipeline ? await upsertPipeline(pipeline) : {
      pipelineId: "",
      code: ResponseCode.GENERIC_ERROR,
      message: "There was a problem processing your request",
    };

    return new Response(JSON.stringify(response));
  },
};
