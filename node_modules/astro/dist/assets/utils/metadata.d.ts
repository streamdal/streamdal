/// <reference types="node" />
import type { ImageMetadata } from '../types.js';
export interface Metadata extends ImageMetadata {
    orientation?: number;
}
export declare function imageMetadata(src: URL | string, data?: Buffer): Promise<Metadata | undefined>;
