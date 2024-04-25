import {
  AbortCondition,
  Pipeline,
  PipelineStep,
  PipelineStepNotification_PayloadType,
} from "streamdal-protos/protos/sp_pipeline.ts";
import { DetectiveType } from "streamdal-protos/protos/steps/sp_steps_detective.ts";
import {
  TransformTruncateType,
  TransformType,
} from "streamdal-protos/protos/steps/sp_steps_transform.ts";
import {
  JSONSchemaDraft,
  SchemaValidationCondition,
  SchemaValidationType,
} from "streamdal-protos/protos/steps/sp_steps_schema_validation.ts";
import { KVAction } from "streamdal-protos/protos/shared/sp_shared.ts";
import { KVMode } from "streamdal-protos/protos/steps/sp_steps_kv.ts";
import { HttpRequestMethod } from "streamdal-protos/protos/steps/sp_steps_httprequest.ts";
import { numeric, repeatable, text } from "../form/validate.ts";
import { isNumeric } from "../../lib/utils.ts";
import { z } from "zod/mod.ts";

export const oneArgTypes: (keyof typeof DetectiveType)[] = [
  "STRING_EQUAL",
  "REGEX",
  "STRING_LENGTH_MIN",
  "STRING_LENGTH_MAX",
  "NUMERIC_EQUAL_TO",
  "STRING_CONTAINS_ANY",
  "STRING_CONTAINS_ALL",
  "NUMERIC_GREATER_THAN",
  "NUMERIC_GREATER_EQUAL",
  "NUMERIC_LESS_THAN",
  "NUMERIC_LESS_EQUAL",
  "NUMERIC_MIN",
  "NUMERIC_MAX",
  "IS_TYPE",
];

export const nArgTypes: (keyof typeof DetectiveType)[] = [
  "STRING_LENGTH_RANGE",
  "NUMERIC_RANGE",
];

const detective = {
  type: DetectiveType.IS_EMPTY,
  path: "",
  args: [""],
};

export const newStep: PipelineStep = {
  name: "",
  dynamic: false,
  onTrue: {
    abort: AbortCondition.UNSET,
    notify: false,
    metadata: {},
  },
  onFalse: {
    abort: AbortCondition.UNSET,
    notify: false,
    metadata: {},
  },
  onError: {
    abort: AbortCondition.UNSET,
    notify: false,
    metadata: {},
  },
  step: {
    oneofKind: "detective",
    detective,
  },
};

export const newPipeline: Pipeline = {
  id: "",
  name: "",
  steps: [newStep as PipelineStep],
  NotificationConfigs: [],
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
const NotificationPayloadTypeEnum = z.nativeEnum(
  PipelineStepNotification_PayloadType,
);

export const kinds = [
  { label: "Detective", value: "detective" },
  { label: "Transform", value: "transform" },
  { label: "Key/Value", value: "kv" },
  { label: "Schema Validation", value: "schemaValidation" },
  { label: "HTTP Request", value: "httpRequest" },
  { label: "Custom Wasm", value: "custom" },
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
        paths: repeatable(z.array(text())),
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
      type: numeric(TransformTruncateTypeEnum),
      path: z.string().optional(),
      value: z.coerce.number().int().min(1),
    }),
  }),
  z.object({
    oneofKind: z.literal("extractOptions"),
    extractOptions: z.object({
      flatten: z.preprocess((v) => v === "true", z.boolean()),
      paths: repeatable(z.array(text()).min(1)),
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
      draft: numeric(JSONSchemaDraftEnum),
    }),
  }),
]);

