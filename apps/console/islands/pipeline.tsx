import { useEffect, useState } from "preact/hooks";
import IconChevronDown from "tabler-icons/tsx/chevron-down.tsx";
import IconChevronUp from "tabler-icons/tsx/chevron-up.tsx";
import IconGripVertical from "tabler-icons/tsx/grip-vertical.tsx";
import IconPlus from "tabler-icons/tsx/plus.tsx";

import {
  AbortCondition,
  Pipeline,
  PipelineStep,
} from "streamdal-protos/protos/sp_pipeline.ts";
import { DetectiveType } from "streamdal-protos/protos/steps/sp_steps_detective.ts";
import {
  TransformTruncateType,
  TransformType,
} from "streamdal-protos/protos/steps/sp_steps_transform.ts";
import { zfd } from "zod-form-data";
import * as z from "zod/index.ts";

import { PipelineMenu } from "../components/pipeline/pipelineMenu.tsx";
import { StepMenu } from "../components/pipeline/stepMenu.tsx";
import { Tooltip } from "../components/tooltip/tooltip.tsx";
import { ErrorType, validate } from "../components/form/validate.ts";
import { FormInput } from "../components/form/formInput.tsx";
import { FormHidden } from "../components/form/formHidden.tsx";
import {
  FormSelect,
  kvActionFromEnum,
  kvModeFromEnum,
  optionsFromEnum,
} from "../components/form/formSelect.tsx";
import { isNumeric } from "../lib/utils.ts";
import { InlineInput } from "../components/form/inlineInput.tsx";
import {
  argTypes,
  nArgTypes,
  oneArgTypes,
  StepArgs,
} from "../components/pipeline/stepArgs.tsx";
import { StepConditions } from "../components/pipeline/stepConditions.tsx";
import { DeleteModal } from "../components/modals/deleteModal.tsx";
import { KVAction } from "streamdal-protos/protos/shared/sp_shared.ts";
import { KVMode } from "streamdal-protos/protos/steps/sp_steps_kv.ts";
import { NotificationConfig } from "streamdal-protos/protos/sp_notify.ts";
import { PipelineNotifications } from "../components/pipeline/notifications.tsx";
import { PipelineTransform } from "./pipelineTransform.tsx";
import {
  JSONSchemaDraft,
  SchemaValidationCondition,
  SchemaValidationType,
} from "streamdal-protos/protos/steps/sp_steps_schema_validation.ts";
import { PipelineSchemaValidation } from "./pipelineSchemaValidation.tsx";
import * as uuid from "$std/uuid/mod.ts";
import { HttpRequestMethod } from "streamdal-protos/protos/steps/sp_steps_httprequest.ts";
import { PipelineHTTP } from "./pipelineHTTP.tsx";

const detective = {
  type: DetectiveType.BOOLEAN_TRUE,
  path: "",
  args: [""],
};

const transform = {
  type: TransformType.MASK_VALUE,
  path: "",
  value: "",
};

export const newStep = {
  name: "",
  onSuccess: [],
  onFailure: [],
  step: {
    oneofKind: "detective",
    detective,
  },
};

export const newPipeline: Pipeline = {
  id: "",
  name: "",
  steps: [newStep as PipelineStep],
};

const AbortConditionEnum = z.nativeEnum(AbortCondition);
const DetectiveTypeEnum = z.nativeEnum(DetectiveType);
const TransformTypeEnum = z.nativeEnum(TransformType);
const TransformTruncateTypeEnum = z.nativeEnum(TransformTruncateType);
const SchemaValidationTypeEnum = z.nativeEnum(SchemaValidationType);
const SchemaValidationConditionEnum = z.nativeEnum(SchemaValidationCondition);
const JSONSchemaDraftEnum = z.nativeEnum(JSONSchemaDraft);
const KVActionTypeEnum = z.nativeEnum(KVAction);
const KVModeTypeEnum = z.nativeEnum(KVMode);
const HTTPMethodEnum = z.nativeEnum(HttpRequestMethod);

const kinds = [
  { label: "Detective", value: "detective" },
  { label: "Transform", value: "transform" },
  { label: "Key/Value", value: "kv" },
  { label: "Schema Validation", value: "schemaValidation" },
  { label: "HTTP Request", value: "httpRequest" },
];

