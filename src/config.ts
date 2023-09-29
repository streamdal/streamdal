export const SITE = {
  title: "Snitch Documentation",
  description: "Snitch.build documentation",
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
            text: "What is Snitch?",
            slug: "what-is-snitch",
            link: "en/what-is-snitch",
          },
          {
            text: "How Snitch Works",
            slug: "how-snitch-works",
            link: "en/getting-started/how-snitch-works",
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
            text: "Quarantine",
            slug: "quarantine",
            link: "en/guides/quarantine",
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
            text: "Libraries/Shims (Coming Soon!)",
            slug: "libraries-shiums",
            link: "en/core-components/libraries-shims",
          },
        ],
      },
      {
        text: "Language Support",
        children: [
          {
            text: "Go",
            slug: "go",
            link: "en/language-support/go"
          },
          {
            text: "Node",
            slug: "node",
            link: "en/language-support/node"
          },
          {
            text: "Python",
            slug: "python",
            link: "en/language-support/python",
          },
          {
            text: "Java (Coming Soon!)",
            slug: "java",
            link: "en/language-support/java"
          },
          {
            text: "Scala (Coming Soon!)",
            slug: "scala",
            link: "en/language-support/scala"
          },
          {
            text: "Rust (Coming Soon!)",
            slug: "rust",
            link: "en/language-support/rust"
          },
          {
            text: "Ruby (Coming Soon!)",
            slug: "ruby",
            link: "en/language-support/ruby"
          },
          {
            text: "C++ (Coming Soon!)",
            slug: "c++",
            link: "en/language-support/c++"
          },
        ],
      },
    ],
    api: [
      {
        text: "Data Governance",
        children: [
          {
            text: "Overview (Coming Soon!)",
            slug: "overview",
            link: "en/data-governance/overview"
          },
          {
            text: "Data Quality (Coming Soon!)",
            slug: "data-quality",
            link: "en/data-governance/data-quality"
          },
          {
            text: "Internal Governance (Coming Soon!)",
            slug: "internal-governance",
            link: "en/data-governance/internal-governance"
          },
          {
            text: "Governance for Compliance (Coming Soon!)",
            children: [
              {
                text: "CCPA/CPRA",
                slug: "ccpa-cpra",
                link: "en/data-governance/compliance/ccpa-cpra",
              },
              {
                text: "CDPA",
                slug: "cdpa",
                link: "en/data-governance/compliance/cdpa",
              },
              {
                text: "FED RAMP",
                slug: "fed-ramp",
                link: "en/data-governance/compliance/fed-ramp",
              },
              {
                text: "GBLA",
                slug: "gbla",
                link: "en/data-governance/compliance/gbla",
              },
              {
                text: "GDPR",
                slug: "gdpr",
                link: "en/data-governance/compliance/gdpr",
              },
              {
                text: "HIPAA",
                slug: "hipaa",
                link: "en/data-governance/compliance/hipaa",
              },
              {
                text: "ISC/IEC",
                slug: "isc-iec",
                link: "en/data-governance/compliance/isc-iec",
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
                text: "SOCII",
                slug: "socii",
                link: "en/data-governance/compliance/socii",
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
            text: "Changelog",
            slug: "changelog",
            link: "en/resources-support/changelog",
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
            text: "License & Use",
            slug: "license",
            link: "en/resources-support/license",
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
            text: "Metrics (Coming Soon!)",
            slug: "metrics",
            link: "en/engineering/metrics",
          },
          {
            text: "Observability",
            slug: "observability",
            link: "en/engineering/observability",
          },
          {
            text: "Peek",
            slug: "peek",
            link: "en/engineering/peek",
          },
        ],
      },
    ],
  },
};
