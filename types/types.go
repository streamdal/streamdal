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

	// GaugeUptimeSeconds is the number of seconds the CLI has been running
	GaugeUptimeSeconds = "cli_uptime_seconds"

	// CounterExecTotal is the number of times CLI is used. Increment on every start
	CounterExecTotal = "cli_exec_total"

	// CounterErrorsTotal is the number of errors that occurred during CLI execution
	CounterErrorsTotal = "cli_errors_total"

	// CounterFeaturePauseTotal is the number of times pause feature was used
	CounterFeaturePauseTotal = "cli_feature_pause_total"

	// CounterFeatureFilterTotal is the number of times filter feature was used
	CounterFeatureFilterTotal = "cli_feature_filter_total"

	// CounterFeatureSearchTotal is the number of times search feature was used
	CounterFeatureSearchTotal = "cli_feature_search_total"

	// CounterFeatureViewTotal is the number of times view options feature was used
	CounterFeatureViewTotal = "cli_feature_view_total"

	// CounterFeatureSampleTotal is the number of times sample feature was used
	CounterFeatureSampleTotal = "cli_feature_sample_total"

	// CounterFeatureSelectTotal
	CounterFeatureSelectTotal = "cli_feature_select_total"

	GaugeArgsNum = "cli_args_num"
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
	TailLineNum     int // line num we are at in tail view
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
