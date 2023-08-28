/// <reference types="node" />
import type http from 'http';
import type { AstroSettings } from '../../@types/astro';
import type { LogOptions } from '../logger/core';
export interface PreviewServer {
    host?: string;
    port: number;
    server: http.Server;
    closed(): Promise<void>;
    stop(): Promise<void>;
}
export default function createStaticPreviewServer(settings: AstroSettings, logging: LogOptions): Promise<PreviewServer>;
