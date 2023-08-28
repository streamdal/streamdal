import { type Plugin as VitePlugin } from 'vite';
import type { BuildInternals } from '../internal';
import type { AstroBuildPlugin } from '../plugin';
import type { StaticBuildOptions } from '../types';
interface PluginOptions {
    internals: BuildInternals;
    buildOptions: StaticBuildOptions;
    target: 'client' | 'server';
}
export declare function rollupPluginAstroBuildCSS(options: PluginOptions): VitePlugin[];
export declare function pluginCSS(options: StaticBuildOptions, internals: BuildInternals): AstroBuildPlugin;
export {};
