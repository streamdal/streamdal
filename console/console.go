package console

import (
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/charmbracelet/log"
	"github.com/gdamore/tcell/v2"
	"github.com/pkg/errors"
	"github.com/rivo/tview"

	"github.com/streamdal/snitch-cli/config"
	"github.com/streamdal/snitch-cli/types"
)

const (
	MenuString = `Q ["Q"][darkcyan]Quit[white][""]  ` +
		`S ["S"][darkcyan]Select Component[white][""]  ` +
		`R ["R"][darkcyan]Set Sample Rate[white][""]  ` +
		`F ["F"][darkcyan]Filter[white][""]  ` +
		`P ["P"][darkcyan]Pause[white][""]  ` +
		`/ ["Search"][darkcyan]Search[white][""]`

	PrimitiveInfoModal  = "info_modal"
	PrimitiveRetryModal = "retry_modal"
	PrimitiveErrorModal = "error_modal"
	PrimitiveList       = "list"
	PrimitivePeekView   = "peek_view"
	PrimitiveFilter     = "filter"

	PageConnectionAttempt = "page_" + PrimitiveInfoModal
	PageConnectionRetry   = "page_" + PrimitiveRetryModal
	PageSelectComponent   = "page_" + PrimitiveList
	PagePeekError         = "page_" + PrimitiveErrorModal
	PagePeekView          = "page_" + PrimitivePeekView
	PageFilter            = "page_" + PrimitiveFilter
)

type Console struct {
	app     *tview.Application
	layout  *tview.Flex
	menu    *tview.TextView
	pages   *tview.Pages
	options *Options
	log     *log.Logger
	started bool
}

type Options struct {
	Config *config.Config
	Logger *log.Logger
}

func New(opts *Options) (*Console, error) {
	if err := validateOptions(opts); err != nil {
		return nil, errors.Wrap(err, "unable to validate config")
	}

	c := &Console{
		options: opts,
		log:     opts.Logger.WithPrefix("console"),
	}

	if err := c.initializeComponents(); err != nil {
		return nil, errors.Wrap(err, "unable to initialize components")
	}

	return c, nil
}

func (c *Console) SetInputCapture(f func(event *tcell.EventKey) *tcell.EventKey) {
	c.app.SetInputCapture(f)
}

func (c *Console) GetInputCapture() func(event *tcell.EventKey) *tcell.EventKey {
	return c.app.GetInputCapture()
}

func (c *Console) SetMenuEntryOn(item string) {
	c.toggleMenuEntry(item, true)
}

func (c *Console) SetMenuEntryOff(item string) {
	c.toggleMenuEntry(item, false)
}

func (c *Console) toggleMenuEntry(text string, on bool) {
	menu := c.menu.GetText(false)

	replaceOld := text
	replaceNew := "[lightcyan]" + text + "[-]"
	updatedMenu := ""

	if !on {
		replaceOld = replaceNew
		replaceNew = text
	}

	updatedMenu = strings.Replace(menu, replaceOld, replaceNew, -1)

	c.app.QueueUpdateDraw(func() {
		c.menu.Clear()
		fmt.Fprint(c.menu, updatedMenu)
	})
}

func (c *Console) DisplayFilter(defaultValue string, answerCh chan<- string) {
	c.Start()

	// Remove all menu highlights - you cannot access menu while in filter view
	c.app.QueueUpdateDraw(func() {
		c.menu.Highlight()
	})

	var hit bool
	var input string

	form := tview.NewForm().
		AddInputField("", defaultValue, 30, nil, func(text string) {
			hit = true
			input = text
		}).
		AddButton("OK", func() {
			// Use the original value if te user didn't edit input field
			if !hit {
				input = defaultValue
			}

			answerCh <- input
		}).
		AddButton("Reset", func() {
			answerCh <- ""
		}).
		AddButton("Cancel", func() {
			// Return the original value
			answerCh <- defaultValue
		})

	form.SetBorder(true).SetTitle("Set filter")
	form.SetButtonsAlign(tview.AlignCenter)

	inputDialog := Center(form, 36, 7)
	c.pages.AddPage(PageFilter, inputDialog, true, true)
}

