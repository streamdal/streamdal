import { Head } from "$fresh/runtime.ts";
import { NavBar } from "./nav/nav.tsx";
import { ComponentChildren } from "preact";
import { ReactFlowProvider } from "reactflow";
import "flowbite";

export type MetaProps = {
  title?: string;
  name?: string;
  description?: string;
};

export type LayoutProps = {
  children: ComponentChildren;
  meta?: MetaProps;
  hideNav?: boolean;
};
export const Layout = (
  { children, hideNav, ...meta }: LayoutProps & MetaProps,
) => (
  <html lang="en">
    <Head>
      <title>{meta.title || "Snitch Console"}</title>
      <meta
        content={meta.description || "Streamdal's Snitch Console"}
        name="description"
      />
      <link rel="icon" type="image/png" href="/images/favicon.png" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=Space+Grotesk:wght@400;500&display=swap"
      />
      <link
        rel="stylesheet"
        href="https://esm.sh/reactflow@11.8.2/dist/base.css"
      />
      <link
        rel="stylesheet"
        href="https://esm.sh/reactflow@11.8.2/dist/style.css"
      />
      <link rel="stylesheet" type="text/css" href="/style.css" />
    </Head>
    <body className="h-screen bg-purple-50 m-0 overflow-hidden">
      {hideNav ? null : <NavBar />}
      <div className="flex flex-col w-screen text-web">
        <ReactFlowProvider>
          {children}
        </ReactFlowProvider>
      </div>
    </body>
  </html>
);
