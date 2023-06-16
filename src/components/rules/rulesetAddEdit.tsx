import React, { useEffect, useState } from "react";
import { Loading } from "../icons/nav";
import { getJson } from "../../lib/fetch";
import { Error } from "../status/error";
import { MonitorIcon } from "../icons/streamdal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FormInput } from "../form/formInput";
import { FormSelect } from "../form/formSelect";
import { titleCase } from "../../lib/utils";
import { RuleAddEdit } from "./rule/addEdit";
import { mutate } from "../../lib/mutation";
import { v4 as uuidv4 } from "uuid";
import { Success } from "../status/success";

export const RULESET_ERROR = "Ruleset not found!";

export const MODES = ["RULE_MODE_CONSUME", "RULE_MODE_PUBLISH"] as const;
const RuleSetModeSchema = z.enum(MODES);

export const BUSES = ["rabbitmq", "kafka"] as const;

const baseSchema = z.object({
  name: z.string().min(1, { message: "Required" }),
  mode: RuleSetModeSchema,
  rules: z.any(),
});

const rulesetSchema = z
  .discriminatedUnion("data_source", [
    baseSchema.extend({
      data_source: z.literal("kafka"),
      key: z.string().min(1, { message: "Required" }),
      mode: RuleSetModeSchema,
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
  .superRefine(({ data_source, mode, ...others }, ctx) => {
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
  });

//
// react-hooks-form doesn't play great with inferred zod schema types, so just stubbing it out
type RuleSetFormType = {
  id?: string;
  name: string;
  mode: string;
  data_source: string;
  key?: string;
  queue_name?: string;
  exchange_name?: string;
  binding_key?: string;
  rules?: any;
};

export const RuleSetAddEdit = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [success, setSucces] = useState<boolean>(false);
  const [addError, setAddError] = useState<string>("");
  const [rules, setRules] = useState<any>(null);
  const params = new URLSearchParams(document.location.search);
  const id = params.get("id");
  const {
    register,
    handleSubmit,
    watch,
    reset,
    control,
    formState: { errors, isSubmitting, defaultValues },
  } = useForm<RuleSetFormType>({
    reValidateMode: "onBlur",
    shouldUnregister: true,
    resolver: zodResolver(rulesetSchema),
    defaultValues: {
      name: "",
      data_source: "kafka",
      mode: "RULE_MODE_CONSUME",
      rules: [],
    },
  });

  const removeRule = (i: number) => () =>
    setRules(rules?.filter((a: any, index: number) => i !== index));

  const buildRule = (r: any, i: number) => (
    <div className={`border-b`} key={`rule-key-${i}`}>
      <RuleAddEdit
        index={i}
        control={control}
        rule={r}
        register={register}
        errors={errors}
        remove={removeRule(i)}
      />
    </div>
  );

  const data_source = watch("data_source");
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
        window.location.href = `/ruleset?id=${id}`;
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

      //
      // rules are passed back as an object, converting to array for convenience
      const mappedRules = Object.values(unmapped);
      setRules(mappedRules?.map((r: any, i: number) => buildRule(r, i)));

      reset({
        ...set,
        rules: mappedRules,
        ...(key &&
        set.data_source === "rabbitmq" &&
        set.mode === "RULE_MODE_PUBLISH"
          ? {
              exchange_name: key.substring(0, key.indexOf("|")),
              binding_key: key.substring(key.indexOf("|") + 1),
            }
          : key &&
            set.data_source === "rabbitmq" &&
            set.mode === "RULE_MODE_CONSUME"
          ? { queue_name: key }
          : { key }),
      });
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
          {data_source !== "rabbitmq" && (
            <FormInput
              name="key"
              label="Message Topic"
              register={register}
              error={errors["key"]?.message || ""}
            />
          )}

          {data_source === "rabbitmq" && mode === "RULE_MODE_CONSUME" && (
            <FormInput
              name="queue_name"
              label="Queue Name"
              register={register}
              error={errors["queue_name"]?.message || ""}
            />
          )}
          {data_source === "rabbitmq" && mode === "RULE_MODE_PUBLISH" && (
            <FormInput
              name="exchange_name"
              label="Exchange Name"
              register={register}
              error={errors["exchange_name"]?.message || ""}
            />
          )}
          {data_source === "rabbitmq" && mode === "RULE_MODE_PUBLISH" && (
            <FormInput
              name="binding_key"
              label="Binding Key"
              register={register}
              error={errors["binding_key"]?.message || ""}
            />
          )}
          <span className="text-stormCloud font-medium text-[14px] leading-[18px] mb-1">
            Rules
          </span>
          <div className="flex flex-col mb-4 rounded-sm border pb-2 text-[14px] font-medium leading-[18px] ">
            {rules?.length ? (
              rules.map((r: any) => r)
            ) : (
              <div className="p-2 border-b">No rules found</div>
            )}
            <div className="w-full mt-2 flex justify-end">
              <input
                type="button"
                className="flex justify-center btn-secondary h-10 cursor-pointer"
                value="+ Add Rule"
                onClick={() =>
                  setRules([
                    ...(rules ? rules : []),
                    buildRule(
                      {
                        failure_mode_configs: {},
                        match_config: { type: "string_contains_any" },
                      },
                      rules?.length || 0
                    ),
                  ])
                }
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
