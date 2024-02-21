import { HandlerContext, Handlers, RouteConfig } from "$fresh/server.ts";
import { AppRegistrationRequest } from "streamdal-protos/protos/sp_external.ts";
import { ErrorType, validate } from "../components/form/validate.ts";
import {
  EmailCollectionForm,
  EmailSchema,
} from "../islands/emailCollectionForm.tsx";
import { rejectEmailCollection, sendEmail } from "../lib/mutation.ts";
import { WithSession } from "fresh-session/mod.ts";
import { SuccessType } from "./_middleware.ts";
import { setCookie } from "$std/http/cookie.ts";

export type SessionData = { session: Record<string, string>; message?: string };

export const config: RouteConfig = {
  skipInheritedLayouts: true,
};

export const handler: Handlers<SuccessType> = {
  async POST(req: Request, ctx: HandlerContext<SessionData, WithSession>) {
    const emailData = await req.formData();

    if (emailData.get("decline")) {
      void rejectEmailCollection();
    } else {
      const { session } = ctx.state;
      const { data: email, errors }: {
        email: AppRegistrationRequest;
        errors: ErrorType;
      } = validate(EmailSchema, emailData);

      if (errors) {
        session.flash("success", {
          status: false,
          message: "Validation failed",
          errors,
        });
        return new Response("", { status: 400 });
      }

      void sendEmail(email.email);
      session.flash("success", {
        status: true,
        message: "Thanks!",
      });
    }

    const resp = new Response(
      "",
      {
        status: 307,
        headers: { Location: "/" },
      },
    );

    setCookie(resp.headers, {
      name: "emailPrompted",
      value: true,
      //
      //https://developer.chrome.com/blog/cookie-max-age-expires/
      maxAge: 400 * 24 * 60 * 60,
    });
    return resp;
  },
};

export default function EmailCollectionRoute() {
  return <EmailCollectionForm />;
}
