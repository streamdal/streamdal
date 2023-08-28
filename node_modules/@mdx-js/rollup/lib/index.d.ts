/**
 * Compile MDX w/ rollup.
 *
 * @param {Options | null | undefined} [options]
 *   Configuration.
 * @return {Plugin}
 *   Rollup plugin.
 */
export function rollup(options?: Options | null | undefined): Plugin;
export type FilterPattern = import('@rollup/pluginutils').FilterPattern;
export type Plugin = import('rollup').Plugin;
export type SourceDescription = import('rollup').SourceDescription;
/**
 * Default configuration.
 */
export type CompileOptions = Omit<import('@mdx-js/mdx').CompileOptions, 'SourceMapGenerator'>;
/**
 * Extra configuration.
 */
export type RollupPluginOptions = {
    /**
     * List of picomatch patterns to include
     */
    include?: import("@rollup/pluginutils").FilterPattern | undefined;
    /**
     * List of picomatch patterns to exclude
     */
    exclude?: import("@rollup/pluginutils").FilterPattern | undefined;
};
/**
 * Configuration.
 */
export type Options = CompileOptions & RollupPluginOptions;
