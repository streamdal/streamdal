import type { SSRResult } from '../../../@types/astro';
import type { ModuleLoader } from '../../module-loader/index';
export declare function getComponentMetadata(filePath: URL, loader: ModuleLoader): Promise<SSRResult['componentMetadata']>;
