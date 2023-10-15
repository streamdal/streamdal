package types

import (
	"github.com/streamdal/snitch-protos/build/go/protos"
)

const (
	StepConnect Step = iota
	StepSelect
	StepFilter
	StepSearch
	StepTail
	StepQuit
	StepPause
	StepRate
	StepViewOptions
)

type Step int

type Action struct {
	Step Step
	Args []string

	// Args specifically used by tail()
	TailComponent   *TailComponent
	TailFilter      string
	TailSearch      string
	TailSearchPrev  string
	TailRate        int
	TailViewOptions *ViewOptions
}

// TailComponent is used to display audiences in the "select component" view
type TailComponent struct {
	Name        string
	Description string
	Audience    *protos.Audience
}

type ViewOptions struct {
	PrettyJSON         bool
	EnableColors       bool
	DisplayTimestamp   bool
	DisplayLineNumbers bool
}
