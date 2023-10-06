import { SuccessRoute, SuccessType } from "./_middleware.ts";
import { Handlers } from "$fresh/src/server/types.ts";

export const handler: Handlers<SuccessRoute> = {
  async POST(req, ctx) {
    const { session } = ctx.state;
    const success = session.flash("success");
    return ctx.render({
      success,
    });
  },
};

export default function IndexRoute() {
  return;
}
