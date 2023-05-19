// Package tinyjson contains marshaler/unmarshaler interfaces and helper functions.
package tinyjson

import (
	"io"
	"io/ioutil"
	"unsafe"

	"github.com/CosmWasm/tinyjson/jlexer"
	"github.com/CosmWasm/tinyjson/jwriter"
)

// Marshaler is an tinyjson-compatible marshaler interface.
type Marshaler interface {
	MarshalTinyJSON(w *jwriter.Writer)
}

// Marshaler is an tinyjson-compatible unmarshaler interface.
type Unmarshaler interface {
	UnmarshalTinyJSON(w *jlexer.Lexer)
}

// MarshalerUnmarshaler is an tinyjson-compatible marshaler/unmarshaler interface.
type MarshalerUnmarshaler interface {
	Marshaler
	Unmarshaler
}

// Optional defines an undefined-test method for a type to integrate with 'omitempty' logic.
type Optional interface {
	IsDefined() bool
}

// UnknownsUnmarshaler provides a method to unmarshal unknown struct fileds and save them as you want
type UnknownsUnmarshaler interface {
	UnmarshalUnknown(in *jlexer.Lexer, key string)
}

// UnknownsMarshaler provides a method to write additional struct fields
type UnknownsMarshaler interface {
	MarshalUnknowns(w *jwriter.Writer, first bool)
}

func isNilInterface(i interface{}) bool {
	return (*[2]uintptr)(unsafe.Pointer(&i))[1] == 0
}

// Marshal returns data as a single byte slice. Method is suboptimal as the data is likely to be copied
// from a chain of smaller chunks.
func Marshal(v Marshaler) ([]byte, error) {
	if isNilInterface(v) {
		return nullBytes, nil
	}

	w := jwriter.Writer{}
	v.MarshalTinyJSON(&w)
	return w.BuildBytes()
}

// MarshalToWriter marshals the data to an io.Writer.
func MarshalToWriter(v Marshaler, w io.Writer) (written int, err error) {
	if isNilInterface(v) {
		return w.Write(nullBytes)
	}

	jw := jwriter.Writer{}
	v.MarshalTinyJSON(&jw)
	return jw.DumpTo(w)
}

// Unmarshal decodes the JSON in data into the object.
func Unmarshal(data []byte, v Unmarshaler) error {
	l := jlexer.Lexer{Data: data}
	v.UnmarshalTinyJSON(&l)
	return l.Error()
}

// UnmarshalFromReader reads all the data in the reader and decodes as JSON into the object.
func UnmarshalFromReader(r io.Reader, v Unmarshaler) error {
	data, err := ioutil.ReadAll(r)
	if err != nil {
		return err
	}
	l := jlexer.Lexer{Data: data}
	v.UnmarshalTinyJSON(&l)
	return l.Error()
}
