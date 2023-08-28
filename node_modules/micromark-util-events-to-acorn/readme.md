# micromark-util-events-to-acorn

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][bundle-size-badge]][bundle-size]
[![Sponsors][sponsors-badge]][opencollective]
[![Backers][backers-badge]][opencollective]
[![Chat][chat-badge]][chat]

micromark utility to try and parse events w/ acorn.

## Contents

*   [Install](#install)
*   [Use](#use)
*   [API](#api)
    *   [`eventsToAcorn(events, options)`](#eventstoacornevents-options)
*   [Types](#types)
*   [Security](#security)
*   [Contribute](#contribute)
*   [License](#license)

## Install

This package is [ESM only][esm].
In Node.js (version 12.20+, 14.14+, 16.0+, or 18.0+), install with [npm][]:

```sh
npm install micromark-util-events-to-acorn
```

In Deno with [`esm.sh`][esmsh]:

```js
import {mdxExpression} from 'https://esm.sh/micromark-util-events-to-acorn@1'
```

In browsers with [`esm.sh`][esmsh]:

```html
<script type="module">
  import {mdxExpression} from 'https://esm.sh/micromark-util-events-to-acorn@1?bundle'
</script>
```

## Use

```js
import {eventsToAcorn} from 'micromark-util-events-to-acorn'

// A factory that uses the utility:
/** @type {Tokenizer} */
function factoryMdxExpression(effects, ok, nok) {
  return start

  // …

  /** @type {State} */
  atClosingBrace(code) {
    // …

    // Gnostic mode: parse w/ acorn.
    const result = eventsToAcorn(
      self.events.slice(eventStart),
      acorn,
      acornOptions,
      {
        start: startPosition,
        expression: true,
        allowEmpty,
        prefix: spread ? '({' : '',
        suffix: spread ? '})' : ''
      }
    )

    // …
  }

  // …
}
```

## API

This module exports the identifier `eventsToAcorn`.
There is no default export.

The export map supports the endorsed [`development` condition][condition].
Run `node --conditions development module.js` to get instrumented dev code.
Without this condition, production code is loaded.

### `eventsToAcorn(events, options)`

###### Parameters

*   `events` (`Array<Event>`)
    — events
*   `options.acorn` (`Acorn`, required)
    — object with `acorn.parse` and
    `acorn.parseExpressionAt`
*   `options.acornOptions` ([`AcornOptions`][acorn-options])
    — configuration for acorn
*   `options.start` (`Point`, optional)
    — place where events start
*   `options.prefix` (`string`, default: `''`)
    — text to place before events
*   `options.suffix` (`string`, default: `''`)
    — text to place after events
*   `options.expression` (`boolean`, default: `false`)
    — whether this is a program or expression
*   `options.allowEmpty` (`boolean`, default: `false`)
    — whether an empty expression is allowed (programs are always allowed to
    be empty)

###### Returns

*   `estree` ([`Program?`][program])
    — estree node
*   `error` (`Error?`)
    — error if unparseable
*   `swallow` (`boolean`)
    — whether the error, if there is one, can be swallowed and more JavaScript
    could be valid

## Types

This package is fully typed with [TypeScript][].
It exports the additional types `Acorn`, `AcornOptions`, `Options`, `Point`,
and `Program`.

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

[downloads-badge]: https://img.shields.io/npm/dm/micromark-util-events-to-acorn.svg

[downloads]: https://www.npmjs.com/package/micromark-util-events-to-acorn

[bundle-size-badge]: https://img.shields.io/bundlephobia/minzip/micromark-util-events-to-acorn.svg

[bundle-size]: https://bundlephobia.com/result?p=micromark-util-events-to-acorn

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

[program]: https://github.com/estree/estree/blob/master/es2015.md#programs

[acorn-options]: https://github.com/acornjs/acorn/tree/master/acorn#interface
