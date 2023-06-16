import type React from "react";
import { useEffect, useState } from "react";

import { getJson } from "../../lib/fetch";
import { Loading } from "../icons/nav";
import { Error } from "../status/error";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Slack } from "../icons/social";
import { mutate } from "../../lib/mutation";
import { Success } from "../status/success";
import { FormInput } from "../form/formInput";

const SLACK_ERROR = "There was a problem loading your slack config.";

const slackSchema = z.object({
  token: z.string(),
});

export const SlackIntegration = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string>("");
  const [crudError, setCrudError] = useState<string>("");
  const [success, setSucces] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    reValidateMode: "onBlur",
    resolver: zodResolver(slackSchema),
    defaultValues: {
      token: "",
    },
  });

  const getData = async () => {
    try {
      const response = await getJson(`/v1/slack`);
      reset({ token: response?.values?.token });
    } catch {
      setLoadError(SLACK_ERROR);
    }
    setLoading(false);
  };

  const onSubmit = async (body: any) => {
    try {
      await mutate({
        method: "POST",
        apiPath: `/v1/slack`,
        body,
      });

      setSucces(true);
    } catch (e: any) {
      setCrudError(e.toString());
    }
  };

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    if (success) {
      const toRef = setTimeout(() => {
        setSucces(false);
        clearTimeout(toRef);
      }, 4000);
    }
  }, [success]);

  if (loading) {
    return <Loading />;
  }

  if (loadError) {
    return <Error error={loadError} />;
  }

  return (
    <div className="max-w-[1440px]">
      <div className="flex flex-row justify-start align-middle pb-4 mb-4 font-bold text-lg leading-5 border-b">
        <Slack className="mr-2 w-[20px]" />
        <span className="text-web">Slack Integration</span>
      </div>
      <div>
        <h1 className="mb-6">
          In order to get Slack Alerts, you'll need to provide a Slack API
          token. To generate a token, follow the instructions{" "}
          <a
            href="https://api.slack.com/tutorials/tracks/getting-a-token"
            target="_new"
            className="underline underline-offset-2"
          >
            here
          </a>
          .
        </h1>
      </div>
      {crudError ? <Error error={crudError} /> : null}
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg">
        <FormInput
          name="token"
          label="Slack Token"
          register={register}
          error={errors["token"]?.message || ""}
        />
        <div className="flex flex-row justify-start align-middle">
          <input
            type="submit"
            disabled={isSubmitting}
            className={`flex justify-center btn-heimdal mr-4 ${
              isSubmitting ? "cursor-not-allowed" : "cursor-pointer"
            }`}
            value="Save"
          />
          <a href="/">
            <input
              type="button"
              className="flex justify-center btn-secondary cursor-pointer"
              value="Cancel"
            />
          </a>
          {success ? <Success /> : null}
        </div>
      </form>
    </div>
  );
};
