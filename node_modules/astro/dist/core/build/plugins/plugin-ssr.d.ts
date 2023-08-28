import type { Plugin as VitePlugin } from 'vite';
import type { AstroAdapter } from '../../../@types/astro';
import type { BuildInternals } from '../internal.js';
import type { StaticBuildOptions } from '../types';
import type { AstroBuildPlugin } from '../plugin';
export declare const virtualModuleId = "@astrojs-ssr-virtual-entry";
export declare function vitePluginSSR(internals: BuildInternals, adapter: AstroAdapter): VitePlugin;
export declare function injectManifest(buildOpts: StaticBuildOptions, internals: BuildInternals): Promise<string>;
export declare function pluginSSR(options: StaticBuildOptions, internals: BuildInternals): AstroBuildPlugin;
