export const SITE = {
  title: "Streamdal Documentation",
  description: "Streamdal.com platform documentation",
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
            text: "Overview",
            slug: "overview",
            link: "en/overview",
          },
          {
            text: "Quickstart",
            slug: "quick-start",
            link: "en/getting-started/quick-start",
          },
          {
            text: "Use Cases",
            slug: "use-cases",
            link: "en/getting-started/use-cases",
          },
        ],
      },
      {
        text: "Guides",
        children: [
          {
            text: "Overview",
            slug: "guides-overview",
            link: "en/guides/overview",
          },
          {
            text: "How to use Plumber with NATS",
            slug: "guides-how-to-use-plumber-with-nats",
            link: "en/guides/how-to-use-plumber-with-nats",
          },
          {
            text: "How to use Plumber with RabbitMQ",
            slug: "guides-how-to-use-plumber-with-rabbit",
            link: "en/guides/how-to-use-plumber-with-rabbit",
          },
          {
            text: "How to use Plumber with Kafka",
            slug: "guides-how-to-use-plumber-with-kafka",
            link: "en/guides/how-to-use-plumber-with-kafka",
          },
        ],
      },
      {
        text: "Data Ingestion",
        children: [
          {
            text: "Overview",
            slug: "data-ingestion-overview",
            link: "en/data-ingestion/overview",
          },
          {
            text: "Relay",
            children: [
              {
                text: "Overview",
                slug: "data-ingestion-relay-overview ",
                link: "en/data-ingestion/relay/overview",
              },
              {
                text: "Kafka",
                slug: "data-ingestion-relay-kafka",
                link: "en/data-ingestion/relay/kafka",
              },
              {
                text: "RabbitMQ",
                slug: "data-ingestion-relay-rabbitmq",
                link: "en/data-ingestion/relay/rabbitmq",
              },
              {
                text: "GCP Pub/Sub",
                slug: "data-ingestion-relay-gcp-pub-sub",
                link: "en/data-ingestion/relay/gcp-pub-sub",
              },
              {
                text: "AWS Kinesis",
                slug: "data-ingestion-relay-aws-kinesis",
                link: "en/data-ingestion/relay/aws-kinesis",
              },
              {
                text: "NATS",
                slug: "data-ingestion-relay-nats",
                link: "en/data-ingestion/relay/nats",
              },
              {
                text: "PostgreSQL CDC",
                slug: "relay-postgresql-cdc",
                link: "en/data-ingestion/relay/postgresql-cdc",
              },
              {
                text: "Mongo CDC",
                slug: "relay-mongo-cdc",
                link: "en/data-ingestion/relay/mongo-cdc",
              },
              {
                text: "Other Systems",
                slug: "relay-other-systems",
                link: "en/data-ingestion/relay/other-systems",
              },
            ],
          },
          {
            text: "HTTP API",
            slug: "data-ingestion-http",
            link: "en/data-ingestion/http",
          },
          {
            text: "gRPC API",
            slug: "data-ingestion-grpc",
            link: "en/data-ingestion/grpc",
          },
        ],
      },
      {
        text: "Components",
        children: [
          {
            text: "Collections",
            children: [
              {
                text: "Overview",
                slug: "components-collections-overview",
                link: "en/components/collections/overview",
              },
              {
                text: "Search",
                slug: "components-collections-search",
                link: "en/components/collections/search",
              },
              {
                text: "Events",
                slug: "components-collections-events",
                link: "en/components/collections/events",
              },
              {
                text: "Message Envelopes",
                slug: "components-events-message-envelopes",
                link: "en/components/collections/message-envelopes",
              },
            ],
          },
          {
            text: "Replays",
            slug: "components-replays",
            link: "en/components/replays",
          },
          {
            text: "Destinations",
            children: [
              {
                text: "Overview",
                slug: "destinations-overview",
                link: "en/components/destinations/overview",
              },
              {
                text: "GCP Pub/Sub",
                slug: "destinations-gcp-pub-sub",
                link: "en/components/destinations/gcp-pub-sub",
              },
              {
                text: "Snowflake",
                slug: "destinations-snowflake",
                link: "en/components/destinations/snowflake",
              },
            ],
          },
          {
            text: "Schemas",
            children: [
              {
                text: "Overview",
                slug: "components-schemas-overview",
                link: "en/components/schemas/overview",
              },
              {
                text: "Automatic Schema Publishing",
                slug: "components-schemas-automatic-publishing",
                link: "en/components/schemas/automatic-publishing",
              },
            ],
          },
          {
            text: "Monitor",
            children: [
              {
                text: "Overview",
                slug: "components-monitor-overview",
                link: "en/components/monitor/overview",
              },
              {
                text: "Monitoring Data Flow",
                slug: "components-monitor-monitoring-data-flow",
                link: "en/components/monitor/monitoring-data-flow",
              },
              {
                text: "Dead Letter",
                slug: "components-monitor-dead-letter",
                link: "en/components/monitor/dead-letter",
              },
              {
                text: "Anomaly Detection",
                slug: "components-monitor-anomaly-detection",
                link: "en/components/monitor/anomaly-detection",
              },
              {
                text: "Detecting Schema Changes",
                slug: "components-monitor-detecting-schema-changes",
                link: "en/components/monitor/detecting-schema-changes",
              },
              {
                text: "Semantic Data Monitoring",
                slug: "components-monitor-semantic",
                link: "en/components/monitor/semantic-data-monitoring",
              },
            ],
          },
          {
            text: "Alert",
            children: [
              {
                text: "Overview",
                slug: "components-alert-overview",
                link: "en/components/alert/overview",
              },
            ],
          },
          {
            text: "Functions",
            children: [
              {
                text: "Overview",
                slug: "components-functions-overview",
                link: "en/components/functions/overview",
              },
              {
                text: "Collections",
                slug: "components-functions-collections",
                link: "en/components/functions/collections",
              },
              {
                text: "Replay",
                slug: "components-functions-replay",
                link: "en/components/functions/replay",
              },
              {
                text: "Monitor",
                slug: "components-functions-monitor",
                link: "en/components/functions/monitor",
              },
              {
                text: "Dead Letter",
                slug: "components-functions-dead-letter",
                link: "en/components/functions/dead-letter",
              },
            ],
          },
          {
            text: "Dead Letter",
            children: [
              {
                text: "Overview",
                slug: "components-dead-letter-overview",
                link: "en/components/dead-letter/overview",
              },
              {
                text: "Staging",
                slug: "components-dead-letter-staging",
                link: "en/components/dead-letter/staging",
              },
            ],
          },
          {
            text: "Tunnels",
            slug: "components-tunnels",
            link: "en/components/tunnels",
          },
          {
            text: "Hosted Plumber",
            slug: "components-hosted-plumber",
            link: "en/components/hosted-plumber",
          },
        ],
      },
      {
        text: "Advanced",
        children: [
          {
            text: "Data Science",
            slug: "advanced-data-science",
            link: "en/advanced/data-science",
          },
          {
            text: "Data Lake",
            slug: "advanced-data-lake",
            link: "en/advanced/data-lake",
          },
          {
            text: "Schema Inference",
            slug: "advanced-schema-inference",
            link: "en/advanced/schema-inference",
          },
          {
            text: "Architecture",
            slug: "advanced-architecture",
            link: "en/advanced/architecture",
          },
        ],
      },
      {
        text: "Plumber",
        children: [
          {
            text: "Overview",
            slug: "plumber-overview",
            link: "en/plumber/overview",
          },
          {
            text: "Server Mode",
            children: [
              {
                text: "Overview",
                slug: "plumber-server-mode-overview",
                link: "en/plumber/server-mode/overview",
              },
              {
                text: "Deploy",
                slug: "plumber-server-mode-deploy",
                link: "en/plumber/server-mode/deploy",
              },
              {
                text: "Manage via CLI",
                slug: "plumber-manage-cli",
                link: "en/plumber/server-mode/manage-cli",
              },
              {
                text: "Manage via gRPC",
                slug: "plumber-manage-grpc",
                link: "en/plumber/server-mode/manage-grpc",
              },
              {
                text: "Manage via gRPC Example",
                slug: "plumber-manage-grpc-example",
                link: "en/plumber/server-mode/manage-grpc-example",
              },
            ],
          },
          {
            text: "Terraform",
            slug: "plumber-terraform",
            link: "en/plumber/terraform-provider",
          },
          {
            text: "Telemetry",
            slug: "plumber-telemetry",
            link: "en/plumber/telemetry",
          },
        ],
      },
    ],
    api: [
      {
        text: "Resources",
        children: [
          {
            text: "Support",
            slug: "support",
            link: "en/resources/support",
          },
          {
            text: "Changelog",
            slug: "changelog",
            link: "en/resources/changelog",
          },
        ],
      },
      {
        text: "Open Source",
        children: [
          {
            text: "Plumber",
            slug: "plumber-oss",
            link: "en/resources/open-source/plumber-oss",
          },
          {
            text: "Rabbit library",
            slug: "rabbit-library",
            link: "en/resources/open-source/rabbit-library",
          },
          {
            text: "Schema Publisher",
            slug: "schema-publisher",
            link: "en/resources/open-source/schema-publisher",
          },
          {
            text: "Go Template",
            slug: "go-template",
            link: "en/resources/open-source/go-template",
          },
          {
            text: "Kng",
            slug: "kng",
            link: "en/resources/open-source/kng",
          },
          {
            text: "Kafka Sink Connector",
            slug: "kafka-sink-connector",
            link: "en/resources/open-source/kafka-sink-connector",
          },
        ],
      },
      {
        text: "Legal",
        children: [
          {
            text: "Terms and Conditions",
            slug: "terms-and-conditions",
            link: "en/resources/legal/terms-and-conditions",
          },
          {
            text: "Service Legal Agreement",
            slug: "service-legal-agreement",
            link: "en/resources/legal/service-legal-agreement",
          },
          {
            text: "Privacy Policy",
            slug: "privacy-policy",
            link: "en/resources/legal/privacy-policy",
          },
          {
            text: "Acceptable Use Policy",
            slug: "acceptable-use-policy",
            link: "en/resources/legal/acceptable-use-policy",
          },
          {
            text: "Billing",
            slug: "billing",
            link: "en/resources/legal/billing",
          },
        ],
      },
      {
        text: "FAQ",
        children: [
          {
            text: "Technical",
            slug: "technical",
            link: "en/resources/faq/technical",
          },
          {
            text: "Pricing",
            slug: "pricing",
            link: "en/resources/faq/pricing",
          },
        ],
      },
    ],
  },
};
