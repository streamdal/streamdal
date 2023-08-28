/// <reference types="node" />
import type { RehypePlugin, RemarkPlugin, RemarkRehype } from '@astrojs/markdown-remark';
import type { ILanguageRegistration, IThemeRegistration, Theme } from 'shiki';
import type { ViteUserConfig } from '../../@types/astro';
import type { OutgoingHttpHeaders } from 'http';
import { z } from 'zod';
export declare const AstroConfigSchema: z.ZodObject<{
    root: z.ZodEffects<z.ZodDefault<z.ZodOptional<z.ZodString>>, URL, string | undefined>;
    srcDir: z.ZodEffects<z.ZodDefault<z.ZodOptional<z.ZodString>>, URL, string | undefined>;
    publicDir: z.ZodEffects<z.ZodDefault<z.ZodOptional<z.ZodString>>, URL, string | undefined>;
    outDir: z.ZodEffects<z.ZodDefault<z.ZodOptional<z.ZodString>>, URL, string | undefined>;
    site: z.ZodOptional<z.ZodString>;
    base: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    trailingSlash: z.ZodDefault<z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"always">, z.ZodLiteral<"never">, z.ZodLiteral<"ignore">]>>>;
    output: z.ZodDefault<z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"static">, z.ZodLiteral<"server">]>>>;
    adapter: z.ZodOptional<z.ZodObject<{
        name: z.ZodString;
        hooks: z.ZodDefault<z.ZodObject<{}, "passthrough", z.ZodTypeAny, {}, {}>>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        hooks: {};
    }, {
        hooks?: {} | undefined;
        name: string;
    }>>;
    integrations: z.ZodEffects<z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        hooks: z.ZodDefault<z.ZodObject<{}, "passthrough", z.ZodTypeAny, {}, {}>>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        hooks: {};
    }, {
        hooks?: {} | undefined;
        name: string;
    }>, "many">>, {
        name: string;
        hooks: {};
    }[], unknown>;
    build: z.ZodDefault<z.ZodOptional<z.ZodObject<{
        format: z.ZodDefault<z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"file">, z.ZodLiteral<"directory">]>>>;
        client: z.ZodEffects<z.ZodDefault<z.ZodOptional<z.ZodString>>, URL, string | undefined>;
        server: z.ZodEffects<z.ZodDefault<z.ZodOptional<z.ZodString>>, URL, string | undefined>;
        assets: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        assetsPrefix: z.ZodOptional<z.ZodString>;
        serverEntry: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        assetsPrefix?: string | undefined;
        assets: string;
        server: URL;
        format: "file" | "directory";
        client: URL;
        serverEntry: string;
    }, {
        assets?: string | undefined;
        server?: string | undefined;
        format?: "file" | "directory" | undefined;
        client?: string | undefined;
        assetsPrefix?: string | undefined;
        serverEntry?: string | undefined;
    }>>>;
    server: z.ZodEffects<z.ZodDefault<z.ZodOptional<z.ZodObject<{
        open: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        host: z.ZodDefault<z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodBoolean]>>>;
        port: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        headers: z.ZodOptional<z.ZodType<OutgoingHttpHeaders, z.ZodTypeDef, OutgoingHttpHeaders>>;
    }, "strip", z.ZodTypeAny, {
        headers?: OutgoingHttpHeaders | undefined;
        open: boolean;
        host: string | boolean;
        port: number;
    }, {
        open?: boolean | undefined;
        host?: string | boolean | undefined;
        port?: number | undefined;
        headers?: OutgoingHttpHeaders | undefined;
    }>>>, {
        headers?: OutgoingHttpHeaders | undefined;
        open: boolean;
        host: string | boolean;
        port: number;
    }, unknown>;
    image: z.ZodDefault<z.ZodObject<{
        service: z.ZodUnion<[z.ZodLiteral<"astro/assets/services/sharp">, z.ZodLiteral<"astro/assets/services/squoosh">, z.ZodString]>;
    }, "strip", z.ZodTypeAny, {
        service: string;
    }, {
        service: string;
    }>>;
    markdown: z.ZodDefault<z.ZodObject<{
        drafts: z.ZodDefault<z.ZodBoolean>;
        syntaxHighlight: z.ZodDefault<z.ZodUnion<[z.ZodLiteral<"shiki">, z.ZodLiteral<"prism">, z.ZodLiteral<false>]>>;
        shikiConfig: z.ZodDefault<z.ZodObject<{
            langs: z.ZodDefault<z.ZodArray<z.ZodType<ILanguageRegistration, z.ZodTypeDef, ILanguageRegistration>, "many">>;
            theme: z.ZodDefault<z.ZodUnion<[z.ZodEnum<[Theme, ...Theme[]]>, z.ZodType<IThemeRegistration, z.ZodTypeDef, IThemeRegistration>]>>;
            wrap: z.ZodDefault<z.ZodUnion<[z.ZodBoolean, z.ZodNull]>>;
        }, "strip", z.ZodTypeAny, {
            langs: ILanguageRegistration[];
            theme: string | import("shiki").IShikiTheme;
            wrap: boolean | null;
        }, {
            langs?: ILanguageRegistration[] | undefined;
            theme?: string | import("shiki").IShikiTheme | undefined;
            wrap?: boolean | null | undefined;
        }>>;
        remarkPlugins: z.ZodDefault<z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodTuple<[z.ZodString, z.ZodAny], null>, z.ZodType<RemarkPlugin, z.ZodTypeDef, RemarkPlugin>, z.ZodTuple<[z.ZodType<RemarkPlugin, z.ZodTypeDef, RemarkPlugin>, z.ZodAny], null>]>, "many">>;
        rehypePlugins: z.ZodDefault<z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodTuple<[z.ZodString, z.ZodAny], null>, z.ZodType<RehypePlugin, z.ZodTypeDef, RehypePlugin>, z.ZodTuple<[z.ZodType<RehypePlugin, z.ZodTypeDef, RehypePlugin>, z.ZodAny], null>]>, "many">>;
        remarkRehype: z.ZodDefault<z.ZodOptional<z.ZodType<RemarkRehype, z.ZodTypeDef, RemarkRehype>>>;
        gfm: z.ZodDefault<z.ZodBoolean>;
        smartypants: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        drafts: boolean;
        syntaxHighlight: false | "shiki" | "prism";
        shikiConfig: {
            langs: ILanguageRegistration[];
            theme: string | import("shiki").IShikiTheme;
            wrap: boolean | null;
        };
        remarkPlugins: (string | [string, any] | RemarkPlugin | [RemarkPlugin, any])[];
        rehypePlugins: (string | [string, any] | RehypePlugin | [RehypePlugin, any])[];
        remarkRehype: RemarkRehype;
        gfm: boolean;
        smartypants: boolean;
    }, {
        drafts?: boolean | undefined;
        syntaxHighlight?: false | "shiki" | "prism" | undefined;
        shikiConfig?: {
            langs?: ILanguageRegistration[] | undefined;
            theme?: string | import("shiki").IShikiTheme | undefined;
            wrap?: boolean | null | undefined;
        } | undefined;
        remarkPlugins?: (string | [string, any] | RemarkPlugin | [RemarkPlugin, any])[] | undefined;
        rehypePlugins?: (string | [string, any] | RehypePlugin | [RehypePlugin, any])[] | undefined;
        remarkRehype?: RemarkRehype | undefined;
        gfm?: boolean | undefined;
        smartypants?: boolean | undefined;
    }>>;
    vite: z.ZodDefault<z.ZodType<ViteUserConfig, z.ZodTypeDef, ViteUserConfig>>;
    experimental: z.ZodDefault<z.ZodOptional<z.ZodObject<{
        assets: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        assets: boolean;
    }, {
        assets?: boolean | undefined;
    }>>>;
    legacy: z.ZodDefault<z.ZodOptional<z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>>>;
}, "strip", z.ZodTypeAny, {
    site?: string | undefined;
    adapter?: {
        name: string;
        hooks: {};
    } | undefined;
    base: string;
    markdown: {
        drafts: boolean;
        syntaxHighlight: false | "shiki" | "prism";
        shikiConfig: {
            langs: ILanguageRegistration[];
            theme: string | import("shiki").IShikiTheme;
            wrap: boolean | null;
        };
        remarkPlugins: (string | [string, any] | RemarkPlugin | [RemarkPlugin, any])[];
        rehypePlugins: (string | [string, any] | RehypePlugin | [RehypePlugin, any])[];
        remarkRehype: RemarkRehype;
        gfm: boolean;
        smartypants: boolean;
    };
    output: "static" | "server";
    root: URL;
    srcDir: URL;
    publicDir: URL;
    outDir: URL;
    trailingSlash: "never" | "always" | "ignore";
    server: {
        headers?: OutgoingHttpHeaders | undefined;
        open: boolean;
        host: string | boolean;
        port: number;
    };
    integrations: {
        name: string;
        hooks: {};
    }[];
    build: {
        assetsPrefix?: string | undefined;
        assets: string;
        server: URL;
        format: "file" | "directory";
        client: URL;
        serverEntry: string;
    };
    image: {
        service: string;
    };
    vite: ViteUserConfig;
    experimental: {
        assets: boolean;
    };
    legacy: {};
}, {
    site?: string | undefined;
    base?: string | undefined;
    markdown?: {
        drafts?: boolean | undefined;
        syntaxHighlight?: false | "shiki" | "prism" | undefined;
        shikiConfig?: {
            langs?: ILanguageRegistration[] | undefined;
            theme?: string | import("shiki").IShikiTheme | undefined;
            wrap?: boolean | null | undefined;
        } | undefined;
        remarkPlugins?: (string | [string, any] | RemarkPlugin | [RemarkPlugin, any])[] | undefined;
        rehypePlugins?: (string | [string, any] | RehypePlugin | [RehypePlugin, any])[] | undefined;
        remarkRehype?: RemarkRehype | undefined;
        gfm?: boolean | undefined;
        smartypants?: boolean | undefined;
    } | undefined;
    output?: "static" | "server" | undefined;
    root?: string | undefined;
    srcDir?: string | undefined;
    publicDir?: string | undefined;
    outDir?: string | undefined;
    trailingSlash?: "never" | "always" | "ignore" | undefined;
    server?: unknown;
    adapter?: {
        hooks?: {} | undefined;
        name: string;
    } | undefined;
    integrations?: unknown;
    build?: {
        assets?: string | undefined;
        server?: string | undefined;
        format?: "file" | "directory" | undefined;
        client?: string | undefined;
        assetsPrefix?: string | undefined;
        serverEntry?: string | undefined;
    } | undefined;
    image?: {
        service: string;
    } | undefined;
    vite?: ViteUserConfig | undefined;
    experimental?: {
        assets?: boolean | undefined;
    } | undefined;
    legacy?: {} | undefined;
}>;
export declare function createRelativeSchema(cmd: string, fileProtocolRoot: URL): z.ZodEffects<z.ZodObject<{
    site: z.ZodOptional<z.ZodString>;
    base: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    markdown: z.ZodDefault<z.ZodObject<{
        drafts: z.ZodDefault<z.ZodBoolean>;
        syntaxHighlight: z.ZodDefault<z.ZodUnion<[z.ZodLiteral<"shiki">, z.ZodLiteral<"prism">, z.ZodLiteral<false>]>>;
        shikiConfig: z.ZodDefault<z.ZodObject<{
            langs: z.ZodDefault<z.ZodArray<z.ZodType<ILanguageRegistration, z.ZodTypeDef, ILanguageRegistration>, "many">>;
            theme: z.ZodDefault<z.ZodUnion<[z.ZodEnum<[Theme, ...Theme[]]>, z.ZodType<IThemeRegistration, z.ZodTypeDef, IThemeRegistration>]>>;
            wrap: z.ZodDefault<z.ZodUnion<[z.ZodBoolean, z.ZodNull]>>;
        }, "strip", z.ZodTypeAny, {
            langs: ILanguageRegistration[];
            theme: string | import("shiki").IShikiTheme;
            wrap: boolean | null;
        }, {
            langs?: ILanguageRegistration[] | undefined;
            theme?: string | import("shiki").IShikiTheme | undefined;
            wrap?: boolean | null | undefined;
        }>>;
        remarkPlugins: z.ZodDefault<z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodTuple<[z.ZodString, z.ZodAny], null>, z.ZodType<RemarkPlugin, z.ZodTypeDef, RemarkPlugin>, z.ZodTuple<[z.ZodType<RemarkPlugin, z.ZodTypeDef, RemarkPlugin>, z.ZodAny], null>]>, "many">>;
        rehypePlugins: z.ZodDefault<z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodTuple<[z.ZodString, z.ZodAny], null>, z.ZodType<RehypePlugin, z.ZodTypeDef, RehypePlugin>, z.ZodTuple<[z.ZodType<RehypePlugin, z.ZodTypeDef, RehypePlugin>, z.ZodAny], null>]>, "many">>;
        remarkRehype: z.ZodDefault<z.ZodOptional<z.ZodType<RemarkRehype, z.ZodTypeDef, RemarkRehype>>>;
        gfm: z.ZodDefault<z.ZodBoolean>;
        smartypants: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        drafts: boolean;
        syntaxHighlight: false | "shiki" | "prism";
        shikiConfig: {
            langs: ILanguageRegistration[];
            theme: string | import("shiki").IShikiTheme;
            wrap: boolean | null;
        };
        remarkPlugins: (string | [string, any] | RemarkPlugin | [RemarkPlugin, any])[];
        rehypePlugins: (string | [string, any] | RehypePlugin | [RehypePlugin, any])[];
        remarkRehype: RemarkRehype;
        gfm: boolean;
        smartypants: boolean;
    }, {
        drafts?: boolean | undefined;
        syntaxHighlight?: false | "shiki" | "prism" | undefined;
        shikiConfig?: {
            langs?: ILanguageRegistration[] | undefined;
            theme?: string | import("shiki").IShikiTheme | undefined;
            wrap?: boolean | null | undefined;
        } | undefined;
        remarkPlugins?: (string | [string, any] | RemarkPlugin | [RemarkPlugin, any])[] | undefined;
        rehypePlugins?: (string | [string, any] | RehypePlugin | [RehypePlugin, any])[] | undefined;
        remarkRehype?: RemarkRehype | undefined;
        gfm?: boolean | undefined;
        smartypants?: boolean | undefined;
    }>>;
    output: z.ZodDefault<z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"static">, z.ZodLiteral<"server">]>>>;
    trailingSlash: z.ZodDefault<z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"always">, z.ZodLiteral<"never">, z.ZodLiteral<"ignore">]>>>;
    adapter: z.ZodOptional<z.ZodObject<{
        name: z.ZodString;
        hooks: z.ZodDefault<z.ZodObject<{}, "passthrough", z.ZodTypeAny, {}, {}>>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        hooks: {};
    }, {
        hooks?: {} | undefined;
        name: string;
    }>>;
    integrations: z.ZodEffects<z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        hooks: z.ZodDefault<z.ZodObject<{}, "passthrough", z.ZodTypeAny, {}, {}>>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        hooks: {};
    }, {
        hooks?: {} | undefined;
        name: string;
    }>, "many">>, {
        name: string;
        hooks: {};
    }[], unknown>;
    image: z.ZodDefault<z.ZodObject<{
        service: z.ZodUnion<[z.ZodLiteral<"astro/assets/services/sharp">, z.ZodLiteral<"astro/assets/services/squoosh">, z.ZodString]>;
    }, "strip", z.ZodTypeAny, {
        service: string;
    }, {
        service: string;
    }>>;
    vite: z.ZodDefault<z.ZodType<ViteUserConfig, z.ZodTypeDef, ViteUserConfig>>;
    experimental: z.ZodDefault<z.ZodOptional<z.ZodObject<{
        assets: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        assets: boolean;
    }, {
        assets?: boolean | undefined;
    }>>>;
    legacy: z.ZodDefault<z.ZodOptional<z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>>>;
    root: z.ZodEffects<z.ZodDefault<z.ZodString>, URL, string | undefined>;
    srcDir: z.ZodEffects<z.ZodDefault<z.ZodString>, URL, string | undefined>;
    publicDir: z.ZodEffects<z.ZodDefault<z.ZodString>, URL, string | undefined>;
    outDir: z.ZodEffects<z.ZodDefault<z.ZodString>, URL, string | undefined>;
    build: z.ZodDefault<z.ZodOptional<z.ZodObject<{
        format: z.ZodDefault<z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"file">, z.ZodLiteral<"directory">]>>>;
        client: z.ZodEffects<z.ZodDefault<z.ZodOptional<z.ZodString>>, URL, string | undefined>;
        server: z.ZodEffects<z.ZodDefault<z.ZodOptional<z.ZodString>>, URL, string | undefined>;
        assets: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        assetsPrefix: z.ZodOptional<z.ZodString>;
        serverEntry: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        assetsPrefix?: string | undefined;
        assets: string;
        server: URL;
        format: "file" | "directory";
        client: URL;
        serverEntry: string;
    }, {
        assets?: string | undefined;
        server?: string | undefined;
        format?: "file" | "directory" | undefined;
        client?: string | undefined;
        assetsPrefix?: string | undefined;
        serverEntry?: string | undefined;
    }>>>;
    server: z.ZodEffects<z.ZodDefault<z.ZodOptional<z.ZodObject<{
        host: z.ZodDefault<z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodBoolean]>>>;
        port: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        open: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        headers: z.ZodOptional<z.ZodType<OutgoingHttpHeaders, z.ZodTypeDef, OutgoingHttpHeaders>>;
        streaming: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        headers?: OutgoingHttpHeaders | undefined;
        open: boolean;
        host: string | boolean;
        port: number;
        streaming: boolean;
    }, {
        open?: boolean | undefined;
        host?: string | boolean | undefined;
        port?: number | undefined;
        headers?: OutgoingHttpHeaders | undefined;
        streaming?: boolean | undefined;
    }>>>, {
        headers?: OutgoingHttpHeaders | undefined;
        open: boolean;
        host: string | boolean;
        port: number;
        streaming: boolean;
    }, unknown>;
}, "strip", z.ZodTypeAny, {
    site?: string | undefined;
    adapter?: {
        name: string;
        hooks: {};
    } | undefined;
    base: string;
    markdown: {
        drafts: boolean;
        syntaxHighlight: false | "shiki" | "prism";
        shikiConfig: {
            langs: ILanguageRegistration[];
            theme: string | import("shiki").IShikiTheme;
            wrap: boolean | null;
        };
        remarkPlugins: (string | [string, any] | RemarkPlugin | [RemarkPlugin, any])[];
        rehypePlugins: (string | [string, any] | RehypePlugin | [RehypePlugin, any])[];
        remarkRehype: RemarkRehype;
        gfm: boolean;
        smartypants: boolean;
    };
    output: "static" | "server";
    root: URL;
    srcDir: URL;
    publicDir: URL;
    outDir: URL;
    trailingSlash: "never" | "always" | "ignore";
    server: {
        headers?: OutgoingHttpHeaders | undefined;
        open: boolean;
        host: string | boolean;
        port: number;
        streaming: boolean;
    };
    integrations: {
        name: string;
        hooks: {};
    }[];
    build: {
        assetsPrefix?: string | undefined;
        assets: string;
        server: URL;
        format: "file" | "directory";
        client: URL;
        serverEntry: string;
    };
    image: {
        service: string;
    };
    vite: ViteUserConfig;
    experimental: {
        assets: boolean;
    };
    legacy: {};
}, {
    site?: string | undefined;
    base?: string | undefined;
    markdown?: {
        drafts?: boolean | undefined;
        syntaxHighlight?: false | "shiki" | "prism" | undefined;
        shikiConfig?: {
            langs?: ILanguageRegistration[] | undefined;
            theme?: string | import("shiki").IShikiTheme | undefined;
            wrap?: boolean | null | undefined;
        } | undefined;
        remarkPlugins?: (string | [string, any] | RemarkPlugin | [RemarkPlugin, any])[] | undefined;
        rehypePlugins?: (string | [string, any] | RehypePlugin | [RehypePlugin, any])[] | undefined;
        remarkRehype?: RemarkRehype | undefined;
        gfm?: boolean | undefined;
        smartypants?: boolean | undefined;
    } | undefined;
    output?: "static" | "server" | undefined;
    root?: string | undefined;
    srcDir?: string | undefined;
    publicDir?: string | undefined;
    outDir?: string | undefined;
    trailingSlash?: "never" | "always" | "ignore" | undefined;
    server?: unknown;
    adapter?: {
        hooks?: {} | undefined;
        name: string;
    } | undefined;
    integrations?: unknown;
    build?: {
        assets?: string | undefined;
        server?: string | undefined;
        format?: "file" | "directory" | undefined;
        client?: string | undefined;
        assetsPrefix?: string | undefined;
        serverEntry?: string | undefined;
    } | undefined;
    image?: {
        service: string;
    } | undefined;
    vite?: ViteUserConfig | undefined;
    experimental?: {
        assets?: boolean | undefined;
    } | undefined;
    legacy?: {} | undefined;
}>, {
    site?: string | undefined;
    adapter?: {
        name: string;
        hooks: {};
    } | undefined;
    base: string;
    markdown: {
        drafts: boolean;
        syntaxHighlight: false | "shiki" | "prism";
        shikiConfig: {
            langs: ILanguageRegistration[];
            theme: string | import("shiki").IShikiTheme;
            wrap: boolean | null;
        };
        remarkPlugins: (string | [string, any] | RemarkPlugin | [RemarkPlugin, any])[];
        rehypePlugins: (string | [string, any] | RehypePlugin | [RehypePlugin, any])[];
        remarkRehype: RemarkRehype;
        gfm: boolean;
        smartypants: boolean;
    };
    output: "static" | "server";
    root: URL;
    srcDir: URL;
    publicDir: URL;
    outDir: URL;
    trailingSlash: "never" | "always" | "ignore";
    server: {
        headers?: OutgoingHttpHeaders | undefined;
        open: boolean;
        host: string | boolean;
        port: number;
        streaming: boolean;
    };
    integrations: {
        name: string;
        hooks: {};
    }[];
    build: {
        assetsPrefix?: string | undefined;
        assets: string;
        server: URL;
        format: "file" | "directory";
        client: URL;
        serverEntry: string;
    };
    image: {
        service: string;
    };
    vite: ViteUserConfig;
    experimental: {
        assets: boolean;
    };
    legacy: {};
}, {
    site?: string | undefined;
    base?: string | undefined;
    markdown?: {
        drafts?: boolean | undefined;
        syntaxHighlight?: false | "shiki" | "prism" | undefined;
        shikiConfig?: {
            langs?: ILanguageRegistration[] | undefined;
            theme?: string | import("shiki").IShikiTheme | undefined;
            wrap?: boolean | null | undefined;
        } | undefined;
        remarkPlugins?: (string | [string, any] | RemarkPlugin | [RemarkPlugin, any])[] | undefined;
        rehypePlugins?: (string | [string, any] | RehypePlugin | [RehypePlugin, any])[] | undefined;
        remarkRehype?: RemarkRehype | undefined;
        gfm?: boolean | undefined;
        smartypants?: boolean | undefined;
    } | undefined;
    output?: "static" | "server" | undefined;
    root?: string | undefined;
    srcDir?: string | undefined;
    publicDir?: string | undefined;
    outDir?: string | undefined;
    trailingSlash?: "never" | "always" | "ignore" | undefined;
    server?: unknown;
    adapter?: {
        hooks?: {} | undefined;
        name: string;
    } | undefined;
    integrations?: unknown;
    build?: {
        assets?: string | undefined;
        server?: string | undefined;
        format?: "file" | "directory" | undefined;
        client?: string | undefined;
        assetsPrefix?: string | undefined;
        serverEntry?: string | undefined;
    } | undefined;
    image?: {
        service: string;
    } | undefined;
    vite?: ViteUserConfig | undefined;
    experimental?: {
        assets?: boolean | undefined;
    } | undefined;
    legacy?: {} | undefined;
}>;
