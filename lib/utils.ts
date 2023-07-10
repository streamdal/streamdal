import { load } from "https://deno.land/std/dotenv/mod.ts";

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
  str.replace(/\w\S*/g, (t: any) => {
    return t.charAt(0).toUpperCase() + t.substring(1).toLowerCase();
  });

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

export const getEnv = async (param: string) => {
  const env = await load();
  return env[param];
};
