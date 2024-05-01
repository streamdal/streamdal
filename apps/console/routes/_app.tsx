import { Head } from "$fresh/src/runtime/head.ts";
import { AppContext } from "$fresh/server.ts";
import { DEMO, GOOGLE_ANALYTICS_KEY, SENTRY_KEY } from "../lib/configs.ts";

export const GTM_SCRIPT =
  `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','${GOOGLE_ANALYTICS_KEY}');`;

export default async function App(
  req: Request,
  ctx: AppContext,
) {
  return (
    <html lang="en">
      <Head>
        <title>
          {"Streamdal: the open source code-native data pipeline platform"}
        </title>
        <meta
          charSet="UTF-8"
          content={"Use Streamdal to build code-native data pipelines that detect and mask PII"}
          name="description"
        />
        {DEMO === true &&
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
        <link
          rel="icon"
          type="image/svg+xml"
          sizes="32x32"
          href="/images/favicon-dark.svg"
          media="(prefers-color-scheme: dark)"
        />
        <link
          rel="icon"
          type="image/svg+xml"
          sizes="32x32"
          href="/images/favicon-light.svg"
          media="(prefers-color-scheme: light)"
        />
        <link
          rel="stylesheet"
          href="/fonts/fonts.css?family=Inter:wght@300;400;600;700&family=Space+Grotesk:wght@400;500&display=swap"
        />
        <link
          rel="stylesheet"
          href="/vendor/reactflow@11.8.2.base.css"
        />
        <link
          rel="stylesheet"
          href="/vendor/highlight.js@11.8.0.dark-violet.min.css"
        />
        <link rel="stylesheet" type="text/css" href="/style.css" />
        {DEMO && GOOGLE_ANALYTICS_KEY &&
          (
            <script
              async
              id="gtag-init"
              dangerouslySetInnerHTML={{
                __html: GTM_SCRIPT,
              }}
            />
          )}
        {DEMO && SENTRY_KEY &&
          (
            <>
              <script
                src="https://browser.sentry-cdn.com/7.77.0/bundle.tracing.replay.min.js"
                integrity="sha384-OKHElBQJJIwDxyzJNjyBXH6DF/kK6MJO1iN/cSS4BjCOr76ChDkzpIYOQ9/XPOuW"
                crossOrigin="anonymous"
              >
              </script>
              <script src="/sentry.js" data-sentryKey={SENTRY_KEY} />
            </>
          )}
      </Head>
      <body className="h-screen bg-violet-50 m-0 overflow-hidden" f-client-nav>
        {DEMO && GOOGLE_ANALYTICS_KEY &&
          (
            <noscript>
              <iframe
                src={`https://www.googletagmanager.com/ns.html?id=${GOOGLE_ANALYTICS_KEY}`}
                height="0"
                width="0"
                style="display:none;visibility:hidden"
              >
              </iframe>
            </noscript>
          )}
        <ctx.Component />
      </body>
    </html>
  );
}
