/**
 * Revive a value serialized with `devalue.stringify`
 * @param {string} serialized
 * @param {Record<string, (value: any) => any>} [revivers]
 */
export function parse(serialized: string, revivers?: Record<string, (value: any) => any>): any;
/**
 * Revive a value flattened with `devalue.stringify`
 * @param {number | any[]} parsed
 * @param {Record<string, (value: any) => any>} [revivers]
 */
export function unflatten(parsed: number | any[], revivers?: Record<string, (value: any) => any>): any;
