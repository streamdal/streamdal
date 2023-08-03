import { ZodIssue } from "zod/ZodError.ts";
import { ZodSchema } from "zod/types.ts";
import * as z from "zod/index.ts";

export type ErrorType = { [key: string]: string };
export type ObjectType = Record<number | string, any>;

export const validate = (
  schema: ZodSchema,
  data: FormData,
): { data: z.infer<typeof schema>; errors: ErrorType } => {
  try {
    const validated = schema.parse(data);
    return { data: validated, errors: {} };
  } catch (error: any) {
    const errors = error?.issues.reduce(
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
  value: string,
) =>
  setData({
    ...data,
    ...setValue(data, keys, value),
  });

export const parsePath = (path: string) =>
  path.split(/[\.\[\]\'\"]/).filter((p) => p);

export const resolveValue = (object: any, path: string) =>
  parsePath(path)
    .reduce((o, p) => o[p], object);

export const setValue = (
  object: any,
  path: any[],
  value: string,
) =>
  path.reduce((obj: ObjectType, key, index) => {
    if (index === path.length - 1) {
      obj[key] = value;
    } else {
      if (!obj[key]) obj[key] = {};
      return obj[key];
    }
  }, object);
