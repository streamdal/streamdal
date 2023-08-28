import type { AstroSettings } from '../../@types/astro';
import { type Metadata } from './metadata.js';
export declare function emitESMImage(id: string | undefined, watchMode: boolean, fileEmitter: any, settings: Pick<AstroSettings, 'config'>): Promise<Metadata | undefined>;
export declare function emoji(char: string, fallback: string): string;
