// Package jsoncolor is a drop-in replacement for encoding/json's
// Marshal and MarshalIndent functions and Encoder type which produce
// colorized output.
package jsoncolor

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"strings"

	"github.com/fatih/color"
)

// DefaultFormatter is the Formatter used by Marshal, MarshalIndent
// and NewEncoder.
var DefaultFormatter = &Formatter{}

// Marshal is like encoding/json's Marshal but colorizes the output
// using DefaultFormatter.
func Marshal(v interface{}) ([]byte, error) {
	return MarshalIndent(v, "", "")
}

// MarshalIndent is like encoding/json's MarshalIndent but colorizes
// the output using DefaultFormatter.
func MarshalIndent(v interface{}, prefix, indent string) ([]byte, error) {
	return MarshalIndentWithFormatter(v, prefix, indent, DefaultFormatter)
}

// MarshalWithFormatter is like Marshal but using the Formatter f.
// MarshalWithFormatter does not indent its output and thus ignores
// the values of f's Prefix and Indent fields.  MarshalWithFormatter
// replaces problematic characters and thus ignores the value of f's
// EscapeHTML field.  This replacement can be disabled when using an
// Encoder, by calling SetEscapeHTML(false).
func MarshalWithFormatter(v interface{}, f *Formatter) ([]byte, error) {
	return MarshalIndentWithFormatter(v, "", "", f)
}

// MarshalIndentWithFormatter is like MarshalIndent but using the
// Formatter f.  MarshalIndentWithFormatter's prefix and indent
// arguments override f's Prefix and Indent fields, which are
// therefore ignored.  MarshalIndentWithFormatter replaces problematic
// characters and therefore ignores f's EscapeHTML field.  This
// replacement can be disabled when using an Encoder, by calling
// SetEscapeHTML(false).
func MarshalIndentWithFormatter(v interface{}, prefix, indent string, f *Formatter) ([]byte, error) {
	buf := &bytes.Buffer{}

	enc := NewEncoderWithFormatter(buf, f)
	enc.SetIndent(prefix, indent)
	enc.SetEscapeHTML(true)

	err := enc.encode(v, false)
	if err != nil {
		return nil, err
	}

	return buf.Bytes(), nil
}

// Encoder is like encoding/json's Encoder but colorizes the output
// written to the stream using a Formatter.
type Encoder struct {
	w io.Writer
	f *Formatter
}

// NewEncoder is like encoding/json's NewEncoder but returns an
// encoder that writes colorized output to w using DefaultFormatter.
func NewEncoder(w io.Writer) *Encoder {
	return NewEncoderWithFormatter(w, DefaultFormatter)
}

// NewEncoderFormatter is like NewEncoder but using the Formatter f.
// Note that the value of f's EscapeHTML field is ignored, callers
// wishing to disable the default behavior of escaping HTML should
// call SetEscapeHTML(false) after creating the encoder.
func NewEncoderWithFormatter(w io.Writer, f *Formatter) *Encoder {
	if f == nil {
		panic("jsoncolor: nil formatter")
	}
	f = f.clone()
	f.setEscapeHTML(true)
	return &Encoder{
		w: w,
		f: f,
	}
}

// Encode is like encoding/json's Encoder.Encode but writes a
// colorized JSON encoding of v to the stream.
func (enc *Encoder) Encode(v interface{}) error {
	return enc.encode(v, true)
}

// SetIndent is like encoding/json's Encoder.SetIndent.
func (enc *Encoder) SetIndent(prefix, indent string) {
	enc.f.setIndent(prefix, indent)
}

// SetIndent is like encoding/json's Encoder.SetEscapeHTML.
func (enc *Encoder) SetEscapeHTML(on bool) {
	enc.f.setEscapeHTML(on)
}

func (enc *Encoder) encode(v interface{}, terminateWithNewline bool) error {
	b, err := json.Marshal(v)
	if err != nil {
		return err
	}

	err = enc.f.format(enc.w, b, terminateWithNewline)
	if err != nil {
		return err
	}

	return nil
}

