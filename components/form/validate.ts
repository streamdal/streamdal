import { ZodIssue } from "zod/ZodError.ts";
import { ZodSchema } from "zod/types.ts";
import * as z from "zod/index.ts";

export type ErrorType = { [key: string]: string };
export type ObjectType = Record<number | string, any>;

export const validate = <T>(
  schema: ZodSchema<T>,
  data: FormData,
): { data: z.infer<typeof schema> | null; errors: ErrorType | null } => {
  try {
    const validated = schema.parse(data);
    return { data: validated, errors: null };
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
) => {
  setData({
    ...data,
    ...setValue(data, keys, value),
  });
};

export const parsePath = (path: string) =>
  path.split(/[\.\[\]'\"]/).filter((p) => p);

export const resolveValue = (object: any, path: string) =>
  parsePath(path)
    .reduce((o, p) => o[p], object);

export const setValue = (
  object: any,
  path: any[],
  value: string,
) => {
  const updated = object;
  path.reduce((obj: ObjectType, key, index) => {
    if (index === path.length - 1) {
      obj[key] = value;
    } else {
      if (!obj[key]) {
        obj[key] = {};
      }
      return obj[key];
    }
  }, updated);
  return updated;
};
