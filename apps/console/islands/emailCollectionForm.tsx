import { useState } from "preact/hooks";
import { FormInput } from "../components/form/formInput.tsx";
import { zfd } from "zod-form-data";
import * as z from "zod/index.ts";
import { validate } from "../components/form/validate.ts";

export const EmailSchema = zfd.formData({
  email: z.string().email({ message: "Must be a valid email." }).optional().or(
    z.literal(""),
  ),
});
export const EmailCollectionForm = () => {
  const [errors, setErrors] = useState<string>("");
  const [data, setData] = useState("");

  const onSubmit = async (e: any) => {
    const emailData = new FormData(e.target);
    const { errors } = validate(EmailSchema, emailData);
    setErrors(errors || {});

    if (errors) {
      e.preventDefault();
      return;
    }
  };

  return (
    <div class="w-screen h-screen flex flex-col justify-center align-top items-center bg-login bg-cover bg-center  bg-no-repeat">
      <div
        class={"rounded-xl px-6 py-10 items-center bg-white w-[400px] rounded-xl px-6 py-10 items-center bg-white w-[400px]"}
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
          <button
            type="submit"
            class={"btn-secondary text-web w-[350px] font-bold"}
          >
            No thanks
          </button>
        </form>
      </div>
    </div>
  );
};