type frame struct {
	object bool
	field  bool
	array  bool
	empty  bool
	indent int
}

func (f *frame) inArray() bool {
	if f == nil {
		return false
	}
	return f.array
}

func (f *frame) inObject() bool {
	if f == nil {
		return false
	}
	return f.object
}

func (f *frame) inArrayOrObject() bool {
	if f == nil {
		return false
	}
	return f.object || f.array
}

func (f *frame) inField() bool {
	if f == nil {
		return false
	}
	return f.object && f.field
}

func (f *frame) toggleField() {
	if f == nil {
		return
	}
	f.field = !f.field
}

func (f *frame) isEmpty() bool {
	if f == nil {
		return false
	}
	return (f.object || f.array) && f.empty
}

// SprintfFuncer is implemented by any value that has a SprintfFunc
// method.
type SprintfFuncer interface {
	// SprintfFunc returns a new function that returns colorized
	// strings for the given arguments with fmt.Sprintf().
	SprintfFunc() func(format string, a ...interface{}) string
}

var (
	// DefaultSpaceColor is the default color for whitespace
	// characters.
	DefaultSpaceColor = color.New()
	// DefaultCommaColor is the default color for the comma
	// character ',' delimiting object and array fields.
	DefaultCommaColor = color.New(color.Bold)
	// DefaultColonColor is the default color the colon character
	// ':' separating object field names and values.
	DefaultColonColor = color.New(color.Bold)
	// DefaultObjectColor is the default color for the object
	// delimiter characters '{' and '}'.
	DefaultObjectColor = color.New(color.Bold)
	// DefaultArrayColor is the default color for the array
	// delimiter characters '[' and ']'.
	DefaultArrayColor = color.New(color.Bold)
	// DefaultFieldQuoteColor is the default color for quotes '"'
	// surrounding object field names.
	DefaultFieldQuoteColor = color.New(color.FgBlue, color.Bold)
	// DefaultFieldColor is the default color for object field
	// names.
	DefaultFieldColor = color.New(color.FgBlue, color.Bold)
	// DefaultStringQuoteColor is the default color for quotes '"'
	// surrounding string values.
	DefaultStringQuoteColor = color.New(color.FgGreen)
	// DefaultStringColor is the default color for string values.
	DefaultStringColor = color.New(color.FgGreen)
	// DefaultTrueColor is the default color for 'true' boolean
	// values.
	DefaultTrueColor = color.New()
	// DefaultFalseColor is the default color for 'false' boolean
	// values.
	DefaultFalseColor = color.New()
	// DefaultNumberColor is the default color for number values.
	DefaultNumberColor = color.New()
	// DefaultNullColor is the default color for null values.
	DefaultNullColor = color.New(color.FgBlack, color.Bold)

	// By default, no prefix is used.
	DefaultPrefix = ""
	// By default, an indentation of two spaces is used.
	DefaultIndent = "  "
)

