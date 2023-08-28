/// <reference types="node" />
/// <reference types="node" />
import type { WorkerOptions, WorkerParseResult, WorkerProcessResult } from './types';
export declare const performSyncWork: ((options: Omit<WorkerOptions, 'process'>) => WorkerParseResult) & ((options: WorkerOptions & {
    process: true;
}) => WorkerProcessResult);
