import { HandlerContext, Handlers } from "$fresh/server.ts";
import { AppRegistrationRequest } from "streamdal-protos/protos/sp_external.ts";
import { ErrorType, validate } from "../components/form/validate.ts";
import {
  EmailCollectionForm,
  EmailSchema,
} from "../islands/emailCollectionForm.tsx";
import { rejectEmailCollection, sendEmail } from "../lib/mutation.ts";
import { WithSession } from "fresh-session/mod.ts";

export type SessionData = { session: Record<string, string>; message?: string };

export const config: RouteConfig = {
  skipInheritedLayouts: true,
};

export const handler: Handlers<> = {
  async POST(req: Request, ctx: HandlerContext<SessionData, WithSession>) {
    const { session } = ctx.state;

    const emailData = await req.formData();
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

    if (email.email) {
      void sendEmail(email.email);
      session.flash("success", {
        status: true,
        message: "Thanks!",
      });
    } else if (!email.email) {
      void rejectEmailCollection();
    }

    session.set("emailPrompted", true);

    return new Response(
      "",
      {
        status: 307,
        headers: { Location: "/" },
      },
    );
  },
};

export default function EmailCollectionRoute() {
  return <EmailCollectionForm />;
}
