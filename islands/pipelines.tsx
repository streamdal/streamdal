import IconPlus from "https://deno.land/x/tabler_icons_tsx@0.0.3/tsx/plus.tsx";
import { useState } from "https://esm.sh/stable/preact@10.15.1/denonext/hooks.js";
import {
  Pipeline,
  PipelineStepCondition,
} from "snitch-protos/protos/pipeline.ts";
import { DetectiveType } from "snitch-protos/protos/steps/detective.ts";
import { TransformType } from "snitch-protos/protos/steps/transform.ts";
import * as z from "zod/index.ts";

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

const pipelineSchema = z.object({
  pipeline: z.object({
    id: z.string().optional(),
    name: z.string().min(1, { message: "Required" }),
    steps: stepSchema
      .array()
      .min(1, { message: "At least one pipeline step is required" }),
  }),
});

export type PipelineType = z.infer<typeof pipelineSchema>;

const Pipelines = ({ pipelines }: { pipelines?: Pipeline[] }) => {
  const [selected, setSelected] = useState(0);
  return (
    <div
      id="defaultModal"
      aria-modal="true"
      class="fixed top-0 left-0 right-0 z-50 w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full justify-center items-center flex"
      role="dialog"
    >
      <div class="relative w-full max-w-4xl max-h-full">
        <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
          <div class="flex justify-start">
            <div class="border-r w-1/3 flex flex-col pb-[16px]">
              <div class="flex justify-between items-center pt-[26px] pb-[16px] px-[14px]">
                <div class="text-[16px] font-bold">Pipelines</div>
                <IconPlus class="w-4 h-4 cursor-pointer" />
              </div>
              {pipelines?.map((p: Pipeline, i: number) => (
                <div
                  class={`py-[14px] pl-[30px] ${
                    i === selected && "bg-sunset"
                  } cursor-pointer`}
                  onClick={() => setSelected(i)}
                >
                  {p.name}
                </div>
              ))}
            </div>
            <div class="w-full">
              <div class="flex justify-between rounded-t items-center p-[18px]">
                <div class="text-[30px] font-medium">
                  {pipelines[selected]?.name}
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
              <div class="p-6 space-y-6">
                <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                  Rule details coming here.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pipelines;
