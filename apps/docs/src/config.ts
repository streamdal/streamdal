export const SITE = {
  title: "Streamdal Documentation",
  description: "Streamdal Open Source and Data Governance Documentation",
  defaultLanguage: "en_US",
};

export const OPEN_GRAPH = {
  image: {
    src: "https://github.com/withastro/astro/blob/main/assets/social/banner.jpg?raw=true",
    alt:
      "astro logo on a starry expanse of space," +
      " with a purple saturn-like planet floating in the right foreground",
  },
  twitter: "astrodotbuild",
};

// This is the type of the frontmatter you put in the docs markdown files.
export type Frontmatter = {
  title: string;
  metaTitle: string;
  description: string;
  layout: string;
  image?: { src: string; alt: string };
  dir?: "ltr" | "rtl";
  ogLocale?: string;
  lang?: string;
};

export const KNOWN_LANGUAGES = {
  English: "en",
} as const;

export const KNOWN_LANGUAGE_CODES = Object.values(KNOWN_LANGUAGES);

export const GITHUB_EDIT_URL = `https://github.com/withastro/astro/tree/main/examples/docs`;

export const COMMUNITY_INVITE_URL = `https://astro.build/chat`;

// See "Algolia" section of the README for more information.
export const ALGOLIA = {
  indexName: "XXXXXXXXXX",
  appId: "XXXXXXXXXX",
  apiKey: "XXXXXXXXXX",
};

export type MENU_TYPE = "learn" | "api";

export type LeafNode = {
  text: string;
  slug: string;
  link: string;
  isFallback?: boolean;
};

export type ParentNode = {
  text: string;
  children: MenuItem[];
};

export type MenuItem = LeafNode | ParentNode;

export type Sidebar = Record<
  (typeof KNOWN_LANGUAGE_CODES)[number],
  Record<MENU_TYPE, MenuItem[]>
>;

export const SIDEBAR: Sidebar = {
  en: {
    learn: [
      {
        text: "Getting Started",
        children: [
          {
            text: "What is Streamdal?",
            slug: "what-is-streamdal",
            link: "en/what-is-streamdal",
          },
          {
            text: "How Streamdal Works",
            slug: "how-streamdal-works",
            link: "en/getting-started/how-streamdal-works",
          },
          {
            text: "Quickstart",
            slug: "quickstart",
            link: "en/getting-started/quickstart",
          },
        ],
      },
      {
        text: "Guides",
        children: [
          {
            text: "Deployment",
            slug: "deployment",
            link: "en/guides/deployment",
          },
          {
            text: "Instrumentation",
            slug: "instrumentation",
            link: "en/guides/instrumentation",
          },
          {
            text: "Tail",
            slug: "tail",
            link: "en/guides/tail",
          },
        ],
      },
      {
        text: "Core Components",
        children: [
          {
            text: "Overview",
            slug: "core-components-overview",
            link: "en/core-components/overview",
          },
          {
            text: "SDK",
            slug: "sdk",
            link: "en/core-components/sdk",
          },
          {
            text: "Server",
            slug: "server",
            link: "en/core-components/server",
          },
          {
            text: "Console UI",
            slug: "console-ui",
            link: "en/core-components/console-ui",
          },
          {
            text: "Libraries/Shims (TBA)",
            slug: "libraries-shiums",
            link: "en/core-components/libraries-shims",
          },
        ],
      },
      {
        text: "SDKs",
        children: [
          {
            text: "Go",
            slug: "go",
            link: "en/sdks/go"
          },
          {
            text: "Node",
            slug: "node",
            link: "en/sdks/node"
          },
          {
            text: "Python",
            slug: "python",
            link: "en/sdks/python",
          },
          {
            text: "Java (TBA)",
            slug: "java",
            link: "en/sdks/java"
          },
          {
            text: "Scala (TBA)",
            slug: "scala",
            link: "en/sdks/scala"
          },
          {
            text: "Rust (TBA)",
            slug: "rust",
            link: "en/sdks/rust"
          },
          {
            text: "Ruby (TBA)",
            slug: "ruby",
            link: "en/sdks/ruby"
          },
          {
            text: ".NET (TBA)",
            slug: "dotnet",
            link: "en/sdks/dotnet"
          },
        ],
      },
    ],
    api: [
      {
        text: "Data Governance (Beta)",
        children: [
          {
            text: "Overview",
            slug: "overview",
            link: "en/data-governance/overview"
          },
          {
            text: "Data Quality",
            slug: "data-quality",
            link: "en/data-governance/data-quality"
          },
          {
            text: "Governance for Compliance",
            children: [
              {
                text: "CCPA",
                slug: "ccpa-cpra",
                link: "en/data-governance/compliance/ccpa-cpra",
              },
              {
                text: "FED RAMP",
                slug: "fed-ramp",
                link: "en/data-governance/compliance/fed-ramp",
              },
              {
                text: "GDPR",
                slug: "gdpr",
                link: "en/data-governance/compliance/gdpr",
              },
              {
                text: "GLBA",
                slug: "gbla",
                link: "en/data-governance/compliance/glba",
              },
              {
                text: "HIPAA",
                slug: "hipaa",
                link: "en/data-governance/compliance/hipaa",
              },
              {
                text: "ISO/IEC",
                slug: "iso-iec",
                link: "en/data-governance/compliance/iso-iec",
              },
              {
                text: "NY State S.H.I.E.L.D",
                slug: "ny-state-shield",
                link: "en/data-governance/compliance/ny-state-shield",
              },
              {
                text: "NYCRR 500",
                slug: "nycrr-500",
                link: "en/data-governance/compliance/nycrr-500",
              },
              {
                text: "PCI DSS",
                slug: "pci-dss",
                link: "en/data-governance/compliance/pci-dss",
              },
              {
                text: "PIPEDA",
                slug: "pipeda",
                link: "en/data-governance/compliance/pipeda",
              },
              {
                text: "TDPSA",
                slug: "tdpsa",
                link: "en/data-governance/compliance/tdpsa",
              },
              {
                text: "VCDPA",
                slug: "vcdpa",
                link: "en/data-governance/compliance/vcdpa",
              },
            ]
          },  
        ],
      },
      {
        text: "Resources & Support",
        children: [
          {
            text: "Get Support",
            slug: "get-support",
            link: "en/resources-support/get-support",
          },
          {
            text: "Community",
            slug: "community",
            link: "en/resources-support/community",
          },
          {
            text: "Contributing",
            slug: "contributing",
            link: "en/resources-support/contributing",
          },
          {
            text: "FAQ",
            slug: "faq",
            link: "en/resources-support/faq",
          },
          {
            text: "Glossary",
            slug: "glossary",
            link: "en/resources-support/glossary",
          },  
          {
            text: "Open Source",
            slug: "license",
            link: "en/resources-support/open-source",
          },
          {
            text: "Roadmap",
            slug: "roadmap",
            link: "en/resources-support/roadmap",
          },
        ],
      },
      {
        text: "Engineering",
        children: [
          {
            text: "Overview",
            slug: "overview",
            link: "en/engineering/overview",
          },
          {
            text: "gRPC",
            slug: "grpc",
            link: "en/engineering/grpc",
          },
          {
            text: "Metrics",
            slug: "metrics",
            link: "en/engineering/metrics",
          },
          {
            text: "Observability",
            slug: "observability",
            link: "en/engineering/observability",
          },
          {
            text: "Quarantine",
            slug: "quarantine",
            link: "en/engineering/quarantine",
          },
        ],
      },
    ],
  },
};
