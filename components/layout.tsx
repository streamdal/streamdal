import { Head } from "$fresh/runtime.ts";

export type MetaProps = {
  title?: string;
  name?: string;
  description?: string;
};

export type LayoutProps = {
  children: ComponentChildren;
  meta?: MetaProps;
};
export const Layout = ({ children, ...meta }: LayoutProps) => (
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
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap"
      />
      <link
        rel="stylesheet"
        href="https://esm.sh/reactflow@11.7.4/dist/base.css"
      />
      <link
        rel="stylesheet"
        href="https://esm.sh/reactflow@11.7.4/dist/style.css"
      />
      <link rel="stylesheet" href="style.css" />
      <link
        href="https://cdnjs.cloudflare.com/ajax/libs/flowbite/1.7.0/flowbite.min.css"
        rel="stylesheet"
      />
    </Head>
    <body className="h-screen">
      <div className="flex flex-col w-full text-web">
        <div className="sticky top-0 flex flex-row justify-between h-16 bg-web w-full items-center">
          <a href="/">
            <img
              src="/images/logo-dark.png"
              className="w-44 h-fit ml-4"
              alt="Snitch Logo"
            />
          </a>
        </div>
        <div className="mx-8 my-6">
          {children}
        </div>
      </div>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/flowbite/1.7.0/flowbite.min.js">
      </script>
    </body>
  </html>
);
