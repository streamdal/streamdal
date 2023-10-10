package types

const (
	StepConnect Step = iota
	StepSelect
	StepFilter
	StepSearch
	StepTail
	StepQuit
	StepPause
	StepRate
)

type Step int

type Action struct {
	Step Step
	Args []string

	// Args specifically used by tail()
	TailComponent  string
	TailFilter     string
	TailSearch     string
	TailSearchPrev string
	TailRate       int
}