// Formatter colorizes buffers containing JSON.
type Formatter struct {
	// Color for whitespace characters.  If nil, DefaultSpaceColor
	// is used.
	SpaceColor SprintfFuncer
	// Color for the comma character ',' delimiting object and
	// array fields.  If nil, DefaultCommaColor is used.
	CommaColor SprintfFuncer
	// Color for the colon character ':' separating object field
	// names and values.  If nil, DefaultColonColor is used.
	ColonColor SprintfFuncer
	// Color for object delimiter characters '{' and '}'.  If nil,
	// DefaultObjectColor is used.
	ObjectColor SprintfFuncer
	// Color for array delimiter characters '[' and ']'.  If nil,
	// DefaultArrayColor is used.
	ArrayColor SprintfFuncer
	// Color for quotes '"' surrounding object field names.  If
	// nil, DefaultFieldQuoteColor is used.
	FieldQuoteColor SprintfFuncer
	// Color for object field names.  If nil, DefaultFieldColor is
	// used.
	FieldColor SprintfFuncer
	// Color for quotes '"' surrounding string values.  If nil,
	// DefaultStringQuoteColor is used.
	StringQuoteColor SprintfFuncer
	// Color for string values.  If nil, DefaultStringColor is
	// used.
	StringColor SprintfFuncer
	// Color for 'true' boolean values.  If nil, DefaultTrueColor
	// is used.
	TrueColor SprintfFuncer
	// Color for 'false' boolean values.  If nil,
	// DefaultFalseColor is used.
	FalseColor SprintfFuncer
	// Color for number values.  If nil, DefaultNumberColor is
	// used.
	NumberColor SprintfFuncer
	// Color for null values.  If nil, DefaultNullColor is used.
	NullColor SprintfFuncer

	// Prefix is prepended before indentation to newlines.
	Prefix string
	// Indent is prepended to newlines one or more times according
	// to indentation nesting.
	Indent string

	// EscapeHTML specifies whether problematic HTML characters
	// should be escaped inside JSON quoted strings.  See
	// json.Encoder.SetEscapeHTML's comment for more details.
	EscapeHTML bool
}

// NewFormatter returns a new formatter.
func NewFormatter() *Formatter {
	return &Formatter{}
}

func (f *Formatter) clone() *Formatter {
	var g Formatter
	g = *f
	return &g
}

func (f *Formatter) setIndent(prefix, indent string) {
	f.Prefix = prefix
	f.Indent = indent
}

func (f *Formatter) setEscapeHTML(on bool) {
	f.EscapeHTML = on
}

// Format appends to dst a colorized form of the JSON-encoded src.
func (f *Formatter) Format(dst io.Writer, src []byte) error {
	return newFormatterState(f, dst).format(dst, src, false)
}

func (f *Formatter) format(dst io.Writer, src []byte, terminateWithNewline bool) error {
	return newFormatterState(f, dst).format(dst, src, terminateWithNewline)
}

func (f *Formatter) spaceColor() SprintfFuncer {
	if f.SpaceColor != nil {
		return f.SpaceColor
	}
	return DefaultSpaceColor
}

func (f *Formatter) commaColor() SprintfFuncer {
	if f.CommaColor != nil {
		return f.CommaColor
	}
	return DefaultCommaColor
}

func (f *Formatter) colonColor() SprintfFuncer {
	if f.ColonColor != nil {
		return f.ColonColor
	}
	return DefaultColonColor
}

func (f *Formatter) objectColor() SprintfFuncer {
	if f.ObjectColor != nil {
		return f.ObjectColor
	}
	return DefaultObjectColor
}

func (f *Formatter) arrayColor() SprintfFuncer {
	if f.ArrayColor != nil {
		return f.ArrayColor
	}
	return DefaultArrayColor
}

func (f *Formatter) fieldQuoteColor() SprintfFuncer {
	if f.FieldQuoteColor != nil {
		return f.FieldQuoteColor
	}
	return DefaultFieldQuoteColor
}

func (f *Formatter) fieldColor() SprintfFuncer {
	if f.FieldColor != nil {
		return f.FieldColor
	}
	return DefaultFieldColor
}

func (f *Formatter) stringQuoteColor() SprintfFuncer {
	if f.StringQuoteColor != nil {
		return f.StringQuoteColor
	}
	return DefaultStringQuoteColor
}

func (f *Formatter) stringColor() SprintfFuncer {
	if f.StringColor != nil {
		return f.StringColor
	}
	return DefaultStringColor
}

func (f *Formatter) trueColor() SprintfFuncer {
	if f.TrueColor != nil {
		return f.TrueColor
	}
	return DefaultTrueColor
}

func (f *Formatter) falseColor() SprintfFuncer {
	if f.FalseColor != nil {
		return f.FalseColor
	}
	return DefaultFalseColor
}

func (f *Formatter) numberColor() SprintfFuncer {
	if f.NumberColor != nil {
		return f.NumberColor
	}
	return DefaultNumberColor
}

