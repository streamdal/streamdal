import type { Plugin as VitePlugin } from 'vite';
import type { AstroBuildPlugin } from '../plugin';
import type { StaticBuildOptions } from '../types';
import { type BuildInternals } from '../internal.js';
export declare function vitePluginPages(opts: StaticBuildOptions, internals: BuildInternals): VitePlugin;
export declare function pluginPages(opts: StaticBuildOptions, internals: BuildInternals): AstroBuildPlugin;
