import { MiddlewareHandlerContext } from "$fresh/server.ts";
import {
  cookieSession,
  WithSession,
} from "https://deno.land/x/fresh_session@0.2.2/mod.ts";
import { ErrorType } from "../components/form/validate.ts";
import { ServiceMapper } from "../lib/serviceMapper.ts";

export type SuccessType = {
  status: boolean;
  message: string;
  errors?: ErrorType;
};

export type SuccessRoute = {
  success: SuccessType;
};

//
// ensure session key is present
!Deno.env.get("APP_KEY") && Deno.env.set("APP_KEY", crypto.randomUUID());

export type State =
  & { success: SuccessType; serviceMap: ServiceMapper }
  & WithSession;

const session = cookieSession();

const sessionHandler = (req: Request, ctx: MiddlewareHandlerContext<State>) => {
  const { pathname } = new URL(req.url);
  if (
    pathname.includes("/ws/")
  ) {
    return ctx.next();
  } else {
    return session(req, ctx as any);
  }
};
export const handler = [sessionHandler];
