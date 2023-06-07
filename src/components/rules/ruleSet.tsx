import React, { useEffect, useState } from "react";
import { Loading } from "../icons/nav";
import { getJson } from "../../lib/fetch";
import { Error } from "../errors/error";
import { MonitorIcon } from "../icons/streamdal";
import { DisplayConfig } from "./configDisplay";

const RULESET_ERROR = "Ruleset not found!";

export const RuleSet = () => {
  const [ruleSet, setRuleSet] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const params = new URLSearchParams(document.location.search);
  const id = params.get("id");

  const getData = async () => {
    if (!id) {
      console.error("ruleset id param is required");
      setLoading(false);
      return;
    }

    try {
      const set = await getJson(`/v1/ruleset/${id}`);
      const rules = await getJson(`/v1/ruleset/${id}/rules`);

      setRuleSet({
        ...set,
        ...{ rules },
      });
    } catch {
      setError(true);
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
    return <Error error={RULESET_ERROR} />;
  }

  return (
    <div className="max-w-[1440px]">
      <div className="flex flex-row justify-between align-middle pb-4 border-b">
        <div className="flex flex-row justify-start font-bold text-lg leading-5">
          <MonitorIcon className="mr-2 w-[14px]" />
          <span className="text-web">Rule set - {ruleSet?.name}</span>
        </div>
        <div className="flex flex-row justify-end">
          <span className="text-web">{ruleSet?.bus}</span>
        </div>
      </div>
      <div className="pt-4 flex flex-col">
        {Object.values(ruleSet?.rules)?.map((r: any, i: number) => (
          <DisplayConfig
            key={`rule-detail-${i}`}
            config={{
              "Rule Config": r.RuleConfig,
              "Failure Mode Config": r.FailureModeConfig,
            }}
          />
        ))}
      </div>
    </div>
  );
};
