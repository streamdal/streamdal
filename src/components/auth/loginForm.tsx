import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { RulesetType } from "../rules/rulesetAddEdit";
import { LoginFormInput } from "./loginFormInput";
import * as z from "zod";
import { useState } from "react";
import { Button, CustomFlowbiteTheme } from "flowbite-react";
import { Github } from "../icons/social";

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

  const customTheme: CustomFlowbiteTheme["button"] = {
    color: {
      primary: "bg:red-100 hover:bg-red-600",
    },
  };

  return (
    <div className="p-2 w-full h-[500px] flex flex-col justify-center align-top items-center">
      <form
        className={"border-web border-2 rounded-xl px-8 py-10 items-center"}
      >
        <h2 className={"text-center mb-3 text-xl"}>Welcome Back!</h2>
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
        <div className={"flex flex-col items-center"}>
          <Button
            className={
              "bg-streamdalYellow btn-heimdal text-web mb-3 w-full md:max-2xl:w-1/2"
            }
          >
            Sign In
          </Button>
          <Button
            color="gray"
            className="text-web hover:text-web hover:bg-streamdalYellow w-full md:max-2xl:w-1/2"
          >
            <Github className="mr-2 h-5 w-5" />
            <p>Login with Github</p>
          </Button>
        </div>
      </form>
    </div>
  );
};
