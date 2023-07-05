import React, { useEffect, useState } from "react";
import { Loading } from "../icons/nav";
import { getJson } from "../../lib/fetch";
import { Error } from "../status/error";
import { MonitorIcon } from "../icons/streamdal";
import { useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";
import { FormInput } from "../form/formInput";
import { FormSelect } from "../form/formSelect";
import { isNumeric, titleCase } from "../../lib/utils";
import {
  OPERATOR_MATCH_TYPE,
  RULE_TYPE_MATCH,
  RuleAddEdit,
} from "./rule/addEdit";
import { mutate } from "../../lib/mutation";
import { v4 as uuidv4 } from "uuid";
import { Success } from "../status/success";
import { FAILURE_MODE_TYPE } from "./rule/failureMode";
import { mapRules, mapRuleSet } from "./rulesetView";
import { zodResolver } from "@hookform/resolvers/zod";

export const RULESET_ERROR = "Ruleset not found!";

export const NEW_RULE = {
  type: "RULE_TYPE_MATCH" as const,
  name: "",
  match_config: {
    path: "",
    type: "string_contains_any",
    args: [""],
  },
  failure_mode_configs: [
    {
      mode: "RULE_FAILURE_MODE_REJECT" as const,
    },
  ],
};

export const MODES = ["RULE_MODE_CONSUME", "RULE_MODE_PUBLISH"] as const;
const RuleSetModeSchema = z.enum(MODES);

export const BUSES = ["rabbitmq", "kafka"] as const;

const failureModes: string[] = Object.keys(FAILURE_MODE_TYPE);
const baseFailureModeSchema = z.object({
  mode: z.enum(failureModes as any),
});

const failureModeSchema = z.discriminatedUnion("mode", [
  baseFailureModeSchema.extend({
    mode: z.literal("RULE_FAILURE_MODE_ALERT_SLACK"),
    alert_slack: z.object({
      slack_channel: z.string().min(1, { message: "Required" }),
    }),
  }),
  baseFailureModeSchema.extend({
    mode: z.literal("RULE_FAILURE_MODE_DLQ"),
    dlq: z.object({
      streamdal_token: z.string().min(1, { message: "Required" }),
    }),
  }),
  baseFailureModeSchema.extend({
    mode: z.literal("RULE_FAILURE_MODE_TRANSFORM"),
    transform: z.object({
      path: z.string().min(1, { message: "Required" }),
      value: z.string().min(1, { message: "Required" }),
      type: z.string().min(1, { message: "Required" }),
    }),
  }),
  //
  // These two have no further requirements but have
  // to be specified to satisfy zod's discriminated union
  baseFailureModeSchema.extend({
    mode: z.literal("RULE_FAILURE_MODE_UNSET"),
  }),
  baseFailureModeSchema.extend({
    mode: z.literal("RULE_FAILURE_MODE_REJECT"),
  }),
]);

const matchTypes: string[] = Object.keys(RULE_TYPE_MATCH);
const operatorTypes: string[] = Object.keys(OPERATOR_MATCH_TYPE);
const ruleMatchSchema = z
  .object({
    path: z.string().min(1, { message: "Required" }),
    type: z.enum(matchTypes as any),
    args: z.string().array().optional(),
    operator: z.enum(operatorTypes as any).optional(),
  })
  .superRefine(({ type, operator, args }, ctx) => {
    if (
      ["ts_rfc3339", "ts_unix_nano", "ts_unix_nano"].includes(type) &&
      ["MATCH_OPERATOR_OLDER_THAN_SECONDS"].includes(operator) &&
      (!args || !isNumeric(args[0]))
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Argument must be a number of seconds",
        path: ["args[0]"],
        fatal: true,
      });
      return false;
    }

    if (
      !["string_contains_any", "string_contains_all", "regex"].includes(type)
    ) {
      return true;
    }

    args?.forEach((a, i) => {
      if (a === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Required",
          path: [`args[${i}]`],
          fatal: true,
        });
      }
    });
  });

const ruleSchema = z.object({
  id: z.string().optional(),
  type: z.literal("RULE_TYPE_MATCH"),
  match_config: ruleMatchSchema,
  name: z.string().min(1, { message: "Required" }),
  failure_mode_configs: failureModeSchema
    .array()
    .min(1, { message: "At least one rule is required" }),
});

export type RulesType = z.infer<typeof ruleSchema>;

const baseSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, { message: "Required" }),
  mode: RuleSetModeSchema,
  rules: ruleSchema
    .array()
    .min(1, { message: "At least one rule is required" }),
});

const rulesetSchema = z
  .discriminatedUnion("data_source", [
    baseSchema.extend({
      data_source: z.literal("kafka"),
      mode: RuleSetModeSchema,
      key: z.string().min(1, { message: "Required" }),
    }),
    baseSchema.extend({
      data_source: z.literal("rabbitmq"),
      mode: RuleSetModeSchema,
      queue_name: z.string().optional(),
      exchange_name: z.string().optional(),
      binding_key: z.string().optional(),
    }),
  ])
  //
  // This kind of sucks but discriminated unions are deprecated so I don't
  // want to waste too much time figuring it out. There is a new switch api coming soon.
  .superRefine(({ data_source, mode, rules, ...others }, ctx) => {
    if (
      data_source === "rabbitmq" &&
      mode === "RULE_MODE_CONSUME" &&
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      !others.queue_name
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Queue Name is required",
        path: ["queue_name"],
        fatal: true,
      });
    }

    if (data_source === "rabbitmq" && mode === "RULE_MODE_PUBLISH") {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      !others.exchange_name &&
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Exchange Name is required",
          path: ["exchange_name"],
          fatal: true,
        });

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      !others.binding_key &&
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Binding Key is required",
          path: ["binding_key"],
          fatal: true,
        });
    }

    const names = rules.map((rule) => rule.name);
    const isDupe = names.find((item, idx) => names.indexOf(item) !== idx);
    if (isDupe) {
      rules.forEach((r, i) => {
        if (r.name === isDupe) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Rules cannot have the same name",
            path: [`rules[${i}][name]`],
            fatal: true,
          });
        }
      });
      return false;
    }

    if (!isDupe) {
      return true;
    }
  });

export type RulesetType = z.infer<typeof rulesetSchema>;

