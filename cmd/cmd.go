package cmd

import (
	"context"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/charmbracelet/log"
	"github.com/gdamore/tcell/v2"
	"github.com/pkg/errors"
	"github.com/rivo/tview"

	"github.com/streamdal/snitch-cli/config"
	"github.com/streamdal/snitch-cli/console"
	"github.com/streamdal/snitch-cli/types"
)

const (
	SearchHighlightFmt = "[blue:gray]%s[-:-]"
)

type Cmd struct {
	textview       *tview.TextView
	previousSearch string
	paused         bool
	announceFilter bool
	options        *Options
	log            *log.Logger
}

type Options struct {
	Config  *config.Config
	Console *console.Console
	Logger  *log.Logger
}

func New(opts *Options) (*Cmd, error) {
	if err := validateOptions(opts); err != nil {
		return nil, errors.Wrap(err, "unable to validate config")
	}

	return &Cmd{
		options: opts,
		log:     opts.Logger.WithPrefix("cmd"),
	}, nil
}

// Run is the main entrypoint for starting the CLI app
func (c *Cmd) Run() error {
	// Start with a connection attempt and go from there
	return c.run(&types.Action{
		Step: types.StepConnect,
	})
}

// Run is a recursive method because the next step that will be executed is
// determined by the current step (which passes back a resp). run() accepts
// an action because it might contain arguments that the requested step might
// use. NOTE: First run() call defines the *first* step that will be executed.
func (c *Cmd) run(action *types.Action) error {
	var (
		resp *types.Action
		err  error
	)

	switch action.Step {
	case types.StepConnect:
		resp, err = c.actionConnect(action)
	case types.StepSelect:
		resp, err = c.actionSelect(action)
	case types.StepPeek:
		resp, err = c.actionPeek(action)
	case types.StepFilter:
		resp, err = c.actionFilter(action)
	case types.StepSearch:
		resp, err = c.actionSearch(action)
	case types.StepQuit:
		c.options.Console.Stop()
		os.Exit(0)
	default:
		err = errors.Errorf("unknown action step: %d", action.Step)
	}

	if err != nil {
		return errors.Wrap(err, "unable to run action")
	}

	return c.run(resp)
}

// Filter view can only be triggered if we came from peek so it makes sense
// for us to go back to peek() after the filter view is closed.
func (c *Cmd) actionFilter(action *types.Action) (*types.Action, error) {
	// Disable input capture while in Filter
	origCapture := c.options.Console.GetInputCapture()
	c.options.Console.SetInputCapture(nil)
	defer c.options.Console.SetInputCapture(origCapture)

	// Channel used for reading resp from filter dialog
	answerCh := make(chan string)

	// Display modal
	go func() {
		c.options.Console.DisplayFilter(action.PeekFilter, answerCh)
	}()

	// Wait for an answer; if the user selects "Cancel", we will get back
	// the original filter (if any); if the user selects "Reset" - we will get
	// back an empty space; if the user clicks "OK" - we will get back the
	// filter string they chose.
	filterStr := <-answerCh

	// Turn on/off "Filter" menu entry depending on if filter is set
	if filterStr != "" {
		c.options.Console.SetMenuEntryOn("Filter")
	} else {
		c.options.Console.SetMenuEntryOff("Filter")
	}

	c.announceFilter = true

	// We want to go back to peek() with the same component as before + set the
	// new filter string.
	return &types.Action{
		Step:          types.StepPeek,
		PeekComponent: action.PeekComponent,
		PeekFilter:    filterStr,
	}, nil
}

