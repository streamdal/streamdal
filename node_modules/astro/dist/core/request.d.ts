/// <reference types="node" />
import type { IncomingHttpHeaders } from 'http';
import type { LogOptions } from './logger/core';
type HeaderType = Headers | Record<string, any> | IncomingHttpHeaders;
type RequestBody = ArrayBuffer | Blob | ReadableStream | URLSearchParams | FormData;
export interface CreateRequestOptions {
    url: URL | string;
    clientAddress?: string | undefined;
    headers: HeaderType;
    method?: string;
    body?: RequestBody | undefined;
    logging: LogOptions;
    ssr: boolean;
}
export declare function createRequest({ url, headers, clientAddress, method, body, logging, ssr, }: CreateRequestOptions): Request;
export {};
