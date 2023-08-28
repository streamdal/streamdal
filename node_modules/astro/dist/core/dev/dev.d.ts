/// <reference types="node" />
/// <reference types="node" />
import type { AstroTelemetry } from '@astrojs/telemetry';
import type http from 'http';
import type { AddressInfo } from 'net';
import type * as vite from 'vite';
import type yargs from 'yargs-parser';
import type { AstroSettings } from '../../@types/astro';
import { type LogOptions } from '../logger/core.js';
export interface DevOptions {
    configFlag: string | undefined;
    configFlagPath: string | undefined;
    flags?: yargs.Arguments;
    logging: LogOptions;
    telemetry: AstroTelemetry;
    handleConfigError: (error: Error) => void;
    isRestart?: boolean;
}
export interface DevServer {
    address: AddressInfo;
    handle: (req: http.IncomingMessage, res: http.ServerResponse<http.IncomingMessage>) => void;
    watcher: vite.FSWatcher;
    stop(): Promise<void>;
}
/** `astro dev` */
export default function dev(settings: AstroSettings, options: DevOptions): Promise<DevServer | undefined>;
