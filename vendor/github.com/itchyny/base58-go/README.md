# base58-go
[![CI Status](https://github.com/itchyny/base58-go/workflows/CI/badge.svg)](https://github.com/itchyny/base58-go/actions)
[![Go Report Card](https://goreportcard.com/badge/github.com/itchyny/base58-go)](https://goreportcard.com/report/github.com/itchyny/base58-go)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/itchyny/base58-go/blob/main/LICENSE)
[![release](https://img.shields.io/github/release/itchyny/base58-go/all.svg)](https://github.com/itchyny/base58-go/releases)
[![pkg.go.dev](https://pkg.go.dev/badge/github.com/itchyny/base58-go)](https://pkg.go.dev/github.com/itchyny/base58-go)

### Base58 encoding/decoding package in Go
This is a Go language package for encoding and decoding base58 strings.
This package supports multiple encodings, flickr, ripple and bitcoin.

## Package Usage
```go
package main

import (
	"fmt"
	"os"

	"github.com/itchyny/base58-go"
)

func main() {
	encoding := base58.FlickrEncoding // or RippleEncoding or BitcoinEncoding

	encoded, err := encoding.Encode([]byte("100"))
	if err != nil {
		fmt.Println(err.Error())
		os.Exit(1)
	}
	fmt.Println(string(encoded))

	decoded, err := encoding.Decode(encoded)
	if err != nil {
		fmt.Println(err.Error())
		os.Exit(1)
	}
	fmt.Println(string(decoded))
}
```

## base58 command
### Homebrew
```sh
brew install itchyny/tap/base58
```

### Build from source
```bash
go install github.com/itchyny/base58-go/cmd/base58@latest
```

### Basic usage
```sh
 $ base58
100
2J
100000000
9QwvW
79228162514264337593543950336
5QchsBFApWPVxyp9C
^D
 $ base58 --decode
2J
100
9QwvW
100000000
5QchsBFApWPVxyp9C
79228162514264337593543950336
^D
 $ echo 100000000 | base58
9QwvW
 $ echo 9QwvW | base58 --decode
100000000
 $ echo 100000000 | base58 --encoding=bitcoin
9qXWw
```

## Bug Tracker
Report bug at [Issues・itchyny/base58-go - GitHub](https://github.com/itchyny/base58-go/issues).

## Author
itchyny (https://github.com/itchyny)

## License
This software is released under the MIT License, see LICENSE.
