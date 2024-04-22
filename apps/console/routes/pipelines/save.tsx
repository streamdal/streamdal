import { Handlers } from "$fresh/src/server/types.ts";
import { Pipeline } from "streamdal-protos/protos/sp_pipeline.ts";
import { ErrorType, validate } from "../../components/form/validate.ts";
import { ResponseCode } from "streamdal-protos/protos/sp_common.ts";
import { upsertPipeline } from "../../lib/mutation.ts";
import { SuccessType } from "../_middleware.ts";
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

    const { session }: any = ctx.state;

    if (errors) {
      session.flash("success", {
        status: false,
        message: "Validation failed",
        errors,
      });
      return new Response("", {
        status: 307,
        headers: {
          Location: `/pipelines/${pipeline?.id ? pipeline.id : ""}`,
        },
      });
    }

    const response = pipeline ? await upsertPipeline(pipeline) : {
      pipelineId: "",
      code: ResponseCode.GENERIC_ERROR,
      message: "There was a problem processing your request",
    };

    session.flash("success", {
      status: response.code === ResponseCode.OK,
      message: response.code === ResponseCode.OK
        ? "Success!"
        : "Save pipeline failed. Please try again later",
      ...(response.code !== ResponseCode.OK
        ? { errors: { apiError: response.message } }
        : {}),
    });

    return new Response("", {
      status: 307,
      headers: {
        Location: `/pipelines/${response?.pipelineId}`,
      },
    });
  },
};

export default function PipelineSaveRoute() {
  return null;
}