const transformOptions = z.discriminatedUnion("oneofKind", [
  z.object({
    oneofKind: z.literal("replaceValueOptions"),
    replaceValueOptions: z.object({
      path: z.string().optional(),
      value: z.string().min(1, { message: "Required" }),
    }),
  }),
  z.object({
    oneofKind: z.literal("deleteFieldOptions"),
    deleteFieldOptions: z
      .object({
        path: z.string().optional(),
      })
      .default({}),
  }),
  z.object({
    oneofKind: z.literal("obfuscateOptions"),
    obfuscateOptions: z
      .object({
        path: z.string().optional(),
      })
      .default({}),
  }),
  z.object({
    oneofKind: z.literal("maskOptions"),
    maskOptions: z
      .object({
        path: z.string().optional(),
      })
      .default({}),
  }),
  z.object({
    oneofKind: z.literal("truncateOptions"),
    truncateOptions: z.object({
      type: zfd.numeric(TransformTruncateTypeEnum),
      path: z.string().optional(),
      value: zfd.numeric(z.number().int().min(1)),
    }),
  }),
  z.object({
    oneofKind: z.literal("extractOptions"),
    extractOptions: z.object({
      flatten: z.preprocess((v) => v === "true", z.boolean()),
      paths: zfd.repeatable(z.array(zfd.text()).min(1)),
    }),
  }),
]);

const schemaValidationOptions = z.discriminatedUnion("oneofKind", [
  z.object({
    oneofKind: z.literal("jsonSchema"),
    jsonSchema: z.object({
      jsonSchema: z
        .string()
        .min(1, { message: "Required" })
        .refine((json) => {
          try {
            JSON.parse(json);
            return true;
          } catch {
            return false;
          }
        }, "Schema is invalid.")
        .transform((v) => new TextEncoder().encode(v)),
      draft: zfd.numeric(JSONSchemaDraftEnum),
    }),
  }),
]);

const stepKindSchema = z.discriminatedUnion("oneofKind", [
  z.object({
    oneofKind: z.literal("detective"),
    detective: z
      .object({
        path: z.string(),
        args: zfd.repeatable(z.array(z.string()).default([])),
        type: zfd.numeric(DetectiveTypeEnum),
        negate: z.boolean().default(false),
      })
      .superRefine((detective, ctx) => {
        if (
          ["HAS_FIELD", "IS_TYPE"].includes(DetectiveType[detective.type]) &&
          detective.path === ""
        ) {
          ctx.addIssue({
            path: ["path"],
            code: z.ZodIssueCode.custom,
            message: "Required",
            fatal: true,
          });

          return z.never;
        }

        if (
          oneArgTypes.includes(DetectiveType[detective.type]) &&
          detective.args.filter((a) => a.trim() !== "")?.length === 0
        ) {
          ctx.addIssue({
            path: ["args.0"],
            code: z.ZodIssueCode.custom,
            message: "One arg required for this step type",
            fatal: true,
          });

          return z.never;
        }

        if (
          nArgTypes.includes(DetectiveType[detective.type]) &&
          detective.args.filter((a) => a.trim() !== "")?.length < 2
        ) {
          ctx.addIssue({
            path: ["args.0"],
            code: z.ZodIssueCode.custom,
            message: "Two args required for this step type",
            fatal: true,
          });

          return z.never;
        }

        if (
          DetectiveType[detective.type].includes("NUMERIC") &&
          detective.args.find((a) => !isNumeric(a))
        ) {
          ctx.addIssue({
            path: [`args.${detective.args.findIndex((a) => !isNumeric(a))}`],
            code: z.ZodIssueCode.custom,
            message: "Numeric args required for this step type",
            fatal: true,
          });

          return z.never;
        }
      }),
  }),
  z.object({
    oneofKind: z.literal("transform"),
    transform: z.object({
      type: zfd.numeric(TransformTypeEnum),
      negate: z.boolean().default(false),
      options: transformOptions,
    }),
  }),
  z.object({
    oneofKind: z.literal("kv"),
    kv: z.object({
      action: zfd.numeric(KVActionTypeEnum),
      mode: zfd.numeric(KVModeTypeEnum),
      key: z.string(),
    }),
  }),
  z.object({
    oneofKind: z.literal("schemaValidation"),
    schemaValidation: z.object({
      type: zfd.numeric(SchemaValidationTypeEnum),
      condition: zfd
        .numeric(SchemaValidationConditionEnum)
        .default(SchemaValidationCondition.MATCH),
      options: schemaValidationOptions,
    }),
  }),
  z.object({
    oneofKind: z.literal("httpRequest"),
    httpRequest: z.object({
      request: z.object({
        method: zfd.numeric(HTTPMethodEnum),
        url: z.string().url(),
        body: z.string().transform((v) => new TextEncoder().encode(v)),
        headers: z
          .record(
            z.string().min(1, { message: "Required" }),
            z.string().min(1, { message: "Required" }),
          )
          .optional(),
      }),
    }),
  }),
  z.object({
    oneofKind: z.literal("encode"),
    encode: z.object({
      id: z.string().min(1, { message: "Required" }),
      negate: z.boolean().default(false),
    }),
  }),
  z.object({
    oneofKind: z.literal("decode"),
    decode: z.object({
      id: z.string().min(1, { message: "Required" }),
      negate: z.boolean().default(false),
    }),
  }),
  z.object({
    oneofKind: z.literal("custom"),
    custom: z.object({
      id: z.string().min(1, { message: "Required" }),
      negate: z.boolean().default(false),
    }),
  }),
]);

