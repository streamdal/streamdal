export type MetricsType = "count" | "bytes";
export type MetricsKind =
  | "plumber_dataqual_failure_trigger"
  | "plumber_dataqual_rule";

export type Metric = {
  rule_id: string;
  ruleset_id: string;
  type: MetricsType;
  kind: MetricsKind;
  value: number;
};
export const parseKind = (l: string) => l.substring(0, l.indexOf("{"));
export const parseDetails = (l: string) => {
  const start = l.indexOf("{") + 1;
  const end = l.indexOf("}");
  const path = l.substring(start, end)?.split(",");

  const parsed = path?.reduce((acc: any, pair) => {
    const [key, value] = pair.split("=");
    acc[key] = value.slice(1, -1);
    return acc;
  }, {});

  return parsed;
};

export const parseMetrics = (raw: any) => {
  const lines = raw.trim().split("\n");
  const plumber = lines.filter((l: string) => l.startsWith("plumber_dataqual"));

  return plumber?.map((l: string) => ({
    ...parseDetails(l),
    kind: parseKind(l),
    value: Number(l.substring(l.lastIndexOf("}") + 1).trim()),
  }));
};

export const getRuleTotal = (
  metrics: Metric[],
  id: string,
  kind: MetricsKind,
  type: MetricsType
) =>
  metrics
    ?.filter(
      (m: Metric) =>
        (m.ruleset_id === id || m.rule_id === id) &&
        m.kind === kind &&
        m.type === type
    )
    .reduce((acc: number, m: Metric) => acc + m.value, 0);
