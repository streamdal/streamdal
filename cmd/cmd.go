package cmd

import (
	"fmt"
	"os"
	"time"

	"github.com/charmbracelet/log"
	"github.com/pkg/errors"
	"github.com/rivo/tview"

	"github.com/streamdal/snitch-cli/config"
	"github.com/streamdal/snitch-cli/console"
	"github.com/streamdal/snitch-cli/types"
)

type Cmd struct {
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

func (c *Cmd) actionConnect(_ *types.Action) (*types.Action, error) {
	msg := fmt.Sprintf("Connecting to %s ", c.options.Config.SnitchServerURL)

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
		Step: types.StepPeek,
		Args: []string{component},
	}, nil
}

func (c *Cmd) actionPeek(action *types.Action) (*types.Action, error) {
	if action == nil {
		return nil, errors.New("action cannot be nil")
	}

	if len(action.Args) < 1 {
		return nil, errors.New("missing arg (component name)")
	}

	actionCh := make(chan *types.Action, 1)

	// Ready to peek; display peek view
	textView := c.options.Console.DisplayPeek(action.Args[0], actionCh)

	for {
		respAction, err := c.peek(action, textView, actionCh)
		if err != nil {
			return nil, errors.Wrap(err, "unable to peek")
		}

		switch respAction.Step {
		case types.StepQuit:
			return respAction, nil
		case types.StepSelect:
			// Go back to select screen
			return respAction, nil
		case types.StepFilter:
			// TODO: Display filter modal
		case types.StepSearch:
			// TODO: Display search modal
		default:
			c.log.Errorf("unknown step: %s", respAction.Step)
			return nil, fmt.Errorf("unknown step: %d", respAction.Step)
		}
	}
}

func (c *Cmd) connect() error {
	time.Sleep(5 * time.Second)
	//return errors.New("something broke because of Erick")
	return nil
}

func (c *Cmd) peek(action *types.Action, textView *tview.TextView, actionCh <-chan *types.Action) (*types.Action, error) {
	if action == nil {
		return nil, errors.New("action cannot be nil")
	}

	if len(action.Args) < 1 {
		return nil, errors.New("peek requires at least one argument")
	}

	component := action.Args[0]

	i := 0

	dataCh := make(chan string, 1)

	// TODO: Getting peek data from snitch-server
	go func() {
		for {
			dataCh <- fmt.Sprintf("Component '%s': line %d", component, i)
			time.Sleep(200 * time.Millisecond)

			i++
		}
	}()

	// Display peek data in textview + listen to user commands and forward them
	// back to the caller for handling
	for {
		select {
		case cmd := <-actionCh:
			return cmd, nil
		case data := <-dataCh:
			if _, err := fmt.Fprint(textView, data+"\n"); err != nil {
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
