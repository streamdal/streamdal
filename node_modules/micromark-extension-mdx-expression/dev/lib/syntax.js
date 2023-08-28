/**
 * @typedef {import('micromark-util-types').Extension} Extension
 * @typedef {import('micromark-util-types').Tokenizer} Tokenizer
 * @typedef {import('micromark-util-types').State} State
 * @typedef {import('micromark-util-types').TokenizeContext} TokenizeContext
 * @typedef {import('micromark-util-events-to-acorn').Acorn} Acorn
 * @typedef {import('micromark-util-events-to-acorn').AcornOptions} AcornOptions
 *
 * @typedef Options
 *   Configuration (optional).
 * @property {Acorn | null | undefined} [acorn]
 *   Acorn parser to use (optional).
 * @property {AcornOptions | null | undefined} [acornOptions]
 *   Options to pass to acorn (default: `{ecmaVersion: 2020, locations: true,
 *   sourceType: 'module'}`).
 *   All fields (except for `locations`) can be set.
 * @property {boolean | null | undefined} [addResult=false]
 *   Whether to add an `estree` field to `mdxFlowExpression` and
 *   `mdxTextExpression` tokens with results from acorn.
 * @property {boolean | null | undefined} [spread=false]
 *   Undocumented option to parse only a spread (used by
 *   `micromark-extension-mdx-jsx` to parse spread attributes).
 * @property {boolean | null | undefined} [allowEmpty=true]
 *   Undocumented option to disallow empty attributes (used by
 *   `micromark-extension-mdx-jsx` to prohobit empty attribute values).
 */

import {ok as assert} from 'uvu/assert'
import {factoryMdxExpression} from 'micromark-factory-mdx-expression'
import {factorySpace} from 'micromark-factory-space'
import {markdownLineEnding} from 'micromark-util-character'
import {codes} from 'micromark-util-symbol/codes.js'
import {types} from 'micromark-util-symbol/types.js'

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
export function mdxExpression(options) {
  const options_ = options || {}
  const addResult = options_.addResult
  const acorn = options_.acorn
  // Hidden: `micromark-extension-mdx-jsx` supports expressions in tags,
  // and one of them is only “spread” elements.
  // It also has expressions that are not allowed to be empty (`<x y={}/>`).
  // Instead of duplicating code there, this are two small hidden feature here
  // to test that behavior.
  const spread = options_.spread
  let allowEmpty = options_.allowEmpty
  /** @type {AcornOptions} */
  let acornOptions

  if (allowEmpty === null || allowEmpty === undefined) {
    allowEmpty = true
  }

  if (acorn) {
    if (!acorn.parseExpressionAt) {
      throw new Error(
        'Expected a proper `acorn` instance passed in as `options.acorn`'
      )
    }

    acornOptions = Object.assign(
      {ecmaVersion: 2020, sourceType: 'module'},
      options_.acornOptions
    )
  } else if (options_.acornOptions || options_.addResult) {
    throw new Error('Expected an `acorn` instance passed in as `options.acorn`')
  }

  return {
    flow: {
      [codes.leftCurlyBrace]: {tokenize: tokenizeFlowExpression, concrete: true}
    },
    text: {[codes.leftCurlyBrace]: {tokenize: tokenizeTextExpression}}
  }

  /**
   * @this {TokenizeContext}
   * @type {Tokenizer}
   */
  function tokenizeFlowExpression(effects, ok, nok) {
    const self = this

    return start

    /** @type {State} */
    function start(code) {
      assert(code === codes.leftCurlyBrace, 'expected `{`')
      return factoryMdxExpression.call(
        self,
        effects,
        factorySpace(effects, after, types.whitespace),
        'mdxFlowExpression',
        'mdxFlowExpressionMarker',
        'mdxFlowExpressionChunk',
        acorn,
        acornOptions,
        addResult,
        spread,
        allowEmpty
      )(code)
    }

    /** @type {State} */
    function after(code) {
      return code === codes.eof || markdownLineEnding(code)
        ? ok(code)
        : nok(code)
    }
  }

  /**
   * @this {TokenizeContext}
   * @type {Tokenizer}
   */
  function tokenizeTextExpression(effects, ok) {
    const self = this

    return start

    /** @type {State} */
    function start(code) {
      assert(code === codes.leftCurlyBrace, 'expected `{`')
      return factoryMdxExpression.call(
        self,
        effects,
        ok,
        'mdxTextExpression',
        'mdxTextExpressionMarker',
        'mdxTextExpressionChunk',
        acorn,
        acornOptions,
        addResult,
        spread,
        allowEmpty,
        true
      )(code)
    }
  }
}
