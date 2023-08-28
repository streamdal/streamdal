<p align="center">
  <a href="https://eslint.org">
    <img src="https://eslint.org/icon.svg" height="50">
  </a>
  <a href="#readme">
    <img src="https://rx-ts.github.io/assets/heart.svg" height="50">
  </a>
  <a href="https://github.com/mdx-js/mdx">
    <img src="https://mdx-logo.now.sh"  height="50">
  </a>
</p>

[![GitHub Actions](https://github.com/mdx-js/eslint-mdx/workflows/CI/badge.svg)](https://github.com/mdx-js/eslint-mdx/actions/workflows/ci.yml)
[![Codecov](https://img.shields.io/codecov/c/gh/mdx-js/eslint-mdx)](https://codecov.io/gh/mdx-js/eslint-mdx)
[![type-coverage](https://img.shields.io/badge/dynamic/json.svg?label=type-coverage&prefix=%E2%89%A5&suffix=%&query=$.typeCoverage.atLeast&uri=https%3A%2F%2Fraw.githubusercontent.com%2Fmdx-js%2Feslint-mdx%2Fmaster%2Fpackage.json)](https://github.com/plantain-00/type-coverage)
[![GitHub release](https://img.shields.io/github/release/mdx-js/eslint-mdx)](https://github.com/mdx-js/eslint-mdx/releases)

[![Renovate enabled](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com)
[![Conventional Commits](https://img.shields.io/badge/conventional%20commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![changesets](https://img.shields.io/badge/maintained%20with-changesets-176de3.svg)](https://github.com/changesets/changesets)

> [ESLint][] Parser/Plugin for [MDX][], helps you lint all ES syntaxes.
> Linting `code` blocks can be enabled with `mdx/code-blocks` setting too!
> Work perfectly with `eslint-plugin-import`, `eslint-plugin-prettier` or any other eslint plugins.
> And also can be integrated with [remark-lint][] plugins to lint markdown syntaxes.

## TOC <!-- omit in toc -->

- [VSCode Extension](#vscode-extension)
- [Packages](#packages)
- [Install](#install)
- [Notice](#notice)
- [Usage](#usage)
- [Parser Options](#parser-options)
- [Rules](#rules)
  - [mdx/remark](#mdxremark)
- [Prettier Integration](#prettier-integration)
- [Sponsors](#sponsors)
- [Backers](#backers)
- [Changelog](#changelog)
- [License](#license)

## VSCode Extension

[![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/unifiedjs.vscode-mdx)](https://marketplace.visualstudio.com/items?itemName=unifiedjs.vscode-mdx)

[VSCode MDX][]\: Integrates with [VSCode ESLint][], syntaxes highlighting and error reporting.

## Packages

This repository is a monorepo managed by [Lerna][] what means we actually publish several packages to npm from same codebase, including:

| Package                                            | Description                                    | Version                                                                                                       |
| -------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| [`eslint-mdx`](/packages/eslint-mdx)               | ESLint Parser for MDX                          | [![npm](https://img.shields.io/npm/v/eslint-mdx.svg)](https://www.npmjs.com/package/eslint-mdx)               |
| [`eslint-plugin-mdx`](/packages/eslint-plugin-mdx) | ESLint Plugin, Configuration and Rules for MDX | [![npm](https://img.shields.io/npm/v/eslint-plugin-mdx.svg)](https://www.npmjs.com/package/eslint-plugin-mdx) |

## Install

```sh
# yarn
yarn add -D eslint-plugin-mdx

# npm
npm i -D eslint-plugin-mdx
```

## Notice

If you're using multi languages, `js/jsx/ts/tsx/vue`, etc for example, you'd better to always use [`overrides`](https://eslint.org/docs/user-guide/configuring/configuration-files#how-do-overrides-work) feature of ESLint, because configs may be overridden by following configs.

See [#251](https://github.com/mdx-js/eslint-mdx/issues/251#issuecomment-736139224) for more details.

## Usage

1. In your ESLint 8+ config file, just add:

   ```jsonc
   {
     "extends": ["plugin:mdx/recommended"],
     // optional, if you want to lint code blocks at the same time
     "settings": {
       "mdx/code-blocks": true,
       // optional, if you want to disable language mapper, set it to `false`
       // if you want to override the default language mapper inside, you can provide your own
       "mdx/language-mapper": {}
     }
   }
   ```

2. Make sure ESLint knows to run on `.md` or `.mdx` files:

   ```sh
   eslint . --ext js,md,mdx
   ```

## Parser Options

1. `extensions` (`string | string[]`): `eslint-mdx` will only resolve `.mdx` files by default, if you want to resolve other extensions as like `.mdx`, you can use this option.

2. `markdownExtensions` (`string | string[]`): `eslint-mdx` will only treat `.md` files as plain markdown by default, and will lint them via remark plugins. If you want to resolve other extensions as like `.md`, you can use this option.

3. `ignoreRemarkConfig` (`boolean`): Ignore the `remark` configuration defined in the project.

## Rules

### mdx/remark

_possible fixable depends on your remark plugins_:

Integration with [remark-lint][] plugins, it will read [remark's configuration](https://github.com/remarkjs/remark/tree/master/packages/remark-cli#remark-cli) automatically via [cosmiconfig][]. But `.remarkignore` will not be respected, you should use `.eslintignore` instead.

If you want to disable or change severity of some related rules, it won't work by setting rules in eslint config like `'remark-lint-no-duplicate-headings': 0`, you should change your remark config instead like following:

```jsonc
{
  "plugins": [
    "@1stg/remark-config",
    // change to error severity, notice `[]` is required
    ["lint-no-duplicate-headings", [2]],
    // disable following plugin
    [
      "lint-no-multiple-toplevel-headings",
      [0] // or false
    ]
  ]
}
```

## Prettier Integration

If you're using [remark-lint][] feature with [Prettier][] both together, you can try [remark-preset-prettier][] which helps you to _turn off all rules that are unnecessary or might conflict with [Prettier][]_.

```json
{
  "plugins": [
    "preset-lint-consistent",
    "preset-lint-recommended",
    "preset-lint-markdown-style-guide",
    "preset-prettier"
  ]
}
```

## Sponsors

| 1stG                                                                                                                               | RxTS                                                                                                                               | UnTS                                                                                                                               |
| ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| [![1stG Open Collective backers and sponsors](https://opencollective.com/1stG/organizations.svg)](https://opencollective.com/1stG) | [![RxTS Open Collective backers and sponsors](https://opencollective.com/rxts/organizations.svg)](https://opencollective.com/rxts) | [![UnTS Open Collective backers and sponsors](https://opencollective.com/unts/organizations.svg)](https://opencollective.com/unts) |

[![unified Open Collective backers and sponsors](https://opencollective.com/unified/organizations.svg)](https://opencollective.com/unified)

## Backers

| 1stG                                                                                                                             | RxTS                                                                                                                             | UnTS                                                                                                                             |
| -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| [![1stG Open Collective backers and sponsors](https://opencollective.com/1stG/individuals.svg)](https://opencollective.com/1stG) | [![RxTS Open Collective backers and sponsors](https://opencollective.com/rxts/individuals.svg)](https://opencollective.com/rxts) | [![UnTS Open Collective backers and sponsors](https://opencollective.com/unts/individuals.svg)](https://opencollective.com/unts) |

[![unified Open Collective backers and sponsors](https://opencollective.com/unified/individuals.svg)](https://opencollective.com/unified)

## Changelog

Detailed changes for each release are documented in [CHANGELOG.md](./CHANGELOG.md).

## License

[MIT][] © [JounQin][]@[1stG.me][]

[1stg.me]: https://www.1stg.me
[cosmiconfig]: https://github.com/davidtheclark/cosmiconfig
[eslint]: https://eslint.org
[jounqin]: https://GitHub.com/JounQin
[lerna]: https://github.com/lerna/lerna
[mdx]: https://github.com/mdx-js/mdx
[mit]: http://opensource.org/licenses/MIT
[prettier]: https://prettier.io
[remark-lint]: https://github.com/remarkjs/remark-lint
[remark-preset-prettier]: https://github.com/JounQin/remark-preset-prettier
[vscode eslint]: https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint
[vscode mdx]: https://github.com/mdx-js/vscode-mdx
