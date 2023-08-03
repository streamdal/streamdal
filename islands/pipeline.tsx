import { useState } from "preact/hooks";
import IconChevronDown from "tabler-icons/tsx/chevron-down.tsx";
import IconChevronUp from "tabler-icons/tsx/chevron-up.tsx";
import IconGripVertical from "tabler-icons/tsx/grip-vertical.tsx";
import IconPlus from "tabler-icons/tsx/plus.tsx";

import {
  Pipeline,
  PipelineStep,
  PipelineStepCondition,
} from "snitch-protos/protos/pipeline.ts";
import { DetectiveType } from "snitch-protos/protos/steps/detective.ts";
import { TransformType } from "snitch-protos/protos/steps/transform.ts";
import { zfd } from "zod-form-data";
import * as z from "zod/index.ts";

import { PipelineMenu } from "../components/pipeline/pipelineMenu.tsx";
import { StepMenu } from "../components/pipeline/stepMenu.tsx";
import { Tooltip } from "../components/tooltip/tooltip.tsx";
import { ErrorType, validate } from "../components/form/validate.ts";
import { FormInput } from "../components/form/formInput.tsx";
import { FormHidden } from "../components/form/formHidden.tsx";
import { FormSelect, optionsFromEnum } from "../components/form/formSelect.tsx";
import { titleCase } from "../lib/utils.ts";
import { InlineInput } from "../components/form/inlineInput.tsx";

const StepConditionEnum = z.nativeEnum(PipelineStepCondition);
const DetectiveTypeEnum = z.nativeEnum(DetectiveType);
const TransformTypeEnum = z.nativeEnum(TransformType);

const kinds = ["detective", "transform", "encode", "decode"];

const stepKindSchema = z.discriminatedUnion("oneofKind", [
  z.object({
    oneofKind: z.literal("detective"),
    path: z.string().min(1, { message: "Required" }),
    args: z.string().array().optional(),
    type: DetectiveTypeEnum,
    negate: z.boolean(),
  }),
  z.object({
    oneofKind: z.literal("transform"),
    path: z.string().min(1, { message: "Required" }),
    value: z.string().min(1, { message: "Required" }),
    type: TransformTypeEnum,
  }),
  z.object({
    oneofKind: z.literal("encode"),
    id: z.string().min(1, { message: "Required" }),
  }),
  z.object({
    oneofKind: z.literal("decode"),
    id: z.string().min(1, { message: "Required" }),
  }),
  z.object({
    oneofKind: z.literal("custom"),
    id: z.string().min(1, { message: "Required" }),
  }),
]);

const stepSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, { message: "Required" }),
  onSuccess: StepConditionEnum.array(),
  onFailure: StepConditionEnum.array(),
  step: stepKindSchema,
});

export type StepType = z.infer<typeof stepSchema>;

const pipelineSchema = zfd.formData({
  id: z.string().optional(),
  name: z.string().min(1, { message: "Required" }),
  steps: zfd.repeatable(
    z
      .array(stepSchema)
      .min(1, { message: "At least one step  is required" }),
  ),
});

export type PipelineType = z.infer<typeof pipelineSchema>;

const PipelineDetail = ({ pipeline }: { pipeline: Pipeline }) => {
  const [open, setOpen] = useState(new Array(0));

  //
  // typing the initializer to force preact useState hooks to
  // properly type this since it doesn't support useState<type>
  const e: ErrorType = {};
  const [errors, setErrors] = useState(e);
  const [data, setData] = useState(pipeline);

  const onSubmit = async (e: any) => {
    e.preventDefault();

    const { data, errors } = validate(pipelineSchema, new FormData(e.target));

    console.log("submit errors", errors);
    console.log("submit data", data);
    setErrors(errors);
  };

  return (
    <form onSubmit={onSubmit}>
      <div class="flex justify-between rounded-t items-center px-[18px] pt-[18px] pb-[8px]">
        <div class="flex flex-row items-center">
          <div class="text-[30px] font-medium mr-2 h-[54px]">
            <FormHidden name="id" value={data?.id} />
            <InlineInput
              placeHolder="Name your pipeline"
              name={"name"}
              data={data}
              setData={setData}
              errors={errors}
            />
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
        {data?.steps?.map((
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
                    <InlineInput
                      name={`steps[${i}].name`}
                      data={data}
                      setData={setData}
                      errors={errors}
                    />
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
                  <div class="border-t p-[13px] text-[16px] font-medium mr-2">
                    <FormSelect
                      name={`steps[${i}].step.oneofKind`}
                      data={data}
                      setData={setData}
                      label="Step Type"
                      errors={errors}
                      inputClass="w-36"
                      children={kinds.map((k, i) => (
                        <option
                          key={`step-kind-key-${i}`}
                          value={k}
                          label={titleCase(k)}
                        />
                      ))}
                    />
                    {["detective", "transform"].includes(
                      data?.steps[i]?.step?.oneofKind,
                    ) && (
                      <FormInput
                        name={`steps[${i}].step.detective.path`}
                        data={data}
                        setData={setData}
                        label="Path"
                        placeHolder="ex: object.field"
                        errors={errors}
                      />
                    )}
                    {"detective" ===
                        data?.steps[i]?.step?.oneofKind &&
                      (
                        <FormSelect
                          name={`steps[${i}].step.detective.type`}
                          label="Detective Type"
                          data={data}
                          setData={setData}
                          errors={errors}
                          inputClass="w-64"
                          children={optionsFromEnum(DetectiveType)}
                        />
                      )}
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