func (f *Formatter) nullColor() SprintfFuncer {
	if f.NullColor != nil {
		return f.NullColor
	}
	return DefaultNullColor
}

type formatterState struct {
	compact bool
	indent  string
	frames  []*frame

	printSpace  func(s string, force bool)
	printComma  func()
	printColon  func()
	printObject func(json.Delim)
	printArray  func(json.Delim)
	printField  func(k string) error
	printString func(s string) error
	printBool   func(b bool)
	printNumber func(n json.Number)
	printNull   func()
	printIndent func()
}

func newFormatterState(f *Formatter, dst io.Writer) *formatterState {
	sprintfSpace := f.spaceColor().SprintfFunc()
	sprintfComma := f.commaColor().SprintfFunc()
	sprintfColon := f.colonColor().SprintfFunc()
	sprintfObject := f.objectColor().SprintfFunc()
	sprintfArray := f.arrayColor().SprintfFunc()
	sprintfFieldQuote := f.fieldQuoteColor().SprintfFunc()
	sprintfField := f.fieldColor().SprintfFunc()
	sprintfStringQuote := f.stringQuoteColor().SprintfFunc()
	sprintfString := f.stringColor().SprintfFunc()
	sprintfTrue := f.trueColor().SprintfFunc()
	sprintfFalse := f.falseColor().SprintfFunc()
	sprintfNumber := f.numberColor().SprintfFunc()
	sprintfNull := f.nullColor().SprintfFunc()

	// json.Encoder.SetEscapeHTML was added in Go 1.7, we need to
	// test to see if it exists
	type setEscapeHTMLer interface {
		SetEscapeHTML(bool)
	}

	encodeString := func(s string) (string, error) {
		buf := bytes.NewBuffer(make([]byte, 0, len(s)+3))
		enc := json.NewEncoder(buf)

		var i interface{}
		i = enc
		if se, ok := i.(setEscapeHTMLer); ok {
			se.SetEscapeHTML(f.EscapeHTML)
		}

		err := enc.Encode(&s)
		if err != nil {
			return "", err
		}
		sbuf := buf.Bytes()
		if len(sbuf) < 3 {
			return "", fmt.Errorf("cannot encode string, result too short")
		}
		return string(sbuf[1 : len(sbuf)-2]), nil
	}

	fs := &formatterState{
		compact: len(f.Prefix) == 0 && len(f.Indent) == 0,
		indent:  "",
		frames: []*frame{
			{},
		},
		printComma: func() {
			fmt.Fprint(dst, sprintfComma(","))
		},
		printColon: func() {
			fmt.Fprint(dst, sprintfColon(":"))
		},
		printObject: func(t json.Delim) {
			fmt.Fprint(dst, sprintfObject(t.String()))
		},
		printArray: func(t json.Delim) {
			fmt.Fprint(dst, sprintfArray(t.String()))
		},
		printField: func(k string) error {
			encStr, err := encodeString(k)
			if err != nil {
				return err
			}
			fmt.Fprint(dst, sprintfFieldQuote(`"`))
			fmt.Fprint(dst, sprintfField("%s", encStr))
			fmt.Fprint(dst, sprintfFieldQuote(`"`))
			return nil
		},
		printString: func(s string) error {
			encStr, err := encodeString(s)
			if err != nil {
				return err
			}
			fmt.Fprint(dst, sprintfStringQuote(`"`))
			fmt.Fprint(dst, sprintfString("%s", encStr))
			fmt.Fprint(dst, sprintfStringQuote(`"`))
			return nil
		},
		printBool: func(b bool) {
			if b {
				fmt.Fprint(dst, sprintfTrue("%v", b))
			} else {
				fmt.Fprint(dst, sprintfFalse("%v", b))
			}
		},
		printNumber: func(n json.Number) {
			fmt.Fprint(dst, sprintfNumber("%v", n))
		},
		printNull: func() {
			fmt.Fprint(dst, sprintfNull("null"))
		},
	}

	fs.printSpace = func(s string, force bool) {
		if fs.compact && !force {
			return
		}
		fmt.Fprint(dst, sprintfSpace(s))
	}

	fs.printIndent = func() {
		if fs.compact {
			return
		}
		if len(f.Prefix) > 0 {
			fmt.Fprint(dst, f.Prefix)
		}
		indent := fs.frame().indent
		if indent > 0 {
			ilen := len(f.Indent) * indent
			if len(fs.indent) < ilen {
				fs.indent = strings.Repeat(f.Indent, indent)
			}
			fmt.Fprint(dst, sprintfSpace(fs.indent[:ilen]))
		}
	}

	return fs
}

