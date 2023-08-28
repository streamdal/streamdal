/// <reference types="node" />
import { AstroCheck } from '@astrojs/language-server';
import fs from 'fs';
import type { Arguments as Flags } from 'yargs-parser';
import type { AstroSettings } from '../../@types/astro';
import type { LogOptions } from '../../core/logger/core.js';
import type { ProcessExit, SyncOptions } from '../../core/sync';
export type CheckPayload = {
    /**
     * Flags passed via CLI
     */
    flags: Flags;
    /**
     * Logging options
     */
    logging: LogOptions;
};
/**
 *
 * Types of response emitted by the checker
 */
export declare enum CheckResult {
    /**
     * Operation finished without errors
     */
    ExitWithSuccess = 0,
    /**
     * Operation finished with errors
     */
    ExitWithError = 1,
    /**
     * The consumer should not terminate the operation
     */
    Listen = 2
}
/**
 * Checks `.astro` files for possible errors.
 *
 * If the `--watch` flag is provided, the command runs indefinitely and provides diagnostics
 * when `.astro` files are modified.
 *
 * Every time an astro files is modified, content collections are also generated.
 *
 * @param {AstroSettings} settings
 * @param {CheckPayload} options Options passed {@link AstroChecker}
 * @param {Flags} options.flags Flags coming from the CLI
 * @param {LogOptions} options.logging Logging options
 */
export declare function check(settings: AstroSettings, { logging, flags }: CheckPayload): Promise<AstroChecker | undefined>;
type CheckerConstructor = {
    diagnosticChecker: AstroCheck;
    isWatchMode: boolean;
    syncCli: (settings: AstroSettings, options: SyncOptions) => Promise<ProcessExit>;
    settings: Readonly<AstroSettings>;
    logging: Readonly<LogOptions>;
    fileSystem: typeof fs;
};
/**
 * Responsible to check files - classic or watch mode - and report diagnostics.
 *
 * When in watch mode, the class does a whole check pass, and then starts watching files.
 * When a change occurs to an `.astro` file, the checker builds content collections again and lint all the `.astro` files.
 */
export declare class AstroChecker {
    #private;
    constructor({ diagnosticChecker, isWatchMode, syncCli, settings, fileSystem, logging, }: CheckerConstructor);
    /**
     * Check all `.astro` files once and then finishes the operation.
     */
    check(): Promise<CheckResult>;
    /**
     * Check all `.astro` files and then start watching for changes.
     */
    watch(): Promise<CheckResult>;
    /**
     * Stops the watch. It terminates the inner server.
     */
    stop(): Promise<void>;
    /**
     * Whether the checker should run in watch mode
     */
    get isWatchMode(): boolean;
}
export {};