func (c *Cmd) actionSearch(action *types.Action) (*types.Action, error) {
	// Disable input capture while in Search
	origCapture := c.options.Console.GetInputCapture()
	c.options.Console.SetInputCapture(nil)
	defer c.options.Console.SetInputCapture(origCapture)

	// Channel used for reading resp from filter dialog
	answerCh := make(chan string)

	// Display modal
	go func() {
		c.options.Console.DisplaySearch(action.PeekSearch, answerCh)
	}()

	// Wait for an answer; if the user selects "Cancel", we will get back
	// the original search (if any); if the user selects "Reset" - we will get
	// back an empty string; if the user clicks "OK" - we will get back the
	// search string they chose.
	searchStr := <-answerCh

	// Turn on/off "Filter" menu entry depending on if filter is set
	if searchStr != "" {
		c.options.Console.SetMenuEntryOn("Search")
	} else {
		c.options.Console.SetMenuEntryOff("Search")
	}

	// Only way to get to "search" is via peek, so the next step is to go back
	// to peek view (with the same component as before search).
	return &types.Action{
		Step:           types.StepPeek,
		PeekComponent:  action.PeekComponent,
		PeekSearch:     searchStr,
		PeekSearchPrev: action.PeekSearch,
	}, nil
}

func (c *Cmd) actionConnect(_ *types.Action) (*types.Action, error) {
	msg := fmt.Sprintf("Connecting to %s ", c.options.Config.Server)

	userQuit := false
	inputCh := make(chan error, 1)
	outputCh := make(chan error, 1)

	// Channel to tell outputCh reader goroutine to exit
	quitCh := make(chan struct{}, 1)
	defer close(quitCh)

	ctx, cancel := context.WithCancel(context.Background())

	c.options.Console.DisplayInfoModal(msg, inputCh, outputCh)

	// Goroutine used for reading user resp
	go func() {
		for {
			select {
			case <-outputCh:
				userQuit = true
				cancel()
				return
			case <-quitCh:
				// Tell connect() to exit early
				cancel()
				return
			}
		}
	}()

	// Launch connection attempt
	if err := c.connect(ctx); err != nil {
		retryMsg := fmt.Sprintf("[white:red]ERROR: Unable to connect![white:red]\n\n%s", err)
		inputCh <- errors.New(retryMsg) // tell displayInfoModal to quit because of error

		// Display retry modal
		retryCh := make(chan bool, 1)

		c.options.Console.DisplayRetryModal(retryMsg, retryCh)
		retry := <-retryCh

		if retry {
			return &types.Action{Step: types.StepConnect}, nil
		} else {
			return &types.Action{Step: types.StepQuit}, nil
		}
	}

	if userQuit {
		return &types.Action{Step: types.StepQuit}, nil
	}

	return &types.Action{
		Step: types.StepSelect,
	}, nil
}

func (c *Cmd) actionSelect(_ *types.Action) (*types.Action, error) {
	// Disable all input capture except "q" to quit; we must do this because
	// we may have reached this view from peek() which has input capture for
	// most keyboard shortcuts and if this view gets a keypress, it will
	// cause the app to deadlock.

	quitCh := make(chan struct{}, 1)

	// Grab the original input capture so we can reset it when the method exits
	origCapture := c.options.Console.GetInputCapture()
	c.options.Console.SetInputCapture(func(event *tcell.EventKey) *tcell.EventKey {
		if event.Key() == tcell.KeyRune && event.Rune() == 'q' {
			quitCh <- struct{}{}
		}

		return event
	})

	defer c.options.Console.SetInputCapture(origCapture)

	c.options.Console.ToggleAllMenuHighlights()
	c.options.Console.ToggleMenuHighlight("Q")

	componentCh := make(chan string, 1)

	// TODO: We are connected, display list of available components
	c.options.Console.DisplaySelectList("Select component", []string{"Component 1", "Component 2"}, componentCh)

	// Listen for "quit" or for component selection
	select {
	case <-quitCh:
		return &types.Action{
			Step: types.StepQuit,
		}, nil
	case component := <-componentCh:
		return &types.Action{
			Step:          types.StepPeek,
			PeekComponent: component,
		}, nil
	}
}

