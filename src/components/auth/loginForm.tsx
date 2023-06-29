import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { RulesetType } from "../rules/rulesetAddEdit";
import { LoginFormInput } from "./loginFormInput";
import * as z from "zod";
import { FormInput } from "../form/formInput";
import { useState } from "react";
import { FormHidden } from "../form/formHidden";

export const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export type LoginType = z.infer<typeof loginSchema>;
export const LoginForm = () => {
  const [error, setError] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, defaultValues },
  } = useForm<LoginType>({
    mode: "onBlur",
    shouldUnregister: true,
    resolver: async (data, context, options) =>
      zodResolver(loginSchema)({ ...data }, context, options),
  });

  return (
    <div className="p-2 max-w-lg h-full flex flex-col justify-center align-top">
      <form>
        <LoginFormInput
          name={"email"}
          label={"Email"}
          register={register}
          error={errors["email"]?.message || ""}
        />
        <LoginFormInput
          name={"password"}
          label={"Password"}
          register={register}
          error={errors["password"]?.message || ""}
        />
        {/*<div className="flex flex-col">*/}
        {/*    <label form="email">Email</label>*/}
        {/*    <input type={"text"} name={"email"} placeholder={"Email"}/>*/}
        {/*</div>*/}
        {/*<div className="flex flex-col mt-8">*/}
        {/*    <label form="password">Password</label>*/}
        {/*    <input type={"text"} name={"password"} placeholder={"Password"}/>*/}
        {/*</div>*/}
      </form>
    </div>
  );
};
