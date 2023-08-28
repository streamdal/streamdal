import type { Linter } from 'eslint';
import type { ProcessorOptions } from './types';
export declare const processorOptions: ProcessorOptions;
export interface LinterConfig extends Linter.Config {
    extractConfig?(filename?: string): Linter.Config;
}
