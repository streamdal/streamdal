import { Github, Google } from "../icons/social.tsx";
import { useState } from "preact/hooks";
import { LoginFormInput } from "./loginFormInput.tsx";

export const LoginForm = () => {
  const [error, setError] = useState<string>("");
  // const {
  //   register,
  //   handleSubmit,
  //   formState: { errors, isSubmitting, defaultValues },
  // } = useForm<LoginType>({
  //   mode: "onBlur",
  //   shouldUnregister: true,
  //   resolver: async (data, context, options) =>
  //     zodResolver(loginSchema)({ ...data }, context, options),
  // });

  const customTheme: CustomFlowbiteTheme["button"] = {
    color: {
      primary: "bg:red-100 hover:bg-red-600",
    },
  };

  return (
    <div class="mx-[-32px] my-[-24px] w-screen h-screen flex flex-col justify-center align-top items-center bg-login bg-cover bg-center  bg-no-repeat">
      <form className={"rounded-xl px-6 py-10 items-center bg-white w-[400px]"}>
        <div className={"w-full items-center"}>
          <img
            src={"/images/logo.svg"}
            className={"w-16 ml-[144px] mb-4 max-w-16"}
          />
        </div>
        <h2 className={"text-center mb-3 text-3xl font-display tracking-wide"}>
          Welcome Back!
        </h2>
        <LoginFormInput
          name={"email"}
          label={"Email"}
        />
        <LoginFormInput
          name={"password"}
          label={"Password"}
        />
        <div className={"flex flex-row justify-between items-center mb-8"}>
          <div>
            <input
              type="checkbox"
              class="w-4 h-4 rounded bg-purple-50 focus:ring-purple-500 text-purple-600"
            />
            <label htmlFor="remember-me" class={"text-xs ml-2"}>
              Remember Me
            </label>
          </div>
          <a href="/forgot-password">
            <p className={"underline text-xs"}>Forgot your password?</p>
          </a>
        </div>
        <div className={"flex flex-col items-center"}>
          <a href={"/"} className={"w-full h-[47px]"}>
            <button
              className={"bg-streamdalYellow btn-heimdal text-web mb-3 w-full font-bold"}
            >
              Log In
            </button>
          </a>
          <div className="flex w-full py-5 items-center justify-between">
            <div className="w-[120px] border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-gray-400">Or</span>
            <div className="w-[120px] border-t border-gray-300"></div>
          </div>
          <div className={"flex justify-between w-full"}>
            <button class="btn-dark flex w-[160px] items-center justify-center">
              <Github className="mr-2 h-5 w-5" />
              <p className={"text-xs"}>Sign in with Github</p>
            </button>
            <button class="btn-dark flex w-[160px] items-center justify-center">
              <Google className="mr-2 h-5 w-5" />
              <p className={"text-xs"}>Sign in with Google</p>
            </button>
          </div>
          <div className={"flex justify-start w-full mt-8"}>
            <p className={"text-xs"}>Not Registered?</p>
            <a
              className={"text-xs text-purple-300 ml-1 hover:underline hover:cursor-pointer"}
            >
              Create an account
            </a>
          </div>
        </div>
      </form>
    </div>
  );
};
