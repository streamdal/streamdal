/**
 * Add support for MDX expressions.
 *
 * Function called optionally with options to get a syntax extension for
 * micromark.
 *
 * @param {Options | null | undefined} [options]
 *   Configuration (optional).
 * @returns {Extension}
 *   Syntax extension for micromark (passed in `extensions`).
 */
export function mdxExpression(options?: Options | null | undefined): Extension
export type Extension = import('micromark-util-types').Extension
export type Tokenizer = import('micromark-util-types').Tokenizer
export type State = import('micromark-util-types').State
export type TokenizeContext = import('micromark-util-types').TokenizeContext
export type Acorn = import('micromark-util-events-to-acorn').Acorn
export type AcornOptions = import('micromark-util-events-to-acorn').AcornOptions
/**
 * Configuration (optional).
 */
export type Options = {
  /**
   * Acorn parser to use (optional).
   */
  acorn?: Acorn | null | undefined
  /**
   * Options to pass to acorn (default: `{ecmaVersion: 2020, locations: true,
   * sourceType: 'module'}`).
   * All fields (except for `locations`) can be set.
   */
  acornOptions?: AcornOptions | null | undefined
  /**
   * Whether to add an `estree` field to `mdxFlowExpression` and
   * `mdxTextExpression` tokens with results from acorn.
   */
  addResult?: boolean | null | undefined
  /**
   * Undocumented option to parse only a spread (used by
   * `micromark-extension-mdx-jsx` to parse spread attributes).
   */
  spread?: boolean | null | undefined
  /**
   * Undocumented option to disallow empty attributes (used by
   * `micromark-extension-mdx-jsx` to prohobit empty attribute values).
   */
  allowEmpty?: boolean | null | undefined
}
