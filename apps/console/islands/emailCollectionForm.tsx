import { useState } from "preact/hooks";
import { FormInput } from "../components/form/formInput.tsx";

import { ErrorType, validate } from "../components/form/validate.ts";
import { EmailSchema } from "../components/account/email.ts";

export const EmailCollectionForm = () => {
  const [errors, setErrors] = useState<ErrorType | null>(null);
  const [data, setData] = useState("");

  const onSubmit = async (e: any) => {
    const emailData = new FormData(e.target);
    const { errors } = validate(EmailSchema, emailData);
    errors && setErrors(errors);

    if (errors) {
      e.preventDefault();
      return;
    }
  };

  return (
    <div class="w-screen h-screen flex flex-col justify-center align-top items-center bg-login bg-cover bg-center  bg-no-repeat">
      {
        //
        // Disabling partial nav here as downstream redirects don't work with fresh.
        // Roundabout typecast as deno/fresh does not permit a straightforward f-client-nav="false"
      }
      <div
        class={"rounded-xl px-6 py-10 items-center bg-white w-[400px] rounded-xl px-6 py-10 items-center bg-white w-[400px]"}
        f-client-nav={"false" as unknown as boolean}
      >
        <form
          method="post"
          onSubmit={onSubmit}
          className={"flex flex-col items-center w-full"}
        >
          <div className={"w-full flex items-center justify-center"}>
            <img
              src={"/images/email-bird.svg"}
              className={"w-54 mb-5"}
            />
          </div>
          <h2
            className={"text-center text-3xl font-display tracking-wide"}
          >
            Stay in the crow-d!
          </h2>
          <p className={"text-center font-normal text-sm w-64 my-6"}>
            Enter your email to receive crow-tastic news and Streamdal updates.
          </p>

          <FormInput
            name="email"
            label="Your email"
            errors={errors}
            data={data}
            setData={setData}
            wrapperClass={"w-[350px]"}
            inputClass={"border-2 border-purple-100 rounded-md text-sm my-2"}
            placeHolder={"name@company.com"}
          />
          <input type="submit" class="hidden" />
          <div className={"flex flex-col items-center"}>
            <button
              type={"submit"}
              className={"bg-streamdalYellow w-[350px] btn-heimdal text-web mb-3 w-full font-bold"}
            >
              Submit
            </button>
          </div>
        </form>
        <form
          method="post"
          className={"flex flex-col items-center w-full"}
        >
          <input type="hidden" value="true" name="decline" />
          <button
            type="submit"
            className={"btn-secondary text-web w-[350px] font-bold"}
          >
            No thanks
          </button>
        </form>
      </div>
    </div>
  );
};