export const RuleSetAddEdit = () => {
  const params = new URLSearchParams(document.location.search);
  const id = params.get("id");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [success, setSucces] = useState<boolean>(
    params.get("success") === "true"
  );

  const [addError, setAddError] = useState<string>("");
  const {
    register,
    handleSubmit,
    watch,
    control,
    reset,
    formState: { errors, isSubmitting, defaultValues },
  } = useForm<RulesetType>({
    resolver: zodResolver(rulesetSchema),
    reValidateMode: "onBlur",
    shouldUnregister: true,
  });

  const {
    fields: rules,
    append: addRule,
    remove: removeRule,
  } = useFieldArray({
    shouldUnregister: true,
    control,
    name: "rules", // unique name for your Field Array
  });

  const data_source = watch("data_source") || "kafka";
  const mode = watch("mode");

  const onSubmit = async (body: any) => {
    //
    // Extract all the parts we need to transform to make the API happy
    const {
      rules: rawRules,
      exchange_name,
      binding_key,
      queue_name,
      ...set
    } = body;

    const rules = rawRules?.reduce((ruleObj: any, rule: any) => {
      ruleObj[rule.id ? rule.id : uuidv4()] = {
        ...rule,
        failure_mode_configs: rule.failure_mode_configs.map((f: any) => ({
          ...f,
          ...(f.mode === "RULE_FAILURE_MODE_REJECT" ? { reject: {} } : {}),
        })),
      };
      return ruleObj;
    }, {});

    const mapped = {
      ...set,
      rules,
      ...(queue_name && { key: queue_name }),
      ...(exchange_name &&
        binding_key && { key: `${exchange_name}|${binding_key}` }),
    };

    try {
      const response = await mutate({
        method: defaultValues?.id ? "PUT" : "POST",
        apiPath: `/v1/ruleset/${defaultValues?.id || ""}`,
        body: mapped,
      });

      setSucces(true);

      const id = response?.values?.id;
      if (id) {
        //window.location.href = `/ruleset/edit?id=${id}&success=true`;
      }
    } catch (e: any) {
      setAddError(e.toString());
    }
  };

  const getData = async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      const {
        rules: unmapped,
        key,
        ...set
      } = await getJson(`/v1/ruleset/${id}`);

      reset(mapRuleSet(set, key, mapRules(unmapped)));
    } catch (e: any) {
      console.error("Error loading ruleset", e);
      setError(RULESET_ERROR);
    }
    setLoading(false);
  };

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    if (success) {
      const toRef = setTimeout(() => {
        setSucces(false);
        clearTimeout(toRef);
      }, 4000);
    }
  }, [success]);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error error={error} />;
  }

  return (
    <div className="max-w-[1440px]">
      <div className="flex flex-row justify-between align-middle pb-4 border-b">
        <div className="flex flex-row justify-start font-bold text-lg leading-5">
          <MonitorIcon className="mr-2 w-[14px]" />
          <span className="text-web">
            {id ? "Edit" : "Add"} Rule set{" "}
            {defaultValues?.name ? ` - ${defaultValues?.name}` : ""}
          </span>
        </div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        {addError ? <Error error={addError} /> : null}
        <div className="pt-4 flex flex-col justify-start max-w-lg">
          <FormInput
            name="name"
            label="Rule Set Name"
            register={register}
            error={errors["name"]?.message || ""}
          />
          <FormSelect
            name="data_source"
            label="Data Source"
            register={register}
            error={errors["data_source"]?.message || ""}
          >
            {BUSES.map((b: string, i: number) => (
              <option key={`bus-key-${i}`} value={b}>
                {titleCase(b)}
              </option>
            ))}
          </FormSelect>
          <FormSelect
            name="mode"
            label="Mode"
            register={register}
            error={errors["mode"]?.message || ""}
          >
            {MODES.map((m: string, i: number) => (
              <option key={`mode-key-${i}`} value={m}>
                {m.includes("PUBLISH") ? "Publish" : "Consume"}
              </option>
            ))}
          </FormSelect>
          {data_source === "kafka" && (
            <FormInput
              name="key"
              label="Message Topic"
              register={register}
              error={("key" in errors && errors["key"]?.message) || ""}
            />
          )}

          {data_source === "rabbitmq" && mode === "RULE_MODE_CONSUME" && (
            <FormInput
              name="queue_name"
              label="Queue Name"
              register={register}
              error={
                ("queue_name" in errors && errors["queue_name"]?.message) || ""
              }
            />
          )}
          {data_source === "rabbitmq" && mode === "RULE_MODE_PUBLISH" && (
            <FormInput
              name="exchange_name"
              label="Exchange Name"
              register={register}
              error={
                ("exchange_name" in errors &&
                  errors["exchange_name"]?.message) ||
                ""
              }
            />
          )}
          {data_source === "rabbitmq" && mode === "RULE_MODE_PUBLISH" && (
            <FormInput
              name="binding_key"
              label="Binding Key"
              register={register}
              error={
                ("binding_key" in errors && errors["binding_key"]?.message) ||
                ""
              }
            />
          )}
          <span className="text-stormCloud font-medium text-[14px] leading-[18px] mb-1">
            Rules
          </span>
          <div className="flex flex-col mb-4 rounded-sm border pb-2 text-[14px] font-medium leading-[18px] ">
            {rules?.length ? (
              rules.map((r: any, i: number) => (
                <RuleAddEdit
                  key={r.id}
                  index={i}
                  control={control}
                  rule={r}
                  register={register}
                  remove={removeRule}
                />
              ))
            ) : (
              <div className="p-2 border-b">
                {errors["rules"]?.message ? (
                  <div className="text-[12px] mt-1 font-semibold text-streamdalRed">
                    {errors["rules"]?.message?.toString()}
                  </div>
                ) : (
                  "At least one rule is required"
                )}
              </div>
            )}
            <div className="w-full mt-2 flex justify-end">
              <input
                type="button"
                className="flex justify-center btn-secondary h-10 cursor-pointer"
                value="+ Add Rule"
                onClick={() => addRule(NEW_RULE)}
              />
            </div>
          </div>

          <div className="flex flex-row justify-start align-middle">
            <input
              type="submit"
              disabled={isSubmitting}
              className={`flex justify-center btn-heimdal mr-4 ${
                isSubmitting ? "cursor-not-allowed" : "cursor-pointer"
              }`}
              value={defaultValues?.id ? "Save Ruleset" : "Add Ruleset"}
            />
            <a href="/">
              <input
                type="button"
                className="flex justify-center btn-secondary cursor-pointer"
                value="Cancel"
              />
            </a>
            {success ? <Success /> : null}
          </div>
        </div>
      </form>
    </div>
  );
};
