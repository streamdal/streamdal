# pii

![PII Searching](http://www.celwalls.com/wallpapers/large/1961.jpg)

## Description

pii is a small library and command line utility that aims to make detecting PII a little easier for security analysts by doing the following:

- Attempts to standardize well-known PII regular expressions to avoid discrepencies
- Allows the creation of combinatorial logic around multiple regular expressions for more granularity
- Proccesses files in parallel, giving performance enhancements over Python / Ruby / etc.
- Is written as a library allowing for easy integration into existing Go tools

The tool is very much evolving as people contribute. This is one of those tools that should get better over time as improvements are made and the patterns are tuned even further.

## Installation

```sh
go get github.com/gen0cide/pii/cmd/pii
```

## Usage

```sh
pii search foo.txt
```

### Options

- `pii -j/--json` will output the data in JSON format.
- `pii search --find-matches` will attempt to extract the findings from the files (expirimental)

### Contact

Twitter: [@alexlevinson](https://twitter.com/alexlevinson)

Slack: [LOTR Slack](https://slofile.com/slack/lotr) (gandalf, #pii)
