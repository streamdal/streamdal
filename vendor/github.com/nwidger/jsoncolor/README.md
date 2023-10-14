jsoncolor
=========

[![GoDoc](https://godoc.org/github.com/nwidger/jsoncolor?status.svg)](https://godoc.org/github.com/nwidger/jsoncolor)

`jsoncolor` is a drop-in replacement for `encoding/json`'s `Marshal`
and `MarshalIndent` functions and `Encoder` type which produce
colorized output using fatih's [color](https://github.com/fatih/color)
package.

## Installation

```
go get -u github.com/nwidger/jsoncolor
```

## Usage

To use as a replacement for `encoding/json`, exchange

`import "encoding/json"` with `import json "github.com/nwidger/jsoncolor"`.

`json.Marshal`, `json.MarshalIndent` and `json.NewEncoder` will now
produce colorized output.

## Custom Colors

The colors used for each type of token can be customized by creating a
custom `Formatter`, changing its `XXXColor` fields and then passing it
to `MarshalWithFormatter`, `MarshalIndentWithFormatter` or
`NewEncoderWithFormatter`.  If a `XXXColor` field of the custom
`Formatter` is not set, the corresponding `DefaultXXXColor` package
variable is used.  See
[color.New](https://godoc.org/github.com/fatih/color#New) for creating
custom color values and the
[GoDocs](https://godoc.org/github.com/nwidger/jsoncolor#pkg-variables)
for the default colors.

``` go
import (
        "fmt"
        "log"

        "github.com/fatih/color"
        json "github.com/nwidger/jsoncolor"
)

// create custom formatter
f := json.NewFormatter()

// set custom colors
f.StringColor = color.New(color.FgBlack, color.Bold)
f.TrueColor = color.New(color.FgWhite, color.Bold)
f.FalseColor = color.New(color.FgRed)
f.NumberColor = color.New(color.FgWhite)
f.NullColor = color.New(color.FgWhite, color.Bold)

// marshal v with custom formatter,
// dst contains colorized output
dst, err := json.MarshalWithFormatter(v, f)
if err != nil {
        log.Fatal(err)
}

// print colorized output to stdout
fmt.Println(string(dst))
```