const resultConditionSchema = z.object({
  abort: zfd.numeric(AbortConditionEnum).default(AbortCondition.UNSET),
  notify: z.preprocess((v) => v === "true", z.boolean()),
  metadata: z
    .record(
      z.string().min(1, { message: "Required" }),
      z.string().min(1, { message: "Required" }),
    )
    .optional(),
});

const stepSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().min(1, { message: "Required" }),
    dynamic: z.preprocess((v) => v === "true", z.boolean()),
    onTrue: resultConditionSchema.optional(),
    onFalse: resultConditionSchema.optional(),
    onError: resultConditionSchema.optional(),
    step: stepKindSchema,
  })
  .superRefine((step, ctx) => {
    //
    // If this is non-dynamic transform step, path is required
    if (
      step?.step?.oneofKind === "transform" &&
      !step.dynamic &&
      step?.step?.transform?.options?.oneofKind !== "extractOptions" &&
      !step?.step?.transform?.options[step?.step?.transform?.options?.oneofKind]
        ?.path
    ) {
      ctx.addIssue({
        path: [
          `step.transform.options.${step?.step?.transform?.options?.oneofKind}.path`,
        ],
        code: z.ZodIssueCode.custom,
        message: "Required",
        fatal: true,
      });

      return z.never;
    }
  });

export const pipelineSchema = zfd.formData({
  id: z.string().optional(),
  name: z.string().min(1, { message: "Required" }),
  notifications: zfd.repeatable(z.array(z.string())),
  steps: zfd.repeatable(
    z.array(stepSchema).min(1, { message: "At least one step is required" }),
  ),
});

