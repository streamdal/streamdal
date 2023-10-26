import { AppContext } from "$fresh/server.ts";
import { Head } from "$fresh/src/runtime/head.ts";
import { DEMO } from "../lib/configs.ts";

export default async function App(
  req: Request,
  ctx: AppContext,
) {
  return (
    <html lang="en">
      <Head>
        <title>
          {DEMO === "true"
            ? "Streamdal: Open Source Data Observability That Drives Action"
            : "Streamdal Console"}
        </title>
        <meta
          charSet="UTF-8"
          content={DEMO === "true"
            ? "Detect and resolve data incidents faster by peeking into data flowing through your systems" +
              " and act on it in real-time with Streamdal"
            : "Streamdal's Console"}
          name="description"
        />
        {DEMO === "true" &&
          (
            <>
              <meta
                property="og:title"
                content="Streamdal: Open Source Data Observability That Drives Action"
              />
              <meta
                property="og:description"
                content="Detect and resolve data incidents faster by peeking into data flowing through your systems and act on it in real-time with Streamdal"
              />
              <meta
                property="og:image"
                content="/images/data-graph.png"
              />
              <meta
                property="og:url"
                content="https://demo.streamdal.com/"
              />
            </>
          )}
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
