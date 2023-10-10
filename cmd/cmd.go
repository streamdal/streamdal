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

	"github.com/streamdal/snitch-cli/api"
	"github.com/streamdal/snitch-cli/config"
	"github.com/streamdal/snitch-cli/console"
	"github.com/streamdal/snitch-cli/types"
	"github.com/streamdal/snitch-cli/util"
)

const (
	SearchHighlightFmt = "[blue:gray]%s[-:-]"
)

type Cmd struct {
	api            *api.API
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
		// TODO: Create an interface for API
		//api:     api.NewUninitialized(),
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
	case types.StepTail:
		resp, err = c.actionTail(action)
	case types.StepFilter:
		resp, err = c.actionFilter(action)
	case types.StepSearch:
		resp, err = c.actionSearch(action)
	case types.StepRate:
		resp, err = c.actionRate(action)
	case types.StepQuit:
		c.options.Console.Stop()
		os.Exit(0)
	case types.StepPause:
		// Pause is only possible from tail() so that's where we want to go back
		resp, err = c.actionTail(action)
	default:
		err = errors.Errorf("unknown action step: %d", action.Step)
	}

	if err != nil {
		return errors.Wrap(err, "unable to run action")
	}

	return c.run(resp)
}

// Filter view can only be triggered if we came from tail so it makes sense
// for us to go back to tail() after the filter view is closed.
func (c *Cmd) actionFilter(action *types.Action) (*types.Action, error) {
	// Disable input capture while in Filter
	origCapture := c.options.Console.GetInputCapture()
	c.options.Console.SetInputCapture(nil)
	defer c.options.Console.SetInputCapture(origCapture)

	// Channel used for reading resp from filter dialog
	answerCh := make(chan string)

	// Display modal
	go func() {
		c.options.Console.DisplayFilter(action.TailFilter, answerCh)
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

	// We want to go back to tail() with the same component as before + set the
	// new filter string.
	return &types.Action{
		Step:          types.StepTail,
		TailComponent: action.TailComponent,
		TailSearch:    action.TailSearch,
		TailRate:      action.TailRate,
		TailFilter:    filterStr,
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
		c.options.Console.DisplaySearch(action.TailSearch, answerCh)
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

	// Only way to get to "search" is via tail, so the next step is to go back
	// to tail view (with the same component as before search).
	return &types.Action{
		Step:           types.StepTail,
		TailComponent:  action.TailComponent,
		TailRate:       action.TailRate,
		TailFilter:     action.TailFilter,
		TailSearch:     searchStr,
		TailSearchPrev: action.TailSearch,
	}, nil
}

func (c *Cmd) actionRate(action *types.Action) (*types.Action, error) {
	// Disable input capture while in Rate
	origCapture := c.options.Console.GetInputCapture()
	c.options.Console.SetInputCapture(nil)
	defer c.options.Console.SetInputCapture(origCapture)

	// Channel used for reading resp from rate dialog
	answerCh := make(chan int)

	// Display modal
	go func() {
		c.options.Console.DisplayRate(action.TailRate, answerCh)
	}()

	// OK == rate the user chose; Cancel == original rate; Reset == 0
	rate := <-answerCh

	// TODO: Set sample rate on server

	// Turn on/off "Rate" menu entry depending on if Rate is not 0
	if rate != 0 {
		c.options.Console.SetMenuEntryOn("Set Sample Rate")
	} else {
		c.options.Console.SetMenuEntryOff("Set Sample Rate")
	}

	// Only way to get to "set sample rate" is via Tail so we always tell resp
	// to go back to that view.
	return &types.Action{
		Step:          types.StepTail,
		TailComponent: action.TailComponent,
		TailRate:      rate,
		TailSearch:    action.TailSearch,
		TailFilter:    action.TailFilter,
	}, nil
}

func (c *Cmd) actionConnect(_ *types.Action) (*types.Action, error) {
	msg := fmt.Sprintf("Connecting to [::u]%s[::-] ", c.options.Config.Server)

	userQuit := false
	inputCh := make(chan struct{}, 1)
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
			// user pressed "cancel" - tell connect() to exit early
			case <-outputCh:

				c.log.Error("user pressed cancel")
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
		// If user pressed "cancel" - no need to display retry modal
		if userQuit {
			return &types.Action{Step: types.StepQuit}, nil
		}

		retryMsg := fmt.Sprintf("[white:red]ERROR: Unable to connect![white:red]\n\n%s", err)
		inputCh <- struct{}{} // tell displayInfoModal to quit because of error

		// Display retry modal
		retryCh := make(chan bool, 1)

		c.options.Console.DisplayRetryModal(retryMsg, "page_connection_retry", retryCh)
		retry := <-retryCh

		if retry {
			return &types.Action{Step: types.StepConnect}, nil
		} else {
			return &types.Action{Step: types.StepQuit}, nil
		}
	}

	// Need this in here in case user quit while we were connecting
	if userQuit {
		return &types.Action{Step: types.StepQuit}, nil
	}

	return &types.Action{
		Step: types.StepSelect,
	}, nil
}

func (c *Cmd) actionRetry(msg string, retryStep types.Step, pageToSwitchTo string) (*types.Action, error) {
	// Display retry modal
	retryCh := make(chan bool, 1)

	c.options.Console.DisplayRetryModal(msg, pageToSwitchTo, retryCh)
	retry := <-retryCh

	if retry {
		return &types.Action{Step: retryStep}, nil
	} else {
		return &types.Action{Step: types.StepQuit}, nil
	}
}

func (c *Cmd) actionSelect(a *types.Action) (*types.Action, error) {
	// Only highlight 'q'
	c.options.Console.ToggleAllMenuHighlights()
	c.options.Console.ToggleMenuHighlight("Q")

	// Set by dialog watching goroutine to tell us to return a quit step
	userQuit := false

	// Channel used to tell animation goroutine in DisplayInfoModal to quit
	quitAnimationCh := make(chan struct{}, 1)
	defer close(quitAnimationCh)

	// Channel is written to by DisplayInfoModal() when user clicks "Quit"
	answerCh := make(chan error, 1)

	// Channel used to signal dialog goroutine to exit
	fetchDoneCh := make(chan struct{}, 1)

	defer close(fetchDoneCh)

	// Channel to tell answerCh reader goroutine to exit
	fetchQuitCh := make(chan struct{}, 1)
	defer close(fetchQuitCh)

	ctx, cancel := context.WithCancel(context.Background())

	c.options.Console.DisplayInfoModal("Fetching live component list", quitAnimationCh, answerCh)

	// Goroutine used for reading user resp
	go func() {
		defer c.log.Info("fetchComponents dialog goroutine exiting")

		for {
			select {
			case <-answerCh:
				userQuit = true
				cancel()
				return
			case <-fetchQuitCh:
				// Tell fetchComponents() to exit early
				cancel()
				return
			case <-fetchDoneCh:
				// Channel gets closed when actionSelect() exits; way to tell
				// this goroutine to exit
				c.log.Info("component fetch goroutine got signal on fetchDoneCh")
				return
			}
		}
	}()

	// Fetch the list of audiences; if it errors, display retry
	audiences, err := c.api.GetAllLiveAudiences(ctx)
	if err != nil {
		if userQuit {
			return &types.Action{Step: types.StepQuit}, nil
		}

		return c.actionRetry(
			fmt.Sprintf("[white:red]ERROR: Unable to fetch live components![white:red]\n\n%s", err),
			types.StepSelect,
			"page_select_retry",
		)
	}

	if userQuit {
		return &types.Action{Step: types.StepQuit}, nil
	}

	// -------------------------------------------------------
	// OK we have a list of components, are there any to show?
	// -------------------------------------------------------

	if len(audiences) == 0 {
		return c.actionRetry(
			fmt.Sprint("No [::b]live[-:-:-] components!\n\nRetry fetching live components?"),
			types.StepSelect,
			"page_select_retry",
		)
	}

	// ------------------------------------------
	// We have a list of components, display them
	// ------------------------------------------

	// Disable all input capture except "q" to quit; we must do this because
	// we may have reached this view from tail() which has input capture for
	// most keyboard shortcuts and if this view gets a keypress, it will
	// cause the app to deadlock.

	selectQuitCh := make(chan struct{}, 1)

	// Grab the original input capture so we can reset it when the method exits
	origCapture := c.options.Console.GetInputCapture()
	c.options.Console.SetInputCapture(func(event *tcell.EventKey) *tcell.EventKey {
		if event.Key() == tcell.KeyRune && event.Rune() == 'q' {
			selectQuitCh <- struct{}{}
		}

		return event
	})

	defer c.options.Console.SetInputCapture(origCapture)

	c.options.Console.ToggleAllMenuHighlights()
	c.options.Console.ToggleMenuHighlight("Q")

	selectedComponentCh := make(chan string, 1)

	// Display select list
	c.options.Console.DisplaySelectList("Select component", util.AudiencesToComponentMap(audiences), selectedComponentCh)

	// Listen for "quit" or for component selection
	select {
	case <-selectQuitCh:
		return &types.Action{
			Step: types.StepQuit,
		}, nil
	case component := <-selectedComponentCh:
		return &types.Action{
			Step:          types.StepTail,
			TailComponent: component,

			// Passing these along in case we originally came from a tail w/ existing settings
			TailSearch: a.TailSearch,
			TailFilter: a.TailFilter,
			TailRate:   a.TailRate,
		}, nil
	}
}

// actionTail launches the actual tail via server + displaying the tail view.
//
// The flow here is that tail() will block until it receives a command that
// the caller (actionTail) should know about. When tail() returns, it will
// return a response action. This action is evaluated to determine IF actionTail
// should send the command all the way back to run() which will execute the
// step in the response.
//
// It makes sense to send the resp command all the way back if the step requires
// us to draw/display a new screen (such as "StepFilter" or "StepSelect").
// We would NOT want to send the command back if the step is "StepPause" since
// pause does not display a modal and can be handled entirely inside tail().
//
// We pass the actionCh to DisplayTail() so it can WRITE commands it has seen to
// the channel that is read by tail().
func (c *Cmd) actionTail(action *types.Action) (*types.Action, error) {
	c.log.Infof("rate setting: %d", action.TailRate)

	if action == nil {
		return nil, errors.New("action cannot be nil")
	}

	if action.TailComponent == "" {
		return nil, errors.New("actionTail(): bug? TailComponent cannot be empty")
	}

	actionCh := make(chan *types.Action, 1)

	// Create a new textview if this is a new tail; otherwise re-use existing view
	if c.textview == nil {
		c.textview = c.options.Console.DisplayTail(nil, action.TailComponent, actionCh)
	} else {
		c.options.Console.DisplayTail(c.textview, action.TailComponent, actionCh)
	}

	for {
		respAction, err := c.tail(action, c.textview, actionCh)
		if err != nil {
			return nil, errors.Wrap(err, "unable to tail")
		}

		// Pass back to run() which can decide what to do next
		return respAction, nil
	}
}

// Attempt to connect and query test endpoint in snitch-server
func (c *Cmd) connect(ctx context.Context) error {
	// We need this here so that the "connecting" message is visible to the user
	// AND so that we can stop sleeping and breaking out if the user quit the
	// modal.
	select {
	case <-time.After(time.Second):
		break
	case <-ctx.Done():
		return fmt.Errorf("context canceled before connecting to server")
	}

	// Attempt to talk to snitch server
	a, err := api.New(&api.Options{
		Address:        c.options.Config.Server,
		AuthToken:      c.options.Config.Auth,
		ConnectTimeout: c.options.Config.ConnectTimeout,
		DisableTLS:     c.options.Config.DisableTLS,
	})
	if err != nil {
		return errors.Wrap(err, "unable to create server client")
	}

	// Attempt to call test method
	ctx, cancel := context.WithTimeout(ctx, c.options.Config.ConnectTimeout)
	defer cancel()

	if err := a.Test(ctx); err != nil {
		return errors.Wrap(err, "unable to complete connection test")
	}

	c.api = a

	return nil
}

func (c *Cmd) tail(action *types.Action, textView *tview.TextView, actionCh <-chan *types.Action) (*types.Action, error) {
	if action == nil {
		return nil, errors.New("action cannot be nil")
	}

	if action.TailComponent == "" {
		return nil, errors.New("tail(): bug? *Action.TailComponent cannot be empty")
	}

	i := 1

	dataCh := make(chan string, 1)

	// If this is the first time we are seeing this filter, announce it
	if c.announceFilter {
		filterStatus := fmt.Sprintf(" Filter set to '%s' @ "+time.Now().Format("15:04:05"), action.TailFilter)
		filterLine := "[gray:black]" + strings.Repeat("░", 16) + filterStatus + strings.Repeat("░", 16) + "[-:-]"
		fmt.Fprintf(textView, filterLine+"\n")

		c.announceFilter = false
	}

	// TODO: This is where we'd get data from snitch-server
	go func() {
		for {
			if c.paused {
				time.Sleep(200 * time.Millisecond)
				continue
			}

			dataCh <- fmt.Sprintf("%s: line %d", action.TailComponent, i)
			time.Sleep(200 * time.Millisecond)
			i++
		}
	}()

	// Set/unset search highlight
	if action.TailSearch != "" || action.TailSearchPrev != "" {
		// We need to split so that search does not hit line num and/or timestamp field
		splitData := strings.Split(textView.GetText(false), "\n")

		var updatedData string

		for _, line := range splitData {
			if line == "" {
				continue
			}

			if strings.Contains(line, "░░░") {
				updatedData += line + "\n"
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
			if action.TailSearchPrev != "" &&
				strings.Contains(updatedContent, fmt.Sprintf(SearchHighlightFmt, action.TailSearchPrev)) {

				updatedContent = strings.Replace(updatedContent, fmt.Sprintf(SearchHighlightFmt, action.TailSearchPrev), action.TailSearchPrev, -1)
			}

			// This is a new search - highlight it but only if it's not already highlighted
			if action.TailSearch != "" &&
				!strings.Contains(updatedContent, fmt.Sprintf(SearchHighlightFmt, action.TailSearch)) &&
				strings.Contains(updatedContent, action.TailSearch) {

				updatedContent = strings.Replace(updatedContent, action.TailSearch, fmt.Sprintf(SearchHighlightFmt, action.TailSearch), -1)
			}

			updatedData += splitLine[0] + " " + splitLine[1] + " " + updatedContent + "\n"
		}

		// SetText() does not auto-redraw, need to ask app to do it
		c.options.Console.Redraw(func() {
			textView.SetText(updatedData)
		})
	}

	// Commands read here have been passed down from DisplayTail(); we need access
	// to them here so we can potentially modify how we're interacting with the
	// textView component.
	//
	// For example: When we detect a pause -> send a "pause" line to textView.
	// Or when we detect a sampling update - which would trigger us to re-start
	// tail with updated settings).
	// Or when we detect a filter update - we will update the local filter which
	// is read by <- dataCh: case.
	for {
		select {
		case cmd := <-actionCh:
			// "Pause" is special in that it does not display a modal so we
			// handle all UI/related pieces from here. For all other commands,
			// we pass the cmd back to the caller tail() (which will decide if
			// it should pass the cmd/action back to run()).
			if cmd.Step == types.StepPause {
				// Tell tail reader to pause/resume
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
			cmd.TailComponent = action.TailComponent
			cmd.TailFilter = action.TailFilter
			cmd.TailSearch = action.TailSearch
			cmd.TailSearchPrev = action.TailSearchPrev
			cmd.TailRate = action.TailRate

			return cmd, nil
		case data := <-dataCh:
			if !strings.Contains(data, action.TailFilter) {
				continue
			}

			// Highlight filtered data
			if action.TailFilter != "" {
				data = strings.Replace(data, action.TailFilter, "[green:gray]"+action.TailFilter+"[-:-]", -1)
			}

			// This will highlight the search term + underline the entire entry
			// for any new incoming data.
			if action.TailSearch != "" {
				if strings.Contains(data, action.TailSearch) {
					// Highlight just the search term
					data = strings.Replace(data, action.TailSearch, fmt.Sprintf(SearchHighlightFmt, action.TailSearch), -1)
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
