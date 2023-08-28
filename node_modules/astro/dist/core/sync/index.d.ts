/// <reference types="node" />
import type fsMod from 'node:fs';
import type { Arguments } from 'yargs-parser';
import type { AstroSettings } from '../../@types/astro';
import { type LogOptions } from '../logger/core.js';
export type ProcessExit = 0 | 1;
export type SyncOptions = {
    logging: LogOptions;
    fs: typeof fsMod;
};
export declare function syncCli(settings: AstroSettings, { logging, fs, flags }: {
    logging: LogOptions;
    fs: typeof fsMod;
    flags?: Arguments;
}): Promise<ProcessExit>;
/**
 * Generate content collection types, and then returns the process exit signal.
 *
 * A non-zero process signal is emitted in case there's an error while generating content collection types.
 *
 * @param {SyncOptions} options
 * @param {AstroSettings} settings Astro settings
 * @param {typeof fsMod} options.fs The file system
 * @param {LogOptions} options.logging Logging options
 * @return {Promise<ProcessExit>}
 */
export declare function sync(settings: AstroSettings, { logging, fs }: SyncOptions): Promise<ProcessExit>;
