import { MiddlewareHandlerContext } from "$fresh/server.ts";
import {
  cookieSession,
  WithSession,
} from "https://deno.land/x/fresh_session@0.2.2/mod.ts";
import { SuccessType } from "./pipelines/[id]/delete.tsx";

//
// TODO; move to env
Deno.env.set("APP_KEY", "dayroom-tingling-movable-flatly");

export type State = { success: SuccessType } & WithSession;

const session = cookieSession();

const sessionHandler = (req: Request, ctx: MiddlewareHandlerContext<State>) => {
  return session(req, ctx as any);
};
export const handler = [sessionHandler];
