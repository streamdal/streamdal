import type { ModuleLoader } from '../../module-loader/index';
export declare function createResolve(loader: ModuleLoader, root: URL): (s: string) => Promise<string>;
