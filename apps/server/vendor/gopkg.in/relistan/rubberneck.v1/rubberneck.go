package rubberneck

import (
	"fmt"
	"reflect"
	"regexp"
	"strings"
)

var (
	expr *regexp.Regexp
)

// AddLineFeed will direct the Printer to add line feeds
// at the end of each output. NoAddLineFeed will not. This
// is useful for controlling the display of output when
// functions exhibit different behavior. For example,
// fmt.Printf wants line feeds added, whereas logrus.Infof
// does not.
const (
	AddLineFeed   = iota
	NoAddLineFeed = iota
)

func init() {
	expr = regexp.MustCompile("^[a-z]")
}

// Conforms to the signature used by fmt.Printf and log.Printf among
// many functions available in other packages.
type PrinterFunc func(format string, v ...interface{})

// MaskFunc takes a config argument and returns a string that is used
// to mask config values. This is useful to redact passwords etc.
type MaskFunc func(argument string) *string

// Printer defines the signature of a function that can be
// used to display the configuration. This signature is used
// by fmt.Printf, log.Printf, various logging output levels
// from the logrus package, and others.
type Printer struct {
	Show PrinterFunc
	Mask MaskFunc
}

func addLineFeed(fn PrinterFunc) PrinterFunc {
	return func(format string, v ...interface{}) {
		format = format + "\n"
		fn(format, v...)
	}
}

// NewDefaultPrinter returns a Printer configured to write to stdout.
func NewDefaultPrinter() *Printer {
	return &Printer{
		Show: func(format string, v ...interface{}) {
			fmt.Printf(format+"\n", v...)
		},
	}
}

// NewPrinter returns a Printer configured to use the supplied function
// to output to the supplied function.
func NewPrinter(fn PrinterFunc, lineFeed int) *Printer {
	p := &Printer{Show: fn}

	if lineFeed == AddLineFeed {
		p.Show = addLineFeed(fn)
	}

	return p
}

// NewPrinterWithKeyMasking returns a Printer configured to use printer function
// `fn` for output and the masking function `mk` for redacting certain keys.
func NewPrinterWithKeyMasking(fn PrinterFunc, mk MaskFunc, lineFeed int) *Printer {
	p := NewPrinter(fn, lineFeed)
	p.Mask = mk
	return p
}

// Print attempts to pretty print the contents of each obj in a format suitable
// for displaying the configuration of an application on startup. It uses a
// default label of 'Settings' for the output.
func (p *Printer) Print(objs ...interface{}) {
	// Add some protection against accidentally providing this method with
	// a label.
	if len(objs) > 0 {
		switch objs[0].(type) {
		case string:
			p.Show(" *** Expected to print a struct, got: '%s' ***", objs[0])
			return
		}
	}
	p.PrintWithLabel("Settings", objs...)
}

// PrintWithLabel attempts to pretty print the contents of each obj in a format
// suitable for displaying the configuration of an application on startup. It
// takes a label argument which is a string to be printed into the title bar in
// the output.
func (p *Printer) PrintWithLabel(label string, objs ...interface{}) {
	p.Show("%s %s", label, strings.Repeat("-", 50-len(label)-1))
	for _, obj := range objs {
		p.processOne(reflect.ValueOf(obj), 0)
	}
	p.Show("%s", strings.Repeat("-", 50))

}

func (p *Printer) processOne(value reflect.Value, indent int) {
	if value.Kind() == reflect.Ptr {
		value = value.Elem()
	}
	t := value.Type()

	for i := 0; i < value.NumField(); i++ {
		name := t.Field(i).Name

		// Other methods of detecting unexported fields seem unreliable
		// or different between Go versions and Go compilers (gc vs gccgo)
		if expr.MatchString(name) {
			continue
		}

		field := value.Field(i)

		if field.Kind() == reflect.Ptr {
			field = field.Elem()
		}

		switch field.Kind() {
		case reflect.Struct:
			p.Show(" %s * %s:", strings.Repeat("  ", indent), name)
			p.processOne(reflect.ValueOf(field.Interface()), indent+1)
		default:
			var val interface{}

			// Elem() returns a Zero value when field is nil. So IsValid()
			// and CanInterface() protect us from calling Interface()
			// inappropriately.
			if field.IsValid() && field.CanInterface() {
				val = field.Interface()
			}

			if p.Mask != nil {
				if maskedValue := p.Mask(name); maskedValue != nil {
					val = *maskedValue
				}
			}
			p.Show(" %s * %s: %v", strings.Repeat("  ", indent), name, val)
		}
	}
}

// Print configures a default printer to output to stdout and
// then prints the object.
func Print(obj interface{}) {
	NewDefaultPrinter().Print(obj)
}
