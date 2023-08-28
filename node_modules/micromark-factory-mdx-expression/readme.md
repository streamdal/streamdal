# micromark-factory-mdx-expression

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][bundle-size-badge]][bundle-size]
[![Sponsors][sponsors-badge]][opencollective]
[![Backers][backers-badge]][opencollective]
[![Chat][chat-badge]][chat]

micromark factory to parse MDX expressions (found in JSX attributes, flow,
text).

## Contents

*   [Install](#install)
*   [Use](#use)
*   [API](#api)
    *   [`factoryMdxExpression(…)`](#factorymdxexpression)
*   [Types](#types)
*   [Security](#security)
*   [Contribute](#contribute)
*   [License](#license)

## Install

This package is [ESM only][esm].
In Node.js (version 12.20+, 14.14+, 16.0+, or 18.0+), install with [npm][]:

```sh
npm install micromark-factory-mdx-expression
```

In Deno with [`esm.sh`][esmsh]:

```js
import {mdxExpression} from 'https://esm.sh/micromark-factory-mdx-expression@1'
```

In browsers with [`esm.sh`][esmsh]:

```html
<script type="module">
  import {mdxExpression} from 'https://esm.sh/micromark-factory-mdx-expression@1?bundle'
</script>
```

## Use

```js
import {ok as assert} from 'uvu/assert'
import {factoryMdxExpression} from 'micromark-factory-mdx-expression'
import {codes} from 'micromark-util-symbol/codes'

// A micromark tokenizer that uses the factory:
/** @type {Tokenizer} */
function tokenizeFlowExpression(effects, ok, nok) {
  return start

  // …

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

  // …
}
```

## API

This module exports the identifiers `factoryMdxExpression`.
There is no default export.

The export map supports the endorsed [`development` condition][condition].
Run `node --conditions development module.js` to get instrumented dev code.
Without this condition, production code is loaded.

### `factoryMdxExpression(…)`

###### Parameters

*   `effects` (`Effects`) — Context
*   `ok` (`State`) — State switched to when successful
*   `type` (`string`) — Token type for whole (`{}`)
*   `markerType` (`string`) — Token type for the markers (`{`, `}`)
*   `chunkType` (`string`) — Token type for the value (`1`)
*   `acorn` (`Acorn`) — Object with `acorn.parse` and `acorn.parseExpressionAt`
*   `acornOptions` ([`AcornOptions`][acorn-options]) — Configuration for acorn
*   `boolean` (`addResult`, default: `false`) — Add `estree` to token
*   `boolean` (`spread`, default: `false`) — Support a spread (`{...a}`) only
*   `boolean` (`allowEmpty`, default: `false`) — Support an empty expression
*   `boolean` (`allowLazy`, default: `false`) — Support lazy continuation of an
    expression
*   `number` (`startColumn`, default: `0`) — Treat whitespace up to this number
    and a tab size as indent

###### Returns

`State`.

###### Examples

See [`micromark-extension-mdx-expression`][extension]

## Types

This package is fully typed with [TypeScript][].
It exports the additional types `Acorn` and `AcornOptions`.

## Security

See [`security.md`][securitymd] in [`micromark/.github`][health] for how to
submit a security report.

## Contribute

See [`contributing.md`][contributing] in [`micromark/.github`][health] for ways
to get started.
See [`support.md`][support] for ways to get help.

This project has a [code of conduct][coc].
By interacting with this repository, organisation, or community you agree to
abide by its terms.

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[build-badge]: https://github.com/micromark/micromark-extension-mdx-expression/workflows/main/badge.svg

[build]: https://github.com/micromark/micromark-extension-mdx-expression/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/micromark/micromark-extension-mdx-expression.svg

[coverage]: https://codecov.io/github/micromark/micromark-extension-mdx-expression

[downloads-badge]: https://img.shields.io/npm/dm/micromark-factory-mdx-expression.svg

[downloads]: https://www.npmjs.com/package/micromark-factory-mdx-expression

[bundle-size-badge]: https://img.shields.io/bundlephobia/minzip/micromark-factory-mdx-expression.svg

[bundle-size]: https://bundlephobia.com/result?p=micromark-factory-mdx-expression

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[opencollective]: https://opencollective.com/unified

[npm]: https://docs.npmjs.com/cli/install

[esmsh]: https://esm.sh

[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg

[chat]: https://github.com/micromark/micromark/discussions

[license]: https://github.com/micromark/micromark-extension-mdx-expression/blob/main/license

[author]: https://wooorm.com

[health]: https://github.com/micromark/.github

[securitymd]: https://github.com/micromark/.github/blob/HEAD/security.md

[contributing]: https://github.com/micromark/.github/blob/HEAD/contributing.md

[support]: https://github.com/micromark/.github/blob/HEAD/support.md

[coc]: https://github.com/micromark/.github/blob/HEAD/code-of-conduct.md

[esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[typescript]: https://www.typescriptlang.org

[condition]: https://nodejs.org/api/packages.html#packages_resolving_user_conditions

[acorn-options]: https://github.com/acornjs/acorn/tree/master/acorn#interface

[extension]: https://github.com/micromark/micromark-extension-mdx-expression
