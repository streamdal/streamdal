import { Audience, OperationType } from "snitch-protos/protos/sp_common.ts";
import { ConfigType, PipelinesType } from "./fetch.ts";

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

  return new Intl.NumberFormat([], {
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

export const removeWhitespace = (s: string) => s.replace(/ /g, "");

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
//snitch server serialized audiences a bit oddly
//and we need to do the same to interpret config keys
export const audienceKey = (audience: Audience) =>
  `${audience.serviceName}:operation_type_${
    OperationType[audience.operationType]
  }:${audience.operationName}:${audience.componentName}`.toLowerCase();

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
  const serviceEdge = document.querySelector(
    `[data-testid=rf__edge-${serviceKey(a)}-${groupKey(a)}-edge]`,
  );
  const componentEdge = document.querySelector(
    `[data-testid=rf__edge-${componentKey(a)}-${groupKey(a)}-edge]`,
  );

  if (componentEdge) {
    componentEdge.children[0].style.stroke = `${
      highlight ? "#956CFF" : "#E6DDFE"
    }`;
  }
  if (serviceEdge) {
    serviceEdge.children[0].style.stroke = `${
      highlight ? "#956CFF" : "#E6DDFE"
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

export const getAttachedPipeline = (
  audience: Audience,
  pipelines: PipelinesType,
  config: ConfigType,
) => pipelines[config[audienceKey(audience)]]?.pipeline;

export const bigIntStringify = (obj: any) =>
  JSON.stringify(obj, (_, v) => typeof v === "bigint" ? v.toString() : v);
