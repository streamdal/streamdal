import { AppContext } from "$fresh/server.ts";
import { Head } from "$fresh/src/runtime/head.ts";
import { streamServiceMap } from "../lib/stream.ts";

export default async function App(
  req: Request,
  ctx: AppContext,
) {
  streamServiceMap();
  return (
    <html lang="en">
      <Head>
        <title>{"Streamdal Console"}</title>
        <meta
          charSet="UTF-8"
          content="Streamdal's Console"
          name="description"
        />
        <link rel="icon" type="image/png" href="/images/favicon.png" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=Space+Grotesk:wght@400;500&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://esm.sh/v132/reactflow@11.8.2/dist/base.css"
        />
        <link rel="stylesheet" type="text/css" href="/style.css" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/base16/dark-violet.min.css"
        />
      </Head>
      <body className="h-screen bg-purple-50 m-0 overflow-hidden">
        <ctx.Component />
      </body>
    </html>
  );
}
