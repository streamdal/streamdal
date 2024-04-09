import { ZodIssue } from "zod/ZodError.ts";
import { ZodSchema, ZodTypeAny } from "zod/types.ts";
import * as z from "zod/index.ts";
import { isNumeric } from "../../lib/utils.ts";

export type ErrorType = { [key: string]: string };

//
// The next few functions are a poor man's version of zod-form-data:
// https://github.com/airjp73/remix-validated-form/tree/main/packages/zod-form-data.
// Which allows us to more smartly map form properties to our zod schema.
// We were using zod-form-data but it was causing deno some infinite recursion checking types.
const preprocessIfValid = (schema: ZodTypeAny) => (val: unknown) => {
  const result = schema.safeParse(val);
  if (result.success) return result.data;
  return val;
};

const stripEmpty = z.literal("").transform(() => undefined);

export const text = (schema = z.string()) =>
  z.preprocess(preprocessIfValid(stripEmpty), schema) as any;

export const numeric = (schema: ZodSchema = z.number()) =>
  z.preprocess(
    preprocessIfValid(
      z.union([
        stripEmpty,
        z
          .string()
          .transform((val) => Number(val))
          .refine((val) => !Number.isNaN(val)),
      ]),
    ),
    schema,
  ) as any;

export const repeatable = (
  schema: ZodSchema = z.array(text()),
) => {
  return z.preprocess(
    (val) => Array.isArray(val) ? val : val === undefined ? [] : [val],
    schema,
  ) as any;
};

const preProcess = (data: FormData) =>
  [...data.entries()].reduce((acc: any, [key, value]: any) => {
    return setPath(acc, parsePath(key), value);
  }, {});

export const validate = <T>(
  schema: ZodSchema<T>,
  data: FormData,
): { data: z.infer<typeof schema> | null; errors: ErrorType | null } => {
  try {
    const validated = schema.parse(preProcess(data));
    return { data: validated, errors: null };
  } catch (error: any) {
    const errors = error?.issues?.reduce(
      (o: any, e: ZodIssue) => ({ ...o, [e.path.join(".")]: e.message }),
      {},
    );
    return { data: null, errors };
  }
};

export const updateData = (
  data: any,
  setData: (arg: any) => void,
  keys: (string | number)[],
  value: string | number | boolean,
) => {
  return setData(setValue(data, keys, value));
};

export const parsePath = (path: string) =>
  path.split(/[\.\[\]'\"]/).filter((p) => p);

export const resolveValue = (object: any, path: string) =>
  parsePath(path)
    .reduce((o, p) => o ? o[p] : null, object);

//
// Returns a copy of the provided object with the provided value set
// at path specified in keys
export const setValue = (
  data: any,
  keys: any[],
  value: string | number | boolean,
) => {
  const [key, ...restKeys] = keys;

  let children;
  if (restKeys.length > 0) {
    children = data[key] && typeof data[key] === "object"
      ? data[key]
      : (Number.isInteger(key) ? [] : {});

    children = setValue(children, restKeys, value);
  }

  const result = Array.isArray(data) ? [...data] : { ...data };
  result[key] = restKeys.length > 0 ? children : value;
  return result;
};

const setPath = (
  data: any,
  [key, ...rest]: any[],
  value: string | number | boolean,
) => {
  const clone = Array.isArray(data) ? [...data] : { ...data };

  clone[key] = rest.length
    ? setPath(data[key] ? data[key] : isNumeric(rest[0]) ? [] : {}, rest, value)
    : value;
  return clone;
};
