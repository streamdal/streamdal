# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [2.0.0](https://github.com/tleunen/find-babel-config/compare/v1.2.0...v2.0.0) (2023-01-09)


### ⚠ BREAKING CHANGES

* The order or config file lookup is ".babelrc, .babelrc.js, babel.config.js, babel.config.json, package.json"
* Node 16 is the minimum supported version

### Bug Fixes

* Fix order or config file lookup to be the same in sync and async functions ([#38](https://github.com/tleunen/find-babel-config/issues/38)) ([4fde4bb](https://github.com/tleunen/find-babel-config/commit/4fde4bbe9afec0d9ecc413d26c88d94fef33848f))


* Update dependencies ([#37](https://github.com/tleunen/find-babel-config/issues/37)) ([4198a93](https://github.com/tleunen/find-babel-config/commit/4198a93f68cda2a1d9004d542fb0435df4065615))

<a name="1.2.0"></a>
# [1.2.0](https://github.com/tleunen/find-babel-config/compare/v1.1.0...v1.2.0) (2019-03-04)


### Features

* Add support for babel.config.js ([#32](https://github.com/tleunen/find-babel-config/issues/32)) ([593aa1c](https://github.com/tleunen/find-babel-config/commit/593aa1c))



<a name="1.1.0"></a>
# [1.1.0](https://github.com/tleunen/find-babel-config/compare/v1.0.1...v1.1.0) (2017-05-08)


### Features

* Add support for .babelrc.js ([#29](https://github.com/tleunen/find-babel-config/issues/29)) ([199c389](https://github.com/tleunen/find-babel-config/commit/199c389))



<a name="1.0.1"></a>
## [1.0.1](https://github.com/tleunen/find-babel-config/compare/v1.0.0...v1.0.1) (2016-08-20)


### Bug Fixes

* Fix async call with depth 0 ([ddb684f](https://github.com/tleunen/find-babel-config/commit/ddb684f))



<a name="1.0.0"></a>
# [1.0.0](https://github.com/tleunen/find-babel-config/compare/v0.1.1...v1.0.0) (2016-08-06)


### Features

* Add support for async lookup ([ca2f592](https://github.com/tleunen/find-babel-config/commit/ca2f592))


### BREAKING CHANGES

* The default function is now async and uses a Promise. And the function doesn't
return null when the config is not found. Instead, an object { file: null,
config: null } is returned.



<a name="0.1.1"></a>
## [0.1.1](https://github.com/tleunen/find-babel-config/compare/v0.1.0...v0.1.1) (2016-07-10)


### Bug Fixes

* **release:** Ignore src/ but not lib/ for npm ([2588adf](https://github.com/tleunen/find-babel-config/commit/2588adf))



<a name="0.1.0"></a>
# 0.1.0 (2016-07-10)


### Features

* **find:** Initial commit with the find babel config function ([cd861f4](https://github.com/tleunen/find-babel-config/commit/cd861f4))
