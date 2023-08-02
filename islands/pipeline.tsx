import IconChevronDown from "https://deno.land/x/tabler_icons_tsx@0.0.3/tsx/chevron-down.tsx";
import IconChevronUp from "https://deno.land/x/tabler_icons_tsx@0.0.3/tsx/chevron-up.tsx";
import IconGripVertical from "https://deno.land/x/tabler_icons_tsx@0.0.3/tsx/grip-vertical.tsx";
import IconPlus from "https://deno.land/x/tabler_icons_tsx@0.0.3/tsx/plus.tsx";
import { useEffect, useState } from "preact/hooks";

import {
  Pipeline,
  PipelineStep,
  PipelineStepCondition,
} from "snitch-protos/protos/pipeline.ts";
import { DetectiveType } from "snitch-protos/protos/steps/detective.ts";
import { TransformType } from "snitch-protos/protos/steps/transform.ts";
import * as z from "zod/index.ts";
import { zfd } from "zod-form-data";

import { PipelineMenu } from "../components/pipeline/pipelineMenu.tsx";
import { StepMenu } from "../components/pipeline/stepMenu.tsx";
import { Tooltip } from "../components/tooltip/tooltip.tsx";
import { ZodError, ZodIssue } from "zod/index.ts";

const StepConditionEnum = z.nativeEnum(PipelineStepCondition);
const DetectiveTypeEnum = z.nativeEnum(DetectiveType);
const TransformTypeEnum = z.nativeEnum(TransformType);

const baseStepSchema = z.object({
  id: z.string().optional(),
  type: z.literal("RULE_TYPE_MATCH"),
  name: z.string().min(1, { message: "Required" }),
  onSuccess: StepConditionEnum.array(),
  onFailure: StepConditionEnum.array(),
});

const stepSchema = z
  .discriminatedUnion("oneofKind", [
    baseStepSchema.extend({
      oneofKind: z.literal("detective"),
      path: z.string().min(1, { message: "Required" }),
      args: z.string().array().optional(),
      type: DetectiveTypeEnum,
      negate: z.boolean(),
    }),
    baseStepSchema.extend({
      oneofKind: z.literal("transform"),
      path: z.string().min(1, { message: "Required" }),
      value: z.string().min(1, { message: "Required" }),
      type: TransformTypeEnum,
    }),
    baseStepSchema.extend({
      oneofKind: z.literal("encode"),
      id: z.string().min(1, { message: "Required" }),
    }),
    baseStepSchema.extend({
      oneofKind: z.literal("decode"),
      id: z.string().min(1, { message: "Required" }),
    }),
    baseStepSchema.extend({
      oneofKind: z.literal("custom"),
      id: z.string().min(1, { message: "Required" }),
    }),
  ]);

export type StepType = z.infer<typeof stepSchema>;

const pipelineSchema = zfd.formData({
  pipeline: z.object({
    id: z.string().optional(),
    name: z.string().min(1, { message: "Required" }),
    steps: stepSchema
      .array()
      .min(1, { message: "At least one pipeline step is required" }),
  }),
});

export type PipelineType = z.infer<typeof pipelineSchema>;

const PipelineDetail = ({ pipeline }: { pipeline: Pipeline }) => {
  const [open, setOpen] = useState(new Array(0));
  const [errors, setErrors] = useState({});

  const onSubmit = async (e: any) => {
    e.preventDefault();

    try {
      pipelineSchema.parse(new FormData(e.target));
      setErrors({});
    } catch (error: ZodError) {
      const errors = error.issues.reduce(
        (o, e: ZodIssue) => ({ ...o, [e.path.join(".")]: e.message }),
        {},
      );
      setErrors(errors);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <div class="flex justify-between rounded-t items-center px-[18px] pt-[18px] pb-[8px]">
        <div class="flex flex-row items-center">
          <div class="text-[30px] font-medium mr-2 h-[54px]">
            <div class="flex flex-col">
              <input
                id="pipeline.name"
                name="pipeline.name"
                class={`rounded-sm border border-${
                  errors["pipeline.name"] ? "streamdalRed" : "white"
                }`}
                value={pipeline?.name}
                placeholder="Name your pipeline"
              />

              <div className="text-[12px] mt-1 font-semibold text-streamdalRed">
                {errors["pipeline.name"]}
              </div>
            </div>
          </div>
          {<PipelineMenu id={pipeline.id} />}
        </div>
        <div>
          <a href="/">
            <button
              type="button"
              class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
            >
              <svg
                class="w-3 h-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 14"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                />
              </svg>
              <span class="sr-only">Close modal</span>
            </button>
          </a>
        </div>
      </div>
      <div class="p-6 flex flex-col">
        <div class="flex flex-row items-center justify-between mb-6">
          <div class="flex flex-row items-center">
            <div class="text-[16px] font-semibold mr-2">
              Steps
            </div>
            <div class="text-[14px] font-medium text-stormCloud">
              {pipeline?.steps?.length || 0}
            </div>
          </div>
          <IconPlus
            data-tooltip-target="step-add"
            class="w-5 h-5 cursor-pointer"
          />
          <Tooltip targetId="step-add" message="Add a step" />
        </div>
        {pipeline?.steps?.map((
          step: PipelineStep,
          i: number,
        ) => (
          <div class="flex flex-row items-start mb-6">
            <div class="text-[16px] font-medium text-twilight mr-6 mt-4">
              {i + 1}
            </div>
            <div class="rounded-md border border-twilight w-full">
              <div class="flex flex-row w-full justify-between px-[9px] py-[13px]">
                <div class="flex flex-row">
                  <div class="mr-2">
                    <IconGripVertical class="w-6 h-6 text-twilight cursor-pointer" />
                  </div>
                  <div class="text-[16px] font-medium mr-2">
                    {step.name}
                  </div>
                  <StepMenu
                    onDelete={() => console.log("delete coming soon...")}
                  />
                </div>
                {open.includes(i)
                  ? (
                    <IconChevronUp
                      class="w-6 h-6 text-twilight cursor-pointer"
                      onClick={() =>
                        setOpen(open.filter((o: number) => o !== i))}
                    />
                  )
                  : (
                    <IconChevronDown
                      class="w-6 h-6 text-twilight cursor-pointer"
                      onClick={() => setOpen([...open, i])}
                    />
                  )}
              </div>
              {open.includes(i)
                ? (
                  <div class="border-t p-[13px]">
                    ...step details coming soon...
                  </div>
                )
                : null}
            </div>
          </div>
        ))}
      </div>
      <div class="flex flex-row justify-end mr-6 mb-6">
        <button className="btn-secondary mr-2">Cancel</button>
        <button class="btn-heimdal" type="submit">Save</button>
      </div>
    </form>
  );
};

export default PipelineDetail;
