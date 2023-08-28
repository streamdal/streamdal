/// <reference types="node" />
import type { LogOptions } from '../../logger/core';
import type { SSROptions } from '../../render/dev';
export declare function call(options: SSROptions, logging: LogOptions): Promise<{
    type: "simple";
    body: string;
    encoding?: BufferEncoding | undefined;
    cookies: import("../../cookies/cookies").AstroCookies;
} | {
    type: "response";
    response: Response;
}>;