// actionPeek launches the actual peek via server + displaying the peek view.
//
// The flow here is that peek() will block until it receives a command that
// the caller (actionPeek) should know about. When peek() returns, it will
// return a response action. This action is evaluated to determine IF actionPeek
// should send the command all the way back to run() which will execute the
// step in the response.
//
// It makes sense to send the resp command all the way back if the step requires
// us to draw/display a new screen (such as "StepFilter" or "StepSelect").
// We would NOT want to send the command back if the step is "StepPause" since
// pause does not display a modal and can be handled entirely inside peek().
//
// We pass the actionCh to DisplayPeek() so it can WRITE commands it has seen to
// the channel that is read by peek().
func (c *Cmd) actionPeek(action *types.Action) (*types.Action, error) {
	if action == nil {
		return nil, errors.New("action cannot be nil")
	}

	if action.PeekComponent == "" {
		return nil, errors.New("actionPeek(): bug? PeekComponent cannot be empty")
	}

	actionCh := make(chan *types.Action, 1)

	// Create a new textview if this is a new peek; otherwise re-use existing view
	if c.textview == nil {
		c.textview = c.options.Console.DisplayPeek(nil, action.PeekComponent, actionCh)
	} else {
		c.options.Console.DisplayPeek(c.textview, action.PeekComponent, actionCh)
	}

	for {
		respAction, err := c.peek(action, c.textview, actionCh)
		if err != nil {
			return nil, errors.Wrap(err, "unable to peek")
		}

		switch respAction.Step {
		case types.StepQuit:
			// Pass action back to run so that it can handle exit
			return respAction, nil
		case types.StepSelect:
			// Pass action back to run which will display select screen
			return respAction, nil
		case types.StepFilter:
			// Pass action back to run which will display filter screen
			return respAction, nil
		case types.StepSearch:
			// Pass action back to run which will display search screen
			return respAction, nil
		case types.StepPause:
			// Do nothing because pause does not display a modal - it only
			// updates the <menu> entry to show that is selected + causes
			// peek() to not read any data from the dataCh while paused.
			//
			// We *specifically* do not pass the action back to run() because
			// that will cause actionPeek to end.
		default:
			c.log.Errorf("unknown step: %s", respAction.Step)
			return nil, fmt.Errorf("unknown step: %d", respAction.Step)
		}
	}
}

// Dummy connect - this should be actual snitch server connect code
func (c *Cmd) connect(ctx context.Context) error {
	// Attempt to talk to snitch server

	for {
		select {
		// Happy path - nothing went wrong
		case <-time.After(1 * time.Second): // WARNING: This is here for demo purposes!
			return nil
			//return errors.New("something broke")
		case <-ctx.Done():
			return nil
		}
	}

}

