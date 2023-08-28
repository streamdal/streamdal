/**
 * @this {TokenizeContext}
 * @param {Effects} effects
 * @param {State} ok
 * @param {string} type
 * @param {string} markerType
 * @param {string} chunkType
 * @param {Acorn | null | undefined} [acorn]
 * @param {AcornOptions | null | undefined} [acornOptions]
 * @param {boolean | null | undefined} [addResult=false]
 * @param {boolean | null | undefined} [spread=false]
 * @param {boolean | null | undefined} [allowEmpty=false]
 * @param {boolean | null | undefined} [allowLazy=false]
 * @param {number | null | undefined} [startColumn=0]
 * @returns {State}
 */
export function factoryMdxExpression(
  this: import('micromark-util-types').TokenizeContext,
  effects: Effects,
  ok: State,
  type: string,
  markerType: string,
  chunkType: string,
  acorn?: Acorn | null | undefined,
  acornOptions?: AcornOptions | null | undefined,
  addResult?: boolean | null | undefined,
  spread?: boolean | null | undefined,
  allowEmpty?: boolean | null | undefined,
  allowLazy?: boolean | null | undefined,
  startColumn?: number | null | undefined
): State
export type Point = import('micromark-util-types').Point
export type TokenizeContext = import('micromark-util-types').TokenizeContext
export type Effects = import('micromark-util-types').Effects
export type State = import('micromark-util-types').State
export type Acorn = import('micromark-util-events-to-acorn').Acorn
export type AcornOptions = import('micromark-util-events-to-acorn').AcornOptions
