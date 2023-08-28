import type { AstroTelemetry } from '@astrojs/telemetry';
import type { AstroSettings, RuntimeMode } from '../../@types/astro';
import type { LogOptions } from '../logger/core';
import type yargs from 'yargs-parser';
export interface BuildOptions {
    mode?: RuntimeMode;
    logging: LogOptions;
    telemetry: AstroTelemetry;
    /**
     * Teardown the compiler WASM instance after build. This can improve performance when
     * building once, but may cause a performance hit if building multiple times in a row.
     */
    teardownCompiler?: boolean;
    flags?: yargs.Arguments;
}
/** `astro build` */
export default function build(settings: AstroSettings, options: BuildOptions): Promise<void>;
