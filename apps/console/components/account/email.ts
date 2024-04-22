import { z } from "zod/mod.ts";

export const EmailSchema = z.object({
  email: z.string().min(1, { message: "Required" }).email({
    message: "Must be a valid email.",
  }),
  decline: z.boolean().default(false),
});
