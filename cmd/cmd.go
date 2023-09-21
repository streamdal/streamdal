package cmd

import (
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/charmbracelet/log"
	"github.com/pkg/errors"
	"github.com/rivo/tview"

	"github.com/streamdal/snitch-cli/config"
	"github.com/streamdal/snitch-cli/console"
	"github.com/streamdal/snitch-cli/types"
)

type Cmd struct {
	paused  bool
	filter  string
	options *Options
	log     *log.Logger
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
	// TODO: Remove highlights for everything in menu

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

	// We want to go back to peek() with the same component as before + set the
	// new filter string.
	return &types.Action{
		Step:          types.StepPeek,
		PeekComponent: action.PeekComponent,
		PeekFilter:    filterStr,
	}, nil
}

func (c *Cmd) actionConnect(_ *types.Action) (*types.Action, error) {
	msg := fmt.Sprintf("Connecting to %s ", c.options.Config.Server)

	inputCh := make(chan error, 1)
	outputCh := make(chan error, 1)

	c.options.Console.DisplayInfoModal(msg, inputCh, outputCh)

	// TODO: Should read from outputCh to detect user cancellation

	// Launch connection attempt
	if err := c.connect(); err != nil {
		retryMsg := fmt.Sprintf("[white:red]ERROR: Unable to connect![white:red]\n\n%s", err)
		inputCh <- errors.New(retryMsg) // tell displayInfoModal to quit

		retryCh := make(chan bool, 1)

		c.options.Console.DisplayRetryModal(retryMsg, retryCh)
		retry := <-retryCh

		if retry {
			return &types.Action{Step: types.StepConnect}, nil
		} else {
			return &types.Action{Step: types.StepQuit}, nil
		}
	}

	return &types.Action{
		Step: types.StepSelect,
	}, nil
}

func (c *Cmd) actionSelect(_ *types.Action) (*types.Action, error) {
	componentCh := make(chan string, 1)

	// TODO: We are connected, display list of available components
	c.options.Console.DisplaySelectList("Select component", []string{"Component 1", "Component 2"}, componentCh)

	component := <-componentCh

	return &types.Action{
		Step:          types.StepPeek,
		Args:          []string{component},
		PeekComponent: component,
	}, nil
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

	// Ready to peek; display peek view
	textView := c.options.Console.DisplayPeek(action.PeekComponent, actionCh)

	for {
		respAction, err := c.peek(action, textView, actionCh)
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

func (c *Cmd) connect() error {
	time.Sleep(3 * time.Second)
	//return errors.New("something broke because of Erick")
	return nil
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
				c.options.Console.SetPause()

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

			return cmd, nil
		case data := <-dataCh:
			if !strings.Contains(data, action.PeekFilter) {
				continue
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