const PipelineDetail = ({
  pipeline,
  notifications,
}: {
  pipeline: Pipeline;
  notifications: NotificationConfig[];
}) => {
  const [open, setOpen] = useState([0]);
  const [deleteOpen, setDeleteOpen] = useState(null);

  //
  // typing the initializer to force preact useState hooks to
  // properly type this since it doesn't support useState<type>
  const e: ErrorType = {};
  const [errors, setErrors] = useState(e);
  const [data, setData] = useState();

  useEffect(() => {
    setData({
      ...pipeline,
      steps: pipeline.steps.map((s: PipelineStep, i) => ({
        ...s,
        dragId: uuid.v1.generate(),
        dragOrder: i,
      })),
    });
  }, [pipeline]);

  const [dragId, setDragId] = useState(null);
  const [canDrag, setCanDrag] = useState(false);

  const addStep = () => {
    setData({
      ...data,
      steps: [
        ...data.steps,
        ...[
          {
            ...newStep,
            dragId: uuid.v1.generate(),
            dragOrder: data.steps.length,
          },
        ],
      ],
    });
    setOpen([...open, data.steps.length]);
    setTimeout(() => initFlowbite(), 1000);
  };

  const deleteStep = (stepIndex: number) => {
    setData({ ...data, steps: data.steps.filter((_, i) => i !== stepIndex) });
    setDeleteOpen(null);
  };

  const onSubmit = async (e: any) => {
    const formData = new FormData(e.target);

    const { errors } = validate(pipelineSchema, formData);
    setErrors(errors || {});

    if (errors) {
      e.preventDefault();
      return;
    }
  };

  const handleDrag = (ev: React.DragEvent<HTMLDivElement>) => {
    setDragId(ev.currentTarget.id);
  };

  const handleDrop = (ev: React.DragEvent<HTMLDivElement>) => {
    const dragStep = data.steps.find((s) => s.dragId === dragId);
    const dropStep = data.steps.find((s) => s.dragId === ev.currentTarget.id);
    const dragOrder = dragStep.dragOrder;
    const dropOrder = dropStep.dragOrder;

    setData({
      ...data,
      steps: data.steps.map((s) => ({
        ...s,
        dragOrder: s.dragId === dragId
          ? dropOrder
          : s.dragId === ev.currentTarget.id
          ? dragOrder
          : s.dragOrder,
      })),
    });
    setDragId(null);
  };

  return (
    <>
      <form onSubmit={onSubmit} action="/pipelines/save" method="post">
        <div class="flex items-center justify-between rounded-t px-[18px] pb-[8px] pt-[18px]">
          <div class="flex flex-row items-center">
            <div class="mr-2 h-[54px] text-[30px] font-medium">
              <FormHidden name="id" value={data?.id} />
              <InlineInput
                placeHolder="Name your pipeline"
                name="name"
                data={data}
                setData={setData}
                errors={errors}
              />
            </div>
            <PipelineMenu id={pipeline?.id} />
          </div>
          <div>
            <a href="/" f-partial="/partials">
              <img src="/images/x.svg" className="w-[14px]" />
            </a>
          </div>
        </div>
        <div class="flex flex-col px-6">
          <div class="mb-2 flex flex-row items-center justify-between">
            <div class="flex flex-row items-center">
              <div class="mr-2 text-[16px] font-semibold">Notifications</div>
              <div class="text-stormCloud text-[14px] font-medium">
                - used by the notify step settings below
              </div>
            </div>
          </div>
          <div class={`flex flex-col`}>
            <div class="border-twilight flex flex-col rounded-sm border p-2">
              {notifications?.length
                ? (
                  <PipelineNotifications
                    notifications={notifications}
                    data={data}
                    setData={setData}
                  />
                )
                : (
                  <div class="text-stormCloud flex flex-row items-center justify-start text-sm font-medium">
                    <a
                      href="/notifications"
                      class="text-underline flex flex-row items-center justify-start"
                    >
                      <IconPlus class={"mr-2 h-3 w-3"} /> add notifications
                    </a>
                  </div>
                )}
            </div>
          </div>
        </div>
        <div class="flex flex-col px-6 pt-6">
          <div class="mb-6 flex flex-row items-center justify-between">
            <div class="flex flex-row items-center">
              <div class="mr-2 text-[16px] font-semibold">Steps</div>
              <div class="text-stormCloud text-[14px] font-medium">
                {pipeline?.steps?.length || 0}
              </div>
            </div>
            <IconPlus
              data-tooltip-target="step-add"
              class="h-5 w-5 cursor-pointer"
              onClick={() => {
                addStep();
              }}
            />
            <Tooltip targetId="step-add" message="Add a new step" />
          </div>
          {{ ...data }?.steps
            ?.sort((a, b) => a.dragOrder - b.dragOrder)
            .map((step: PipelineStep & { dragId: string }, i: number) => (
              <div class="mb-6 flex flex-row items-start">
                <div class="text-twilight mr-6 mt-4 text-[16px] font-medium">
                  {i + 1}
                </div>
                <div class="border-twilight w-full rounded-md border">
                  <div
                    class="flex w-full flex-row justify-between px-[9px] py-[13px]"
                    id={step.dragId}
                    draggable={canDrag}
                    onDragOver={(ev) => ev.preventDefault()}
                    onDragStart={handleDrag}
                    onDrop={handleDrop}
                  >
                    <div class="flex flex-row">
                      <div class="mr-2">
                        <IconGripVertical
                          class="text-twilight h-6 w-6 cursor-grab"
                          onMouseEnter={() => setCanDrag(true)}
                          onMouseLeave={() => setCanDrag(true)}
                        />
                      </div>
                      <div class="mr-2 text-[16px] font-medium">
                        <InlineInput
                          placeHolder={"Name your step"}
                          name={`steps.${i}.name`}
                          data={data}
                          setData={setData}
                          errors={errors}
                          defaultValue={`Step #${i + 1}`}
                        />
                      </div>
                      <StepMenu
                        index={i}
                        step={step}
                        onDelete={() => {
                          setDeleteOpen(i);
                        }}
                      />
                      {deleteOpen === i
                        ? (
                          <DeleteModal
                            id={i}
                            entityType="Pipeline step"
                            entityName={step.name}
                            onClose={() => setDeleteOpen(null)}
                            onDelete={() => deleteStep(i)}
                          />
                        )
                        : null}
                    </div>
                    {open.includes(i)
                      ? (
                        <IconChevronUp
                          class="text-twilight h-6 w-6 cursor-pointer"
                          onClick={() =>
                            setOpen(open.filter((o: number) => o !== i))}
                        />
                      )
                      : (
                        <IconChevronDown
                          class="text-twilight h-6 w-6 cursor-pointer"
                          onClick={() => setOpen([...open, i])}
                        />
                      )}
                  </div>
                  <div
                    class={`mr-2 border-t p-[13px] text-[16px] font-medium ${
                      open.includes(i) ? "visible" : "hidden"
                    }`}
                  >
                    <FormSelect
                      name={`steps.${i}.step.oneofKind`}
                      data={data}
                      setData={setData}
                      label="Step Type"
                      errors={errors}
                      inputClass="w-64"
                      children={kinds.map((kind, i) => (
                        <option
                          key={`step-kind-key-${i}`}
                          value={kind.value}
                          label={kind.label}
                        />
                      ))}
                    />
                    {"detective" === step.step.oneofKind && (
                      <>
                        <FormInput
                          name={`steps.${i}.step.detective.path`}
                          data={data}
                          setData={setData}
                          label="Path"
                          placeHolder={["HAS_FIELD", "IS_TYPE"].includes(
                              DetectiveType[data.steps[i].step.detective?.type],
                            )
                            ? "json.path"
                            : "an empty path will search entire json payload"}
                          errors={errors}
                        />
                        <div className="flex flex-col">
                          <FormSelect
                            name={`steps.${i}.step.detective.type`}
                            label="Detective Type"
                            data={data}
                            setData={setData}
                            errors={errors}
                            inputClass="w-64"
                            children={optionsFromEnum(DetectiveType)}
                          />
                          <div>
                            {argTypes.includes(
                              DetectiveType[data.steps[i].step.detective?.type],
                            ) && (
                              <StepArgs
                                stepIndex={i}
                                type={DetectiveType[
                                  data.steps[i].step.detective.type
                                ]}
                                data={data}
                                setData={setData}
                                errors={errors}
                              />
                            )}
                          </div>
                        </div>
                      </>
                    )}
                    {"transform" === step.step.oneofKind && (
                      <PipelineTransform
                        stepNumber={i}
                        step={step}
                        data={data}
                        setData={setData}
                        errors={errors}
                      />
                    )}
                    {"schemaValidation" === step.step.oneofKind && (
                      <PipelineSchemaValidation
                        stepNumber={i}
                        step={step}
                        data={data}
                        setData={setData}
                        errors={errors}
                      />
                    )}
                    {"kv" === step.step.oneofKind && (
                      <>
                        <FormSelect
                          name={`steps.${i}.step.kv.action`}
                          label="Type"
                          data={data}
                          setData={setData}
                          errors={errors}
                          inputClass="w-64"
                          children={kvActionFromEnum(KVAction)}
                        />
                        <FormSelect
                          name={`steps.${i}.step.kv.mode`}
                          label="Mode"
                          data={data}
                          setData={setData}
                          errors={errors}
                          inputClass="w-64"
                          children={kvModeFromEnum(KVMode)}
                        />
                        <FormInput
                          name={`steps.${i}.step.kv.key`}
                          data={data}
                          setData={setData}
                          label="Key"
                          errors={errors}
                        />
                      </>
                    )}
                    {"httpRequest" === step.step.oneofKind && (
                      <PipelineHTTP
                        stepNumber={i}
                        data={data}
                        setData={setData}
                        errors={errors}
                      />
                    )}
                    <StepConditions
                      stepIndex={i}
                      data={data}
                      setData={setData}
                      errors={errors}
                    />
                  </div>
                </div>
              </div>
            ))}
        </div>
        <div class="mb-6 mr-6 flex flex-row justify-end">
          <button class="btn-heimdal" type="submit">
            Save
          </button>
        </div>
      </form>
    </>
  );
};

export default PipelineDetail;
