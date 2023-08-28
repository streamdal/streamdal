import type { AstroTelemetry } from '@astrojs/telemetry';
import type { Arguments } from 'yargs-parser';
import type { AstroSettings, PreviewServer } from '../../@types/astro';
import type { LogOptions } from '../logger/core';
interface PreviewOptions {
    logging: LogOptions;
    telemetry: AstroTelemetry;
    flags?: Arguments;
}
/** The primary dev action */
export default function preview(_settings: AstroSettings, { logging, flags }: PreviewOptions): Promise<PreviewServer | undefined>;
export {};
