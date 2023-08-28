import type { SSRResult } from '../../@types/astro';
export declare function determineIfNeedsHydrationScript(result: SSRResult): boolean;
export declare const hydrationScripts: Record<string, string>;
export declare function determinesIfNeedsDirectiveScript(result: SSRResult, directive: string): boolean;
export type PrescriptType = null | 'both' | 'directive';
export declare function getPrescripts(type: PrescriptType, directive: string): string;
