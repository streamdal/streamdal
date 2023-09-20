package types

const (
	StepConnect Step = iota
	StepSelect
	StepFilter
	StepSearch
	StepPeek
	StepQuit
	StepPause
)

type Step int

type Action struct {
	Step Step
	Args []string
}
