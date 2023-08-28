/**
 * Turn a value into the JavaScript that creates an equivalent value
 * @param {any} value
 * @param {(value: any) => string | void} [replacer]
 */
export function uneval(value: any, replacer?: (value: any) => string | void): string;