const stepKindSchema = z.discriminatedUnion("oneofKind", [
  z.object({
    oneofKind: z.literal("detective"),
    detective: z
      .object({
        path: z.string(),
        args: repeatable(z.array(z.string()).default([])),
        type: numeric(DetectiveTypeEnum),
        negate: z.boolean().default(false),
      })
      .superRefine((detective, ctx) => {
        if (
          ["HAS_FIELD", "IS_TYPE", "IS_EMPTY"].includes(
            DetectiveType[detective.type],
          ) &&
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
          oneArgTypes.includes(
            DetectiveType[detective.type] as any,
          ) &&
          detective.args.filter((a: string) => a.trim() !== "")?.length === 0
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
          nArgTypes.includes(DetectiveType[detective.type] as any) &&
          detective.args.filter((a: string) => a.trim() !== "")?.length < 2
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
          detective.args.find((a: string) => !isNumeric(a))
        ) {
          ctx.addIssue({
            path: [
              `args.${detective.args.findIndex((a: string) => !isNumeric(a))}`,
            ],
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
      type: numeric(TransformTypeEnum),
      negate: z.boolean().default(false),
      options: transformOptions,
    }),
  }),
  z.object({
    oneofKind: z.literal("kv"),
    kv: z.object({
      action: numeric(KVActionTypeEnum),
      mode: numeric(KVModeTypeEnum),
      key: z.string(),
    }),
  }),
  z.object({
    oneofKind: z.literal("schemaValidation"),
    schemaValidation: z.object({
      type: numeric(SchemaValidationTypeEnum),
      condition: numeric(SchemaValidationConditionEnum)
        .default(SchemaValidationCondition.MATCH),
      options: schemaValidationOptions,
    }),
  }),
  z.object({
    oneofKind: z.literal("httpRequest"),
    httpRequest: z.object({
      request: z.object({
        method: numeric(HTTPMethodEnum),
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
    oneofKind: z.literal("custom"),
    custom: z.object({
      args: z
        .record(
          z.string().min(1, { message: "Required" }),
          z.string().min(1, { message: "Required" }),
        )
        .optional(),
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
]);

const resultConditionSchema = z.object({
  abort: numeric(AbortConditionEnum.default(AbortCondition.UNSET)),
  notify: z.preprocess((v) => v === "true", z.boolean()),
  metadata: z
    .record(
      z.string().min(1, { message: "Required" }),
      z.string().min(1, { message: "Required" }),
    )
    .optional(),
  notification: z.object({
    notificationConfigIds: repeatable(z.array(z.string())),
    payloadType: numeric(NotificationPayloadTypeEnum),
    paths: repeatable(z.array(z.string())),
  }).superRefine((notification, ctx) => {
    if (
      notification.payloadType ==
        PipelineStepNotification_PayloadType.SELECT_PATHS &&
      notification.paths.filter((a: string) => a.trim() !== "")?.length === 0
    ) {
      ctx.addIssue({
        path: ["paths.0"],
        code: z.ZodIssueCode.custom,
        message: "Required",
        fatal: true,
      });

      return z.never;
    }
  }).optional().transform((v) =>
    v?.notificationConfigIds?.length === 0 ? undefined : v
  ),
});

const stepSchema = z
  .object({
    id: z.string().optional(),
    WasmId: z.string().optional(),
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
      ((step?.step?.transform?.options.oneofKind === "replaceValueOptions" &&
        !step?.step?.transform?.options.replaceValueOptions.path) ||
        (step?.step?.transform?.options.oneofKind === "deleteFieldOptions" &&
          !step?.step?.transform?.options.deleteFieldOptions.paths) ||
        (step?.step?.transform?.options.oneofKind === "truncateOptions" &&
          !step?.step?.transform?.options.truncateOptions.path) ||
        (step?.step?.transform?.options.oneofKind === "maskOptions" &&
          !step?.step?.transform?.options.maskOptions.path) ||
        (step?.step?.transform?.options.oneofKind === "obfuscateOptions" &&
          !step?.step?.transform?.options.obfuscateOptions.path) ||
        (step?.step?.transform?.options.oneofKind === "extractOptions" &&
          !step?.step?.transform?.options.extractOptions.paths))
    ) {
      ctx.addIssue({
        path: [
          `step.transform.options.${step?.step?.transform?.options?.oneofKind}.${
            ["deleteFieldOptions", "extractOptions"].includes(
                step?.step?.transform?.options?.oneofKind,
              )
              ? "paths"
              : "path"
          }`,
        ],
        code: z.ZodIssueCode.custom,
        message: "Required",
        fatal: true,
      });

      return z.never;
    }
  });

export const PipelineSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, { message: "Required" }),
  steps: z.array(stepSchema).min(1, {
    message: "At least one step is required",
  }),
});