func (fs *formatterState) frame() *frame {
	return fs.frames[len(fs.frames)-1]
}

func (fs *formatterState) enterFrame(t json.Delim, empty bool) *frame {
	indent := fs.frames[len(fs.frames)-1].indent + 1
	fs.frames = append(fs.frames, &frame{
		object: t == json.Delim('{'),
		array:  t == json.Delim('['),
		indent: indent,
		empty:  empty,
	})
	return fs.frame()
}

func (fs *formatterState) leaveFrame() *frame {
	fs.frames = fs.frames[:len(fs.frames)-1]
	return fs.frame()
}

func (fs *formatterState) formatToken(t json.Token) error {
	switch x := t.(type) {
	case json.Delim:
		if x == json.Delim('{') || x == json.Delim('}') {
			fs.printObject(x)
		} else {
			fs.printArray(x)
		}
	case json.Number:
		fs.printNumber(x)
	case string:
		if !fs.frame().inField() {
			return fs.printString(x)
		}
		return fs.printField(x)
	case bool:
		fs.printBool(x)
	case nil:
		fs.printNull()
	default:
		return fmt.Errorf("unknown type %T", t)
	}
	return nil
}

func (fs *formatterState) format(dst io.Writer, src []byte, terminateWithNewline bool) error {
	dec := json.NewDecoder(bytes.NewReader(src))
	dec.UseNumber()

	frame := fs.frame()

	// this variable indicates whether the original input
	// is a JSON object or JSON array. This allows us to
	// correctly print JSON scalar values such as strings,
	// numbers, `true`, `false` and `null`.

	inputIsObjectOrArray := false

	for {
		t, err := dec.Token()
		if err == io.EOF {
			break
		}
		if err != nil {
			return err
		}

		more := dec.More()
		printComma := frame.inArrayOrObject() && more

		if x, ok := t.(json.Delim); ok {
			inputIsObjectOrArray = inputIsObjectOrArray && true
			if x == json.Delim('{') || x == json.Delim('[') {
				if frame.inObject() {
					fs.printSpace(" ", false)
				} else {
					fs.printIndent()
				}
				err = fs.formatToken(x)
				if more {
					fs.printSpace("\n", false)
				}
				frame = fs.enterFrame(x, !more)
			} else {
				empty := frame.isEmpty()
				frame = fs.leaveFrame()
				if !empty {
					fs.printIndent()
				}
				err = fs.formatToken(x)
				if printComma {
					fs.printComma()
				}
				if len(fs.frames) > 1 {
					fs.printSpace("\n", false)
				}
			}
		} else {
			printIndent := frame.inArray()
			if _, ok := t.(string); ok {
				printIndent = !frame.inObject() || frame.inField()
			}

			if printIndent {
				fs.printIndent()
			}
			if !frame.inField() && inputIsObjectOrArray {
				fs.printSpace(" ", false)
			}
			err = fs.formatToken(t)
			if frame.inField() {
				fs.printColon()
			} else {
				if printComma {
					fs.printComma()
				}
				if len(fs.frames) > 1 {
					fs.printSpace("\n", false)
				}
			}
		}

		if frame.inObject() {
			frame.toggleField()
		}

		if err != nil {
			return err
		}
	}

	if terminateWithNewline {
		fs.printSpace("\n", true)
	}

	return nil
}
