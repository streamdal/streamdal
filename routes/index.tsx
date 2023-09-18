import { SuccessType } from "./_middleware.ts";
import { Handlers } from "$fresh/src/server/types.ts";

export const handler: Handlers<SuccessType> = {
  async POST(req, ctx) {
    const { session } = ctx.state;
    const success = session.get("success");
    //
    // TODO: unsetting after read because session.flash doesn't seem to work
    // find another middleware or roll our own
    session.set("success", null);
    return ctx.render({
      success,
    });
  },
};

export default function IndexRoute(props) {
  return;
}
