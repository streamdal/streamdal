import type { SitemapOptions } from './index.js';
export declare const validateOptions: (site: string | undefined, opts: SitemapOptions) => {
    changefreq?: import("sitemap").EnumChangefreq | undefined;
    priority?: number | undefined;
    lastmod?: Date | undefined;
    i18n?: {
        locales: Record<string, string>;
        defaultLocale: string;
    } | undefined;
    filter?: ((args_0: string, ...args_1: unknown[]) => boolean) | undefined;
    customPages?: string[] | undefined;
    canonicalURL?: string | undefined;
    serialize?: ((args_0: any, ...args_1: unknown[]) => any) | undefined;
    entryLimit: number;
};
