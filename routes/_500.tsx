import { NavBar } from "../components/nav/nav.tsx";
import { InternalError } from "../components/error/internal.tsx";
import { ErrorPageProps } from "$fresh/server.ts";

export default async function InternalErrorRoute({ error }: ErrorPageProps) {
  const version = await Deno.readTextFile("VERSION");

  return (
    <>
      <NavBar />
      <div className="flex flex-col w-screen text-web">
        <InternalError message={(error as Error)?.message} />
        <div class="absolute bottom-0 left-0 text-streamdalPurple ml-2 mb-1">
          {version}
        </div>
      </div>
    </>
  );
}