func (c *Cmd) peek(action *types.Action, textView *tview.TextView, actionCh <-chan *types.Action) (*types.Action, error) {
	if action == nil {
		return nil, errors.New("action cannot be nil")
	}

	if action.PeekComponent == "" {
		return nil, errors.New("peek(): bug? *Action.PeekComponent cannot be empty")
	}

	i := 1

	dataCh := make(chan string, 1)

	if c.announceFilter {
		filterStatus := fmt.Sprintf(" Filter set to '%s' @ "+time.Now().Format("15:04:05"), action.PeekFilter)
		filterLine := "[gray:black]" + strings.Repeat("░", 16) + filterStatus + strings.Repeat("░", 16) + "[-:-]"
		fmt.Fprintf(textView, filterLine+"\n")

		c.announceFilter = false
	}

	// TODO: Getting peek data from snitch-server
	go func() {
		for {
			if c.paused {
				time.Sleep(200 * time.Millisecond)
				continue
			}

			dataCh <- fmt.Sprintf("Component '%s': line %d", action.PeekComponent, i)
			time.Sleep(200 * time.Millisecond)
			i++
		}
	}()

	// Search highlighting logic
	if action.PeekSearch != "" || action.PeekSearchPrev != "" {
		// We need to split so that search does not hit line num and/or timestamp field
		splitData := strings.Split(textView.GetText(false), "\n")

		var updatedData string

		for _, line := range splitData {
			if line == "" {
				continue
			}

			splitLine := strings.SplitN(line, " ", 3)

			if len(splitLine) < 3 {
				updatedData += line + "\n"
				continue
			}

			// splitLine[0]: line num
			// splitLine[1]: timestamp
			// splitLine[2]: content

			updatedContent := splitLine[2]

			// If we are coming from a previous search, clear the old highlights first
			if action.PeekSearchPrev != "" {
				updatedContent = strings.Replace(updatedContent, fmt.Sprintf(SearchHighlightFmt, action.PeekSearchPrev), action.PeekSearchPrev, -1)
			}

			// If this is a new search, highlight all instances of the search term
			if action.PeekSearch != "" {
				updatedContent = strings.Replace(updatedContent, action.PeekSearch, fmt.Sprintf(SearchHighlightFmt, action.PeekSearch), -1)
			}

			updatedData += splitLine[0] + " " + splitLine[1] + " " + updatedContent + "\n"
		}

		//existingData := textView.GetText(false)
		//existingData = strings.Replace(existingData, action.PeekSearch, fmt.Sprintf(SearchHighlightFmt, action.PeekSearch), -1)
		textView.SetText(updatedData)
	}

	// Commands read here have been passed down from DisplayPeek(); we need access
	// to them here so we can potentially modify how we're interacting with the
	// textView component.
	//
	// For example: When we detect a pause -> send a "pause" line to textView.
	// Or when we detect a sampling update - which would trigger us to re-start
	// peek with updated settings).
	// Or when we detect a filter update - we will update the local filter which
	// is read by <- dataCh: case.
	for {
		select {
		case cmd := <-actionCh:
			// If this is a filter step -> pass action back to peek() so it can
			// return it to the main display loop.

			if cmd.Step == types.StepPause {
				// Tell peek reader to pause/resume
				c.paused = !c.paused

				// Update the menu pause button visual
				if c.paused {
					c.options.Console.SetMenuEntryOn("Pause")
				} else {
					c.options.Console.SetMenuEntryOff("Pause")
				}

				pausedStatus := " PAUSED @ " + time.Now().Format("15:04:05")

				if !c.paused {
					pausedStatus = " RESUMED @ " + time.Now().Format("15:04:05")
				}

				pauseLine := "[gray:black]" + strings.Repeat("░", 16) + pausedStatus + strings.Repeat("░", 16) + "[-:-]"
				fmt.Fprint(textView, pauseLine+"\n")
			}

			// Re-inject settings
			cmd.PeekComponent = action.PeekComponent
			cmd.PeekFilter = action.PeekFilter
			cmd.PeekSearch = action.PeekSearch

			return cmd, nil
		case data := <-dataCh:
			if !strings.Contains(data, action.PeekFilter) {
				continue
			}

			// Highlight filtered data
			if action.PeekFilter != "" {
				data = strings.Replace(data, action.PeekFilter, "[green:gray]"+action.PeekFilter+"[-:-]", -1)
			}

			// This will highlight the search term + underline the entire entry
			// for any new incoming data.
			if action.PeekSearch != "" {
				if strings.Contains(data, action.PeekSearch) {
					// Highlight just the search term
					data = strings.Replace(data, action.PeekSearch, fmt.Sprintf(SearchHighlightFmt, action.PeekSearch), -1)
				}
			}

			prefix := fmt.Sprintf(`%d: [gray:black]`+time.Now().Format("15:04:05")+`[-:-] `, i)

			if _, err := fmt.Fprint(textView, prefix+data+"\n"); err != nil {
				c.log.Errorf("unable to write to textview: %s", err)
			}

			textView.ScrollToEnd()
		}
	}
}

func validateOptions(opts *Options) error {
	if opts == nil {
		return errors.New("options cannot be nil")
	}

	if opts.Config == nil {
		return errors.New(".Config cannot be nil")
	}

	if opts.Console == nil {
		return errors.New(".Console cannot be nil")
	}

	if opts.Logger == nil {
		return errors.New(".Logger cannot be nil")
	}

	return nil
}
