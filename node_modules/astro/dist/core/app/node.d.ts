/// <reference types="node" />
import type { RouteData } from '../../@types/astro';
import type { SSRManifest } from './types';
import { IncomingMessage } from 'http';
import { App, type MatchOptions } from './index.js';
declare class NodeIncomingMessage extends IncomingMessage {
    /**
     * The read-only body property of the Request interface contains a ReadableStream with the body contents that have been added to the request.
     */
    body?: any | undefined;
}
export declare class NodeApp extends App {
    match(req: NodeIncomingMessage | Request, opts?: MatchOptions): RouteData | undefined;
    render(req: NodeIncomingMessage | Request, routeData?: RouteData): Promise<Response>;
}
export declare function loadManifest(rootFolder: URL): Promise<SSRManifest>;
export declare function loadApp(rootFolder: URL): Promise<NodeApp>;
export {};
