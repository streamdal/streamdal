import type React from "react";
import type { ReactNode } from "react";
import { titleCase } from "../../lib/utils";
import { RuleSetMenu } from "./menu";
import { MonitorIcon } from "../icons/streamdal";
import { useEffect, useState } from "react";
import { getJson } from "../../lib/fetch";
import { Loading } from "../icons/nav";
import { Error } from "../status/error";

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
    className={`text-xs-[14px] font-medium leading-[18px] text-left pb-5 ${className}`}
  >
    {children}
  </td>
);

export const humanMode = (mode: string) => titleCase(mode.substring(10));

export const RuleSets = () => {
  const [ruleSets, setRuleSets] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  const getData = async () => {
    try {
      setRuleSets(await getJson(`/v1/ruleset`));
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
    return <Error error={RULESETS_ERROR} />;
  }

  return (
    <div className="max-w-[1440px]">
      <div className="flex flex-row justify-start align-middle pb-4 mb-4 font-bold text-lg leading-5 border-b">
        <MonitorIcon className="mr-2 w-[14px]" />
        <span className="text-web">Rule sets</span>
      </div>
      <table className="table-auto border-collapse w-full text-sm">
        <thead>
          <tr className="border-spacing-6">
            <TH>Name</TH>
            <TH>Mode</TH>
            <TH>Data Source</TH>
            <TH>Key</TH>
            <TH className="text-center">Version</TH>
            <TH></TH>
          </tr>
        </thead>
        <tbody>
          {Object.values(ruleSets)?.map((r: any, i: number) => (
            <tr key={`ruleset-table-${i}`}>
              <TD>
                <a href={`/ruleset?id=${r.id}`}>{r.name}</a>
              </TD>
              <TD>{humanMode(r.mode)}</TD>
              <TD>{r.data_source}</TD>
              <TD>{r.key}</TD>
              <TD className="text-center">{r.version}</TD>
              <TD>
                <RuleSetMenu id={r.id} />
              </TD>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="w-full mt-4 flex justify-end">
        <a href="/ruleset">
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
