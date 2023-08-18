import { MiddlewareHandlerContext } from "$fresh/server.ts";
import {
  cookieSession,
  WithSession,
} from "https://deno.land/x/fresh_session@0.2.2/mod.ts";
import { ErrorType } from "../components/form/validate.ts";
import { ServiceMapType } from "../lib/fetch.ts";

export type SuccessType = {
  status: boolean;
  message: string;
  errors?: ErrorType;
};

export type SuccessRoute = {
  success: SuccessType;
};

//
// TODO; move to env
Deno.env.set("APP_KEY", "dayroom-tingling-movable-flatly");

export type State =
  & { success: SuccessType; serviceMap: ServiceMapType }
  & WithSession;

const session = cookieSession();

const sessionHandler = (req: Request, ctx: MiddlewareHandlerContext<State>) => {
  return session(req, ctx as any);
};
export const handler = [sessionHandler];
