import type { AstroRenderer, SSRLoadedRenderer } from '../../@types/astro';
export type RendererServerEntrypointModule = {
    default: SSRLoadedRenderer['ssr'];
};
export type MaybeRendererServerEntrypointModule = Partial<RendererServerEntrypointModule>;
export type RendererLoader = (entryPoint: string) => Promise<MaybeRendererServerEntrypointModule>;
export declare function loadRenderer(renderer: AstroRenderer, loader: RendererLoader): Promise<SSRLoadedRenderer | undefined>;
export declare function filterFoundRenderers(renderers: Array<SSRLoadedRenderer | undefined>): SSRLoadedRenderer[];
export declare function createLoadedRenderer(renderer: AstroRenderer, mod: RendererServerEntrypointModule): SSRLoadedRenderer;
