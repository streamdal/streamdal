package console

import (
	"fmt"

	"github.com/gdamore/tcell/v2"
)

const (
	TextPrimary Element = iota
	TextSecondary
	TextAccent1
	TextAccent2
	TextAccent3
	ActiveButtonBg
	ActiveButtonFg
	InactiveButtonBg
	InactiveButtonFg
	MenuActiveBg
	MenuInactiveFg
	InputFieldFg
	InputFieldBg
	WindowBg
	CLIBg
)

var (
	ColorMap = map[Element]Color{
		TextPrimary: {
			Name:       "white",
			Hex256:     "FFFFFF",
			Tcell256:   tcell.ColorWhite,
			Hex24Bit:   "FFFFFF",
			Tcell24Bit: tcell.ColorWhite,
		},
		TextSecondary: {
			Name:       "light purple",
			Hex256:     fmt.Sprintf("%X", tcell.Color141.Hex()),
			Tcell256:   tcell.Color141,
			Hex24Bit:   "",
			Tcell24Bit: tcell.ColorWhite,
		},
		TextAccent1: {
			Name:       "yellow",
			Hex256:     fmt.Sprintf("%X", tcell.Color221.Hex()),
			Tcell256:   tcell.Color221,
			Hex24Bit:   "",
			Tcell24Bit: tcell.ColorWhite,
		},
		TextAccent2: {
			Name:       "cyan",
			Hex256:     fmt.Sprintf("%X", tcell.Color44.Hex()),
			Tcell256:   tcell.Color44,
			Hex24Bit:   "",
			Tcell24Bit: tcell.ColorWhite,
		},
		TextAccent3: {
			Name:       "red",
			Hex256:     fmt.Sprintf("%X", tcell.Color203.Hex()),
			Tcell256:   tcell.Color203,
			Hex24Bit:   "",
			Tcell24Bit: tcell.ColorWhite,
		},
		ActiveButtonBg: {
			Name:       "red",
			Hex256:     fmt.Sprintf("%X", tcell.Color203.Hex()),
			Tcell256:   tcell.Color203,
			Hex24Bit:   "",
			Tcell24Bit: tcell.ColorWhite,
		},
		ActiveButtonFg: {
			Name:       "",
			Hex256:     fmt.Sprintf("%X", tcell.ColorWhite.Hex()),
			Tcell256:   tcell.ColorWhite,
			Hex24Bit:   "",
			Tcell24Bit: tcell.ColorWhite,
		},
		InactiveButtonBg: {
			Name:       "dark off-white",
			Hex256:     fmt.Sprintf("%X", tcell.Color188.Hex()),
			Tcell256:   tcell.Color188,
			Hex24Bit:   "",
			Tcell24Bit: tcell.ColorWhite,
		},
		InactiveButtonFg: {
			Name:       "dark grey",
			Hex256:     fmt.Sprintf("%X", tcell.Color239.Hex()),
			Tcell256:   tcell.Color239,
			Hex24Bit:   "",
			Tcell24Bit: tcell.ColorWhite,
		},
		MenuActiveBg: {
			Name:       "",
			Hex256:     fmt.Sprintf("%X", tcell.Color188.Hex()),
			Tcell256:   tcell.Color188,
			Hex24Bit:   "",
			Tcell24Bit: tcell.ColorWhite,
		},
		MenuInactiveFg: {
			Name:       "",
			Hex256:     fmt.Sprintf("%X", tcell.Color141.Hex()),
			Tcell256:   tcell.Color141,
			Hex24Bit:   "",
			Tcell24Bit: tcell.ColorWhite,
		},
		InputFieldFg: {
			Name:       "very dark gray",
			Hex256:     fmt.Sprintf("%X", tcell.Color234.Hex()),
			Tcell256:   tcell.Color234,
			Hex24Bit:   "",
			Tcell24Bit: tcell.ColorWhite,
		},
		InputFieldBg: {
			Name:       "light off-white",
			Hex256:     fmt.Sprintf("%X", tcell.Color254.Hex()),
			Tcell256:   tcell.Color254,
			Hex24Bit:   "",
			Tcell24Bit: tcell.ColorWhite,
		},
		WindowBg: {
			Name:       "dark purple",
			Hex256:     fmt.Sprintf("%X", tcell.Color56.Hex()),
			Tcell256:   tcell.Color56,
			Hex24Bit:   fmt.Sprintf("%X", tcell.NewRGBColor(36, 29, 55).Hex()),
			Tcell24Bit: tcell.NewRGBColor(36, 29, 55),
		},
		CLIBg: {
			Name:       "almost black",
			Hex256:     fmt.Sprintf("%X", tcell.Color236.Hex()),
			Tcell256:   tcell.Color236,
			Hex24Bit:   fmt.Sprintf("%X", tcell.NewRGBColor(40, 40, 40).Hex()),
			Tcell24Bit: tcell.NewRGBColor(40, 40, 40),
		},
	}

	DefaultColor = Color{
		Name:       "default white",
		Hex256:     fmt.Sprintf("%X", tcell.ColorWhite.Hex()),
		Tcell256:   tcell.ColorWhite,
		Hex24Bit:   fmt.Sprintf("%X", tcell.ColorWhite.Hex()),
		Tcell24Bit: tcell.ColorWhite,
	}
)

type Element int

type Color struct {
	Name string

	Hex256   string
	Tcell256 tcell.Color

	Hex24Bit   string
	Tcell24Bit tcell.Color
}

// TODO: Determine what color mode to use
func Hex(e Element) string {
	if c, ok := ColorMap[e]; ok {
		return c.Hex24Bit
	}

	return DefaultColor.Hex24Bit
}

// TODO: Determine what color mode to use
func Tcell(e Element) tcell.Color {
	if c, ok := ColorMap[e]; ok {
		return c.Tcell24Bit
	}

	return DefaultColor.Tcell24Bit
}
