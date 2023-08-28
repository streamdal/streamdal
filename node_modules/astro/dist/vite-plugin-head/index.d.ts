import type * as vite from 'vite';
import type { AstroSettings } from '../@types/astro';
import type { AstroBuildPlugin } from '../core/build/plugin.js';
import type { StaticBuildOptions } from '../core/build/types';
import type { BuildInternals } from '../core/build/internal.js';
export default function configHeadVitePlugin({ settings, }: {
    settings: AstroSettings;
}): vite.Plugin;
export declare function astroHeadBuildPlugin(options: StaticBuildOptions, internals: BuildInternals): AstroBuildPlugin;
