import type { FrozenProcessor } from 'unified';
export declare const processorCache: Map<string, FrozenProcessor<void, void, void, void>>;
export declare const getRemarkProcessor: (searchFrom: string, isMdx: boolean, ignoreRemarkConfig?: boolean) => Promise<FrozenProcessor<void, void, void, void>>;
