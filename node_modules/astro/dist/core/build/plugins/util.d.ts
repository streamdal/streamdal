import type { Plugin as VitePlugin } from 'vite';
type OutputOptionsHook = Extract<VitePlugin['outputOptions'], Function>;
type OutputOptions = Parameters<OutputOptionsHook>[0];
type ExtendManualChunksHooks = {
    before?: (id: string, meta: any) => string | undefined;
    after?: (id: string, meta: any) => string | undefined;
};
export declare function extendManualChunks(outputOptions: OutputOptions, hooks: ExtendManualChunksHooks): void;
export {};
