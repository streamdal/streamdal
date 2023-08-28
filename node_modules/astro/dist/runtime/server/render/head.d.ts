import type { SSRResult } from '../../../@types/astro';
export declare function renderAllHeadContent(result: SSRResult): any;
export declare function renderHead(result: SSRResult): Generator<{
    readonly type: "head";
    readonly result: SSRResult;
}, void, unknown>;
export declare function maybeRenderHead(result: SSRResult): Generator<{
    readonly type: "maybe-head";
    readonly result: SSRResult;
    readonly scope: number;
}, void, unknown>;