// DisplayPeek will display peek + write any actions we receive from the user
// to the action channel; the action channel is read by the peek() method.
// Accepts an _optional_ pagePeek to facilitate re-use of the peek view. This
// is needed so that when filter/pause is applied, the peek view retains the
// data captured within it.
func (c *Console) DisplayPeek(pagePeek *tview.TextView, title string, actionCh chan<- *types.Action) *tview.TextView {
	c.Start()

	if pagePeek == nil {
		pagePeek = tview.NewTextView()
	}

	pagePeek.SetBorder(true)
	pagePeek.SetTitle(title)
	pagePeek.SetDynamicColors(true)

	c.menu.Highlight("Q", "S", "P", "R", "F", "Search")

	c.app.SetInputCapture(func(event *tcell.EventKey) *tcell.EventKey {
		if event.Key() == tcell.KeyRune && event.Rune() == 'q' {
			c.log.Debug("quit keypress")

			actionCh <- &types.Action{
				Step: types.StepQuit,
			}
		}

		if event.Key() == tcell.KeyRune && event.Rune() == 's' {
			c.log.Debug("select keypress")

			actionCh <- &types.Action{
				Step: types.StepSelect,
			}
		}

		if event.Key() == tcell.KeyRune && event.Rune() == 'p' {
			c.log.Debug("pause keypress")

			actionCh <- &types.Action{
				Step: types.StepPause,
			}
		}

		if event.Key() == tcell.KeyRune && event.Rune() == 'f' {
			c.log.Debug("filter keypress")

			actionCh <- &types.Action{
				Step:          types.StepFilter,
				PeekComponent: title,
			}
		}

		return event
	})

	c.pages.AddPage(PagePeekView, pagePeek, true, true)
	c.pages.SwitchToPage(PagePeekView)
	c.app.Draw()

	return pagePeek
}

func (c *Console) Start() {
	if c.started {
		return
	}

	go func() {
		c.app.SetRoot(c.layout, true).SetFocus(c.pages)

		// Set global captures
		c.app.SetInputCapture(func(event *tcell.EventKey) *tcell.EventKey {
			if event.Key() == tcell.KeyRune && event.Rune() == 'q' {
				c.app.Stop()
				os.Exit(0)
			}

			return event
		})

		if err := c.app.Run(); err != nil {
			panic("unable to .Run app")
		}
	}()

	c.started = true

	return
}

// DisplayRetryModal will display a modal with a given message + retry/quit buttons.
func (c *Console) DisplayRetryModal(msg string, answerCh chan bool) {
	c.Start()

	retryModal := tview.NewModal().
		SetText(msg).
		AddButtons([]string{"Retry", "Quit"}).
		SetDoneFunc(func(buttonIndex int, buttonLabel string) {
			if buttonIndex == 0 {
				answerCh <- true
			} else {
				answerCh <- false
			}
		})

	c.pages.AddPage(PageConnectionRetry, retryModal, true, true)
	c.pages.SwitchToPage(PageConnectionRetry)
	c.app.Draw()
}

