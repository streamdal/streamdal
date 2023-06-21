import React, { useEffect, useState } from "react";
import { Loading } from "../icons/nav";
import { getJson, getText } from "../../lib/fetch";
import { Error } from "../status/error";
import { MonitorIcon } from "../icons/streamdal";
import type { RulesetType } from "./rulesetAddEdit";
import { RULESET_ERROR } from "./rulesetAddEdit";
import { humanMode, TD, TH } from "./ruleSets";
import { Total } from "./metrics/total";
import { parseMetrics } from "../../lib/metrics";
import { RULE_TYPE_MATCH } from "./rule/addEdit";
import { FAILURE_MODE_TYPE } from "./rule/failureMode";

export const mapRuleSet = (
  set: RulesetType,
  key: string,
  mappedRules: any
) => ({
  ...set,
  rules: mappedRules,
  ...(key && set.data_source === "rabbitmq" && set.mode === "RULE_MODE_PUBLISH"
    ? {
        exchange_name: key.substring(0, key.indexOf("|")),
        binding_key: key.substring(key.indexOf("|") + 1),
      }
    : key && set.data_source === "rabbitmq" && set.mode === "RULE_MODE_CONSUME"
    ? { queue_name: key }
    : { key }),
});

export const RuleSetView = () => {
  const params = new URLSearchParams(document.location.search);
  const id = params.get("id");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [ruleSet, setRuleSet] = useState<RulesetType & { version?: string }>();
  const [metrics, setMetrics] = useState<any>(null);

  //
  // most updates are too fast for the use to notice
  const doneLoading = () => {
    const toRef = setTimeout(() => {
      setLoading(false);
      clearTimeout(toRef);
    }, 500);
  };

  const getData = async () => {
    setLoading(true);
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

      setRuleSet(mapRuleSet(set, key, mappedRules));
      setMetrics(parseMetrics(await getText(`/metrics`)));
    } catch (e: any) {
      console.error("Error loading ruleset", e);
      setError(RULESET_ERROR);
    }
    doneLoading();
  };

  useEffect(() => {
    const interval = setInterval(() => {
      getData();
    }, 2000);

    return () => {
      clearInterval(interval);
    };
    getData();
  }, []);

  if (error) {
    return <Error error={error} />;
  }

  return (
    <div className="max-w-[1440px]">
      <div className="flex flex-row justify-between align-middle pb-4 mb-4 font-bold text-lg leading-5 border-b">
        <div className="flex flex-row justify-start">
          <MonitorIcon className="mr-2 w-[14px]" />
          <span className="text-web">Ruleset Details</span>
        </div>
        {loading && <Loading />}
      </div>
      <table className="table-auto border-collapse w-full text-sm">
        <thead>
          <tr className="border-spacing-6">
            <TH>Ruleset Name</TH>
            <TH>Mode</TH>
            <TH>Data Source</TH>
            <TH>Key</TH>
            <TH className="text-center">Version</TH>
          </tr>
        </thead>
        <tbody>
          <tr>
            <TD>
              <span className="font-bold">{ruleSet?.name}</span>
            </TD>
            <TD>{humanMode(ruleSet?.mode)}</TD>
            <TD>{ruleSet?.data_source}</TD>
            <TD>{ruleSet && "key" in ruleSet ? ruleSet.key : ""}</TD>
            <TD className="text-center">{ruleSet?.version}</TD>
          </tr>
        </tbody>
      </table>
      <div className="flex flex-row justify-between align-middle border-b mb-2 mt-6">
        <div className="flex flex-row justify-start">
          <span className="text-web font-bold">Ruleset Metrics</span>
        </div>
      </div>
      <div className="flex flex-row justify-between my-6">
        <div>
          Total Data:{" "}
          <Total
            metrics={metrics}
            id={ruleSet?.id}
            kind="plumber_dataqual_rule"
            type="bytes"
          />
        </div>
        <div>
          Total Events:{" "}
          <Total
            metrics={metrics}
            id={ruleSet?.id}
            kind="plumber_dataqual_rule"
            type="count"
          />
        </div>
        <div>
          Total Failed Data:{" "}
          <Total
            metrics={metrics}
            id={ruleSet?.id}
            kind="plumber_dataqual_failure_trigger"
            type="bytes"
          />
        </div>
        <div>
          Total Failed Events:{" "}
          <Total
            metrics={metrics}
            id={ruleSet?.id}
            kind="plumber_dataqual_failure_trigger"
            type="count"
          />
        </div>
      </div>
      <div className="flex flex-row justify-between border-b mb-2 mt-6">
        <div className="flex flex-row justify-start">
          <span className="text-web font-bold">Individual Rule Metrics</span>
        </div>
      </div>
      {ruleSet?.rules?.length &&
        ruleSet.rules.map((r: any, i: number) => (
          <div
            key={`rule-detail-metrics-key-${i}`}
            className="flex flex-col rounded border p-4 mt-4"
          >
            <div className="flex flex-row mb-4">
              <div className="mr-6">
                <span className="font-bold">Type:</span>{" "}
                {RULE_TYPE_MATCH[r?.match_config?.type]?.display}
              </div>
              <div className="mr-6">
                <span className="font-bold">Path:</span> {r?.match_config?.path}
              </div>
              <div className="mr-6">
                <span className="font-bold">Failure Modes:</span>{" "}
                {r?.failure_mode_configs
                  ?.map(
                    (r: { mode: string }) => FAILURE_MODE_TYPE[r.mode].display
                  )
                  .join(", ")}
              </div>
            </div>
            <div className="flex flex-row justify-between mr-4">
              <div>
                Data:{" "}
                <Total
                  metrics={metrics}
                  id={r.id}
                  kind="plumber_dataqual_rule"
                  type="bytes"
                />
              </div>
              <div>
                Events:{" "}
                <Total
                  metrics={metrics}
                  id={r.id}
                  kind="plumber_dataqual_rule"
                  type="count"
                />
              </div>
              <div>
                Failed Data:{" "}
                <Total
                  metrics={metrics}
                  id={r.id}
                  kind="plumber_dataqual_failure_trigger"
                  type="bytes"
                />
              </div>
              <div>
                Failed Events:{" "}
                <Total
                  metrics={metrics}
                  id={r.id}
                  kind="plumber_dataqual_failure_trigger"
                  type="count"
                />
              </div>
            </div>
          </div>
        ))}

      <div className="w-full mt-6 flex justify-end">
        <a href={`/ruleset/edit?id=${ruleSet?.id}`}>
          <input
            type="button"
            className="flex justify-center btn-heimdal"
            value="Edit Rule Set"
          />
        </a>
      </div>
    </div>
  );
};
