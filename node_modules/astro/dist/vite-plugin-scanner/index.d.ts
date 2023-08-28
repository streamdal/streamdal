import { type Plugin as VitePlugin } from 'vite';
import type { AstroSettings } from '../@types/astro.js';
export default function astroScannerPlugin({ settings }: {
    settings: AstroSettings;
}): VitePlugin;
