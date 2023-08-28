/// <reference types="node" />
import type { AstroConfig, EndpointHandler } from '../../@types/astro';
import type { Environment, RenderContext } from '../render/index';
import { AstroCookies } from '../cookies/index.js';
import { type LogOptions } from '../logger/core.js';
type EndpointCallResult = {
    type: 'simple';
    body: string;
    encoding?: BufferEncoding;
    cookies: AstroCookies;
} | {
    type: 'response';
    response: Response;
};
export declare function call(mod: EndpointHandler, env: Environment, ctx: RenderContext, logging: LogOptions): Promise<EndpointCallResult>;
export declare function throwIfRedirectNotAllowed(response: Response, config: AstroConfig): void;
export {};
