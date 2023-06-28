import { ReactNode, useEffect, useState } from "react";
import { titleCase } from "../../lib/utils";
import { FlowbiteRuleSetMenu, RuleSetMenu } from "./menu";
import { MonitorIcon } from "../icons/streamdal";
import { getJson, getText } from "../../lib/fetch";
import { Loading } from "../icons/nav";
import { Error } from "../status/error";
import { parseMetrics } from "../../lib/metrics";
import { Total } from "./metrics/total";

const RULESETS_ERROR = "There was a problem loading Rulesets";

export const TH = ({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) => (
  <th
    className={`text-xs-[12px] font-medium leading-[18px] text-left pb-3 ${className}`}
  >
    {children}
  </th>
);

export const TD = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <td
    className={`align-top text-xs-[14px] font-medium leading-[18px] text-left pb-5 ${className}`}
  >
    {children}
  </td>
);

export const humanMode = (mode?: string) =>
  mode ? titleCase(mode.substring(10)) : "";

export const RuleSets = () => {
  const [ruleSets, setRuleSets] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

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
    try {
      setRuleSets(await getJson(`/v1/ruleset`));
      setMetrics(parseMetrics(await getText(`/metrics`)));
    } catch (e) {
      console.error("Error loading rule sets and metrics", e);
      setError(true);
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
  }, []);

  if (error) {
    return <Error error={RULESETS_ERROR} />;
  }

  return (
    <div className="max-w-[1440px]">
      <div className="flex flex-row justify-between align-middle pb-4 mb-4 font-bold text-lg leading-5 border-b">
        <div className="flex flex-row justify-start">
          <MonitorIcon className="mr-2 w-[14px]" />
          <span className="text-web">Rule sets</span>
        </div>
        {loading && <Loading />}
      </div>
      <table className="table-auto border-collapse w-full text-sm">
        <thead>
          <tr className="border-spacing-6">
            <TH>Name</TH>
            <TH>Mode</TH>
            <TH>Data Source</TH>
            <TH>Key</TH>
            <TH className="text-center">Version</TH>
            <TH>Metrics</TH>
            <TH></TH>
          </tr>
        </thead>
        <tbody>
          {ruleSets &&
            Object.values(ruleSets)?.map((r: any, i: number) => (
              <tr key={`ruleset-table-${i}`}>
                <TD>
                  <a
                    className="hover:underline underline-offset-2 font-bold"
                    href={`/ruleset?id=${r.id}`}
                  >
                    {r.name}
                  </a>
                </TD>
                <TD>{humanMode(r.mode)}</TD>
                <TD>{r.data_source}</TD>
                <TD>{r.key}</TD>
                <TD className="text-center">{r.version}</TD>
                <TD className="text-left">
                  <div className="flex flex-col mr-4">
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
                    <div className="cursor-pointer">
                      <a
                        className="hover:underline underline-offset-2 font-bold"
                        href={`/ruleset?id=${r.id}`}
                      >
                        more&gt;
                      </a>
                    </div>
                  </div>
                </TD>
                <TD>
                  {/*<RuleSetMenu id={r.id} />*/}
                  <FlowbiteRuleSetMenu id={r.id} />
                </TD>
              </tr>
            ))}
        </tbody>
      </table>
      <div className="w-full mt-4 flex justify-end">
        <a href="/ruleset/edit">
          <input
            type="button"
            className="flex justify-center btn-heimdal"
            value="Add Rule Set"
          />
        </a>
      </div>
    </div>
  );
};
