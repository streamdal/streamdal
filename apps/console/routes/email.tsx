import { Handlers, RouteConfig } from "$fresh/server.ts";
import { validate } from "../components/form/validate.ts";
import { rejectEmailCollection, sendEmail } from "../lib/mutation.ts";
import { SuccessRoute, SuccessType } from "./_middleware.ts";
import { setCookie } from "$std/http/cookie.ts";
import { EmailCollectionForm } from "root/islands/emailCollectionForm.tsx";
import { EmailSchema } from "root/components/account/email.ts";

export const config: RouteConfig = {
  skipInheritedLayouts: true,
};

export const handler: Handlers<SuccessRoute> = {
  async POST(req, ctx) {
    const emailData = await req.formData();

    if (emailData.get("decline")) {
      void rejectEmailCollection();
    } else {
      const { session }: any = ctx.state;
      const { data, errors } = validate(EmailSchema, emailData);

      if (errors) {
        session.flash("success", {
          status: false,
          message: "Validation failed",
          errors,
        });
        return new Response("", { status: 400 });
      }

      data?.email && void sendEmail(data.email);
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
      value: "true",
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
