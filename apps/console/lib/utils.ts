import { Audience, OperationType } from "streamdal-protos/protos/sp_common.ts";
import { PipelinesType } from "./fetch.ts";
import { PipelineInfo } from "streamdal-protos/protos/sp_info.ts";
import { Pipeline } from "streamdal-protos/protos/sp_pipeline.ts";

export type AudienceParams = {
  service: string;
  component: string;
  operationType: string;
  operationName: string;
};

const UNITS = [
  "byte",
  "kilobyte",
  "megabyte",
  "gigabyte",
  "terabyte",
  "petabyte",
];
const BYTES_PER_KB = 1000;

export const titleCase = (str: any) =>
  str
    ? str.replace(/\w\S*/g, (t: any) => {
      return t.charAt(0).toUpperCase() + t.substring(1).toLowerCase();
    })
    : str;

/**
 * Format bytes as human-readable text.
 * @param sizeBytes Number of bytes.
 * @return Formatted string.
 * from: https://stackoverflow.com/questions/10420352/converting-file-size-in-bytes-to-human-readable-string/72596863#72596863
 */
export const formatBytes = (sizeBytes: number | bigint): string => {
  let size = Math.abs(Number(sizeBytes));

  if (size === 0) {
    return "0";
  }

  let u = 0;
  while (size >= BYTES_PER_KB && u < UNITS.length - 1) {
    size /= BYTES_PER_KB;
    ++u;
  }

  return UNITS[u] === "byte" ? size.toString() : new Intl.NumberFormat([], {
    style: "unit",
    unit: UNITS[u],
    unitDisplay: "narrow",
    maximumFractionDigits: ["byte", "kilobyte", "megabyte"].includes(UNITS[u])
      ? 0
      : 1,
  }).format(size);
};

export const formatNumber = (number?: number | bigint) =>
  new Intl.NumberFormat([], {
    notation: "compact",
    maximumSignificantDigits: 2,
  }).format(number || 0);

export const isNumeric = (num: any) =>
  (typeof num === "number" || (typeof num === "string" && num.trim() !== "")) &&
  !isNaN(num as number);

export const logFormData = (data: FormData) => {
  for (const pair of data) {
    console.log(pair[0] + ", " + pair[1]);
  }
};

export const getAudienceOpRoute = (
  audience: Audience,
) =>
  `/service/${encodeURIComponent(audience.serviceName)}/component/${
    encodeURIComponent(audience.componentName)
  }/${OperationType[audience.operationType]}/op/${
    encodeURIComponent(audience.operationName)
  }`;

export const getAudienceFromParams = (params: Record<string, string>) => {
  return {
    serviceName: params.service,
    componentName: params.component,
    operationType: OperationType[params.operationType as any] as any,
    operationName: params.operationName,
  };
};

export const getOpRoute = (
  service: string,
  component: string,
  opType: OperationType,
  opName: string,
) =>
  `/service/${encodeURIComponent(service)}/component/${
    encodeURIComponent(component)
  }/${OperationType[opType]}/op/${encodeURIComponent(opName)}`;

//
//stramdal server serialized audiences a bit oddly
//and we need to do the same to interpret config keys
export const audienceKey = (audience: Audience) =>
  `${audience.serviceName}:operation_type_${
    OperationType[audience.operationType]
  }:${audience.operationName}:${audience.componentName}`.toLowerCase();

export const audienceFromKey = (key: string): Audience => {
  const a = key.split(":");
  return {
    serviceName: a[0],
    operationType: a[1].substring(a[1].lastIndexOf("_") + 1) === "consumer"
      ? OperationType.CONSUMER
      : OperationType.PRODUCER,
    componentName: a[3],
    operationName: a[2],
  };
};

export const edgeKey = (audience: Audience) =>
  `${audience.serviceName}/operation_type_${
    OperationType[audience.operationType]
  }/${audience.componentName}`.toLowerCase();

export const serviceKey = (audience: Audience) =>
  lower(`${audience.serviceName}-service`.toLowerCase());

export const componentKey = (audience: Audience) =>
  lower(`${audience.componentName}-component`);

export const operationKey = (audience: Audience) =>
  lower(`${audienceKey(audience)}-operation`);

export const groupKey = (audience: Audience) =>
  lower(
    `${audience.serviceName}-${
      OperationType[audience.operationType]
    }-${audience.componentName}-group`,
  );

export const lower = (s: string) => s.toLowerCase();

export const setOperationHoverGroup = (
  a: Audience,
  highlight: boolean,
) => {
  const serviceId = a.serviceName;
  const componentId = a.componentName;
  if (highlight) {
    document.getElementById(serviceId)?.classList.add(
      "shadow-lg",
    );
    document.getElementById(componentId)?.classList.add(
      "shadow-2xl",
    );
  } else {
    document.getElementById(serviceId)?.classList.remove(
      "shadow-lg",
    );
    document.getElementById(componentId)?.classList.remove(
      "shadow-2xl",
    );
  }
  setHighlightedEdges(a, highlight);
};

export const setHighlightedEdges = (a: Audience, highlight: boolean) => {
  const serviceEdge: any = document.querySelector(
    `[data-testid=rf__edge-${serviceKey(a)}-${groupKey(a)}-edge]`,
  );

  const componentEdge: any = document
    .querySelector(
      `[data-testid=rf__edge-${componentKey(a)}-${groupKey(a)}-edge]`,
    );

  if (componentEdge?.children.length > 0) {
    componentEdge.children[0].style.stroke = `${
      highlight ? "#956CFF" : "#d2c1ff"
    }`;
  }
  if (serviceEdge?.children.length > 0) {
    serviceEdge.children[0].style.stroke = `${
      highlight ? "#956CFF" : "#d2c1ff"
    }`;
  }
};

export const setComponentGroup = (
  componentName: string,
  audiences: Audience[],
  highlight: boolean,
) =>
  audiences.filter((a) => a.componentName === componentName)
    .map((x) => setHighlightedEdges(x, highlight));

export const setServiceGroup = (
  serviceName: string,
  audiences: Audience[],
  highlight: boolean,
) =>
  audiences.filter((a) => a.serviceName === serviceName)
    .map((x) => setHighlightedEdges(x, highlight));

export const getAttachedPipelines = (
  audience: Audience,
  pipelines: PipelinesType,
): Pipeline[] =>
  Object.values(pipelines)?.filter((p: PipelineInfo) =>
    p.pipeline &&
    p.audiences.some((a: Audience) => audienceKey(a) === audienceKey(audience))
  ).map((p: PipelineInfo) => p.pipeline!);

export const bigIntStringify = (obj: any) =>
  JSON.stringify(obj, (_, v) => typeof v === "bigint" ? v.toString() : v);

export const longDateFormat = {
  year: "numeric" as const,
  month: "numeric" as const,
  day: "numeric" as const,
  hour: "numeric" as const,
  hour12: true,
  minute: "numeric" as const,
  fractionalSecondDigits: 3 as const,
};

export const humanDateFormat = {
  year: "numeric" as const,
  month: "numeric" as const,
  day: "numeric" as const,
  hour: "numeric" as const,
  hour12: true,
  minute: "numeric" as const,
};
