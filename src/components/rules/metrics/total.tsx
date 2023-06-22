import type { Metric, MetricsKind, MetricsType } from "../../../lib/metrics";
import { formatBytes, formatNumber } from "../../../lib/utils";
import { getRuleTotal } from "../../../lib/metrics";

export const metricColor = (kind: MetricsKind, value: number) => {
  if (value == 0) {
    return "web";
  }

  switch (kind) {
    case "plumber_dataqual_failure_trigger":
      return value > 0 ? "streamdalRed" : "streamdalGreen";
    default:
      return value > 0 ? "streamdalGreen" : "streamdalRed";
  }
};

export const dash = () => (
  <span className={`text-stormCloud font-bold`}>-</span>
);

export const Total = ({
  metrics,
  id, // works for ruleSet id or rule id
  kind,
  type,
}: {
  metrics: Metric[];
  id?: string;
  kind: MetricsKind;
  type: MetricsType;
}) => {
  if (!metrics?.length || !id) {
    return dash();
  }

  const total = getRuleTotal(metrics, id, kind, type);

  if (total == null) {
    return dash();
  }
  const humanTotal =
    type === "count" ? formatNumber(total) : formatBytes(total);
  return (
    <span className={`text-${metricColor(kind, total)} font-bold`}>
      {humanTotal}
    </span>
  );
};