// DisplayInfoModal will display an animated modal with the given message.
// InputCh is used by caller to indicate that the modal can be closed (in this
// case, it will cause the method to stop the animation goroutine).
// OutputCh is used by method to inform caller that the user has exited the modal.
func (c *Console) DisplayInfoModal(msg string, inputCh, outputCh chan error) {
	c.Start()

	// Needed to improve the way the "animation" looks
	msg = msg + " "

	infoModal := tview.NewModal().
		SetText(msg).
		AddButtons([]string{"Cancel"}).
		SetDoneFunc(func(buttonIndex int, buttonLabel string) {
			if buttonIndex == 0 {
				outputCh <- errors.New("user cancelled modal")
			}
		})

	// First time seeing this component - launch progress update goroutine; once
	// goroutine exits, it removes the component from the primitives map as well
	go func() {
		animationElements := []string{"⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"}
		ticker := time.NewTicker(time.Millisecond * 100)

		iter := 0

		defer ticker.Stop()

	MAIN:
		for {
			select {
			case <-inputCh:
				// Told to quit
				break MAIN
			case <-ticker.C:
				if iter == len(animationElements) {
					iter = 0
				}

				c.app.QueueUpdateDraw(func() {
					infoModal.SetText(fmt.Sprintf("%s[gray]%s[white]", msg, animationElements[iter]))
				})

				iter += 1
			}
		}
	}()

	c.pages.AddPage(PageConnectionAttempt, infoModal, true, true)
	c.pages.SwitchToPage(PageConnectionAttempt)
	c.app.Draw()
}

func (c *Console) Stop() {
	if c.started {
		c.app.Stop()
	}
}

func (c *Console) DisplayErrorModal(msg string) {
	c.Start()

	// There is no need to re-use the component here, as it does not get updates

	retryModal := tview.NewModal().
		SetText(msg).
		AddButtons([]string{"Quit"}).
		SetDoneFunc(func(buttonIndex int, buttonLabel string) {
			if buttonIndex == 0 {
				c.app.Stop()
			}
		})

	c.pages.AddPage(PagePeekError, retryModal, true, true)
	c.pages.SwitchToPage(PagePeekError)
	c.app.Draw()
}

func Center(p tview.Primitive, width, height int) tview.Primitive {
	return tview.NewFlex().
		AddItem(nil, 0, 1, false).
		AddItem(tview.NewFlex().SetDirection(tview.FlexRow).
			AddItem(nil, 0, 1, false).
			AddItem(p, height, 1, true).
			AddItem(nil, 0, 1, false), width, 1, true).
		AddItem(nil, 0, 1, false)
}

// DisplaySelectList will display a list of items and return the select item on the
// output channel
func (c *Console) DisplaySelectList(title string, items []string, output chan<- string) {
	selectComponent := tview.NewList()
	selectComponent.SetBorder(true)
	selectComponent.SetTitle(title)

	for _, v := range items {
		item := v

		selectComponent.AddItem(v, "Awesome thing", 0, func() {
			output <- item
		})
	}

	// Put this in a flex primitive so we can center it
	selectComponentFlex := tview.NewFlex().
		AddItem(nil, 0, 1, false).
		AddItem(tview.NewFlex().
			SetDirection(tview.FlexRow).
			AddItem(nil, 0, 1, false).
			AddItem(selectComponent, 10, 1, true).
			AddItem(nil, 0, 1, false), 48, 1, true).
		AddItem(nil, 0, 1, false)

	// Add Page
	c.pages.AddPage(PageSelectComponent, selectComponentFlex, true, true)
	c.pages.SwitchToPage(PageSelectComponent)
	c.app.Draw()
}

func (c *Console) initializeComponents() error {
	c.app = tview.NewApplication()
	c.pages = tview.NewPages()

	// Only highlight Quit at this time
	c.menu = c.newMenu()
	c.menu.Highlight("Q")

	// Create Layout
	c.layout = tview.NewFlex().
		SetDirection(tview.FlexRow).
		AddItem(c.pages, 0, 1, true).
		AddItem(c.menu, 1, 1, false)

	return nil
}

func (c *Console) newMenu() *tview.TextView {
	menu := tview.NewTextView().SetWrap(false).SetDynamicColors(true)

	fmt.Fprint(menu, MenuString)

	return menu
}

func validateOptions(opts *Options) error {
	if opts == nil {
		return errors.New("options cannot be nil")
	}

	if opts.Config == nil {
		return errors.New(".Config cannot be nil")
	}

	if opts.Logger == nil {
		return errors.New(".Logger cannot be nil")
	}

	return nil
}
