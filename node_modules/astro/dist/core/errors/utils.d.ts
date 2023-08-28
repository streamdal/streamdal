import type { DiagnosticCode } from '@astrojs/compiler/shared/diagnostics.js';
import { type AstroErrorCodes, type ErrorData } from './errors-data.js';
/**
 * Get the line and character based on the offset
 * @param offset The index of the position
 * @param text The text for which the position should be retrieved
 */
export declare function positionAt(offset: number, text: string): {
    line: number;
    column: number;
};
/** Coalesce any throw variable to an Error instance. */
export declare function createSafeError(err: any): Error;
export declare function normalizeLF(code: string): string;
export declare function getErrorDataByCode(code: AstroErrorCodes | DiagnosticCode): {
    name: string;
    data: ErrorData;
} | undefined;
