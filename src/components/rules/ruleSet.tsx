import React, { useEffect, useState } from "react";
import { Loading } from "../icons/nav";
import { getJson } from "../../lib/fetch";
import { Error } from "../errors/error";
import { MonitorIcon } from "../icons/streamdal";

const ERROR = "Ruleset not found!";

export const RuleSet = () => {
  const [ruleSet, setRuleSet] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const ruleSets = null;
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
      {loading ? (
        <Loading />
      ) : error || !ruleSet ? (
        <Error error="Rule set not found!" />
      ) : (
        <div className="pt-4 flex flex-col">
          {Object.values(ruleSet?.rules)?.map((r: any, i: number) => (
            <div key={`rule-detail-${i}`}>
              <div className="text-web mb-2">Rule Config: </div>
              <div>{JSON.stringify(r)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
