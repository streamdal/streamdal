import React, { useEffect, useState } from "react";
import { Loading } from "../icons/nav";
import { getJson } from "../../lib/fetch";
import { Error } from "../errors/error";
import { MonitorIcon } from "../icons/streamdal";
import { RULESET_ERROR } from "./ruleSet";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FormInput } from "../form/formInput";
import { FormSelect } from "../form/formSelect";
import { titleCase } from "../../lib/utils";
import { mutate } from "../../lib/mutation";

export const MODES = ["RULE_MODE_CONSUME", "RULE_MODE_PUBLISH"] as const;
const RuleSetModeSchema = z.enum(MODES);

export const BUSES = ["rabbitmq", "kafka"] as const;

const baseSchema = z.object({
  name: z.string().min(1, { message: "Required" }),
  mode: RuleSetModeSchema,
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
      queue_name: z.string(),
      exchange_name: z.string(),
      binding_key: z.string(),
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

export const RuleSetAddEdit = () => {
  const [ruleSet, setRuleSet] = useState<any>({
    name: "",
    data_source: "kafka",
    mode: "RULE_MODE_CONSUME",
    key: "",
    queue_name: "",
    exchange_name: "",
    binding_key: "",
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [addError, setAddError] = useState<string>("");
  const params = new URLSearchParams(document.location.search);
  const id = params.get("id");

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(rulesetSchema),
    defaultValues: ruleSet,
  });

  const data_source = watch("data_source");
  const mode = watch("mode");

  const onSubmit = async (body: any) => {
    try {
      const response = await mutate({
        method: ruleSet?.id ? "PUT" : "POST",
        apiPath: `/v1/ruleset/${ruleSet?.id || ""}`,
        body,
      });
      const id = response?.values?.id;
      window.location.href = id ? `/ruleset/?id=${id}` : "/";
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
      const set = await getJson(`/v1/ruleset/${id}`);
      const rules = await getJson(`/v1/ruleset/${id}/rules`);

      const rSet = {
        ...set,
        ...{ rules },
      };

      setRuleSet(rSet);
      reset(rSet);
    } catch {
      setError(RULESET_ERROR);
    }
    setLoading(false);
  };

  useEffect(() => {
    getData();
  }, []);

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
            {ruleSet?.name ? ` - ${ruleSet.name}` : ""}
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
          <input
            type="submit"
            disabled={isSubmitting}
            className={`flex justify-center btn-heimdal mt-2 ${
              isSubmitting ? "cursor-not-allowed" : "cursor-pointer"
            }`}
            value={ruleSet?.id ? "Edit Ruleset" : "Add Ruleset"}
          />
        </div>
      </form>
    </div>
  );
};
