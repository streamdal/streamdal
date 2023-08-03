import { ZodIssue } from "zod/ZodError.ts";
import { ZodSchema } from "zod/types.ts";
import * as z from "zod/index.ts";

export type ErrorType = { [key: string]: string };

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
