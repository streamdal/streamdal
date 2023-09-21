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

	// Args specifically used by peek()
	PeekComponent  string
	PeekFilter     string
	PeekSearch     string
	PeekSearchPrev string
}
