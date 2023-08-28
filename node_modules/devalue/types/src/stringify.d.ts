/**
 * Turn a value into a JSON string that can be parsed with `devalue.parse`
 * @param {any} value
 * @param {Record<string, (value: any) => any>} [reducers]
 */
export function stringify(value: any, reducers?: Record<string, (value: any) => any>): string;
