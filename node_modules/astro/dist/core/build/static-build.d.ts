import { type BuildInternals } from '../../core/build/internal.js';
import type { StaticBuildOptions } from './types';
export declare function viteBuild(opts: StaticBuildOptions): Promise<{
    internals: BuildInternals;
}>;
export declare function staticBuild(opts: StaticBuildOptions, internals: BuildInternals): Promise<void>;
