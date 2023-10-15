package console

import (
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/charmbracelet/log"
	"github.com/gdamore/tcell/v2"
	"github.com/pkg/errors"
	"github.com/rivo/tview"
	"github.com/streamdal/snitch-protos/build/go/protos"

	"github.com/streamdal/snitch-cli/config"
	"github.com/streamdal/snitch-cli/types"
	"github.com/streamdal/snitch-cli/util"
)

const (
	PrimitiveInfoModal  = "info_modal"
	PrimitiveRetryModal = "retry_modal"
	PrimitiveErrorModal = "error_modal"
	PrimitiveList       = "list"
	PrimitiveTailView   = "tail_view"
	PrimitiveFilter     = "filter"
	PrimitiveSearch     = "search"
	PrimitiveRate       = "rate"

	PageConnectionAttempt = "page_" + PrimitiveInfoModal
	PageConnectionRetry   = "page_" + PrimitiveRetryModal
	PageSelectComponent   = "page_" + PrimitiveList
	PageTailError         = "page_" + PrimitiveErrorModal
	PageTailView          = "page_" + PrimitiveTailView
	PageFilter            = "page_" + PrimitiveFilter
	PageSearch            = "page_" + PrimitiveSearch
	PageRate              = "page_" + PrimitiveRate

	DefaultViewOptionsPrettyJSON         = true
	DefaultViewOptionsEnableColors       = true
	DefaultViewOptionsDisplayLineNumbers = true
	DefaultViewOptionsDisplayTimestamp   = true
)

var (
	MenuString = `[white]Q[-] ["Q"][#9D87D7]Quit[-][""]  ` +
		`[white]S[-] ["S"][#9D87D7]Select Component[-][""]  ` +
		`[white]R[-] ["R"][#9D87D7::s]Set Sample Rate[-:-:-][""]  ` +
		`[white]F[-] ["F"][#9D87D7]Filter[-][""]  ` +
		`[white]P[-] ["P"][#9D87D7]Pause[-][""]  ` +
		`[white]O[-] ["O"][#9D87D7]View Options[-][""] ` +
		`[white]/[-] ["Search"][#9D87D7]Search[-][""]`
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

func (c *Console) ToggleAllMenuHighlights() {
	c.app.QueueUpdateDraw(func() {
		c.menu.Highlight(c.menu.GetHighlights()...)
	})
}

func (c *Console) ToggleMenuHighlight(regions ...string) {
	c.app.QueueUpdateDraw(func() {
		c.menu.Highlight(regions...)
	})
}

func (c *Console) SetMenuEntryOn(item string) {
	c.toggleMenuEntry(item, true)
}

func (c *Console) SetMenuEntryOff(item string) {
	c.toggleMenuEntry(item, false)
}

func (c *Console) toggleMenuEntry(text string, on bool) {
	menu := c.menu.GetText(false)

	replaceOld := fmt.Sprintf("[%s]%s[-]", Hex(MenuInactiveFg), text)
	replaceNew := fmt.Sprintf("[%s]%s[-]", Hex(MenuActiveBg), text)

	var updatedMenu string

	if !on {
		replaceOld = fmt.Sprintf("[%s]%s[-]", Hex(MenuActiveBg), text)
		replaceNew = fmt.Sprintf("[%s]%s[-]", Hex(MenuInactiveFg), text)
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

	form.SetBorder(true).SetTitle("Filter")
	form.SetBackgroundColor(Tcell(WindowBg))
	form.SetTitleColor(Tcell(TextPrimary))
	form.SetFieldBackgroundColor(Tcell(InputFieldBg))
	form.SetFieldTextColor(Tcell(InputFieldFg))
	form.SetButtonActivatedStyle(tcell.StyleDefault.Background(Tcell(ActiveButtonBg)).Foreground(Tcell(ActiveButtonFg)))
	form.SetButtonStyle(tcell.StyleDefault.Background(Tcell(InactiveButtonBg)).Foreground(Tcell(InactiveButtonFg)))
	form.SetButtonsAlign(tview.AlignCenter)

	inputDialog := Center(form, 36, 7)
	c.pages.AddPage(PageFilter, inputDialog, true, true)
}

func (c *Console) DisplaySearch(defaultValue string, answerCh chan<- string) {
	c.Start()

	// Remove all menu highlights - you cannot access menu while in search view
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
			// Use the original value if the user didn't edit input field
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

	form.SetBorder(true).SetTitle("Search")
	form.SetBackgroundColor(Tcell(WindowBg))
	form.SetTitleColor(Tcell(TextPrimary))
	form.SetFieldBackgroundColor(Tcell(InputFieldBg))
	form.SetFieldTextColor(Tcell(InputFieldFg))
	form.SetButtonActivatedStyle(tcell.StyleDefault.Background(Tcell(ActiveButtonBg)).Foreground(Tcell(ActiveButtonFg)))
	form.SetButtonStyle(tcell.StyleDefault.Background(Tcell(InactiveButtonBg)).Foreground(Tcell(InactiveButtonFg)))
	form.SetButtonsAlign(tview.AlignCenter)

	inputDialog := Center(form, 36, 7)
	c.pages.AddPage(PageSearch, inputDialog, true, true)
}

func (c *Console) DisplayViewOptions(defaultViewOptions *types.ViewOptions, answerCh chan<- *types.ViewOptions) {
	if defaultViewOptions == nil {
		defaultViewOptions = &types.ViewOptions{
			PrettyJSON:         DefaultViewOptionsPrettyJSON,
			EnableColors:       DefaultViewOptionsEnableColors,
			DisplayLineNumbers: DefaultViewOptionsDisplayLineNumbers,
			DisplayTimestamp:   DefaultViewOptionsDisplayTimestamp,
		}
	}

	c.Start()

	// Remove all menu highlights - you cannot access menu while in rate view
	c.app.QueueUpdateDraw(func() {
		c.menu.Highlight()
	})

	selectedOptions := &types.ViewOptions{
		PrettyJSON:         defaultViewOptions.PrettyJSON,
		EnableColors:       defaultViewOptions.EnableColors,
		DisplayLineNumbers: defaultViewOptions.DisplayLineNumbers,
		DisplayTimestamp:   defaultViewOptions.DisplayTimestamp,
	}

	optsDialog := tview.NewForm().
		AddCheckbox("Pretty JSON", defaultViewOptions.PrettyJSON, func(checked bool) {
			selectedOptions.PrettyJSON = checked
		}).
		AddCheckbox("Enable Colors", defaultViewOptions.EnableColors, func(checked bool) {
			selectedOptions.EnableColors = checked
		}).
		AddCheckbox("Display Timestamp", defaultViewOptions.DisplayTimestamp, func(checked bool) {
			selectedOptions.DisplayTimestamp = checked
		}).
		AddCheckbox("Display Line Numbers", defaultViewOptions.DisplayLineNumbers, func(checked bool) {
			selectedOptions.DisplayLineNumbers = checked
		}).
		AddButton("OK", func() {
			answerCh <- selectedOptions
		}).
		AddButton("Reset", func() {
			answerCh <- &types.ViewOptions{}
		}).
		AddButton("Cancel", func() {
			// Return the original value
			answerCh <- defaultViewOptions
		})

	optsDialog.SetBorder(true).SetTitle("View Options")
	optsDialog.SetBackgroundColor(Tcell(WindowBg))
	optsDialog.SetTitleColor(Tcell(TextPrimary))
	optsDialog.SetFieldBackgroundColor(Tcell(InputFieldBg))
	optsDialog.SetFieldTextColor(Tcell(InputFieldFg))
	optsDialog.SetButtonActivatedStyle(tcell.StyleDefault.Background(Tcell(ActiveButtonBg)).Foreground(Tcell(ActiveButtonFg)))
	optsDialog.SetButtonStyle(tcell.StyleDefault.Background(Tcell(InactiveButtonBg)).Foreground(Tcell(InactiveButtonFg)))
	optsDialog.SetButtonsAlign(tview.AlignCenter)

	viewOptionsDialog := Center(optsDialog, 30, 13)
	c.pages.AddPage(PageRate, viewOptionsDialog, true, true)
}

func (c *Console) DisplayRate(defaultValue int, answerCh chan<- int) {
	c.Start()

	// Remove all menu highlights - you cannot access menu while in rate view
	c.app.QueueUpdateDraw(func() {
		c.menu.Highlight()
	})

	var hit bool
	var inputStr string
	var inputInt int

	form := tview.NewForm().
		AddInputField("Rate Per Second", strconv.Itoa(defaultValue), 8, tview.InputFieldInteger, func(text string) {
			hit = true
			inputStr = text
		}).
		AddButton("OK", func() {
			// Use the original value if te user didn't edit input field
			if !hit {
				inputStr = strconv.Itoa(defaultValue)
			}

			var err error

			inputInt, err = strconv.Atoi(inputStr)
			if err != nil {
				panic(fmt.Sprintf("unexpected rate '%s' cannot be converted to int: %s", inputStr, err))
			}

			answerCh <- inputInt
		}).
		AddButton("Reset", func() {
			answerCh <- 0
		}).
		AddButton("Cancel", func() {
			// Return the original value
			answerCh <- defaultValue
		})

	form.SetBorder(true).SetTitle("Set Sample Rate")
	form.SetBackgroundColor(Tcell(WindowBg))
	form.SetTitleColor(Tcell(TextPrimary))
	form.SetFieldBackgroundColor(Tcell(InputFieldBg))
	form.SetFieldTextColor(Tcell(InputFieldFg))
	form.SetButtonActivatedStyle(tcell.StyleDefault.Background(Tcell(ActiveButtonBg)).Foreground(Tcell(ActiveButtonFg)))
	form.SetButtonStyle(tcell.StyleDefault.Background(Tcell(InactiveButtonBg)).Foreground(Tcell(InactiveButtonFg)))
	form.SetButtonsAlign(tview.AlignCenter)

	inputDialog := Center(form, 36, 7)
	c.pages.AddPage(PageRate, inputDialog, true, true)
}

// DisplayTail will display tail + write any actions we receive from the user
// to the action channel; the action channel is read by the tail() method.
// Accepts an _optional_ pageTail to facilitate re-use of the tail view. This
// is needed so that when filter/pause is applied, the tail view retains the
// data captured within it.
func (c *Console) DisplayTail(pageTail *tview.TextView, tailComponent *types.TailComponent, actionCh chan<- *types.Action) *tview.TextView {
	c.Start()

	if pageTail == nil {
		pageTail = tview.NewTextView()
		pageTail.SetBorder(true)
		pageTail.SetDynamicColors(true)
		pageTail.SetMaxLines(c.options.Config.MaxOutputLines)
	}

	// Always update title
	pageTail.SetTitle(tailComponent.Name)

	// Highlight available keystrokes
	c.app.QueueUpdateDraw(func() {
		c.menu.Highlight("Q", "S", "P", "R", "F", "O", "Search")
	})

	c.app.SetInputCapture(func(event *tcell.EventKey) *tcell.EventKey {
		if event.Key() == tcell.KeyRune && event.Rune() == 'q' {
			actionCh <- &types.Action{
				Step: types.StepQuit,
			}
		}

		if event.Key() == tcell.KeyRune && event.Rune() == 's' {
			actionCh <- &types.Action{
				Step: types.StepSelect,
			}
		}

		if event.Key() == tcell.KeyRune && event.Rune() == 'o' {
			actionCh <- &types.Action{
				Step: types.StepViewOptions,
			}
		}

		// TODO: Disabled until sampling is fully implemented in SDKs
		//if event.Key() == tcell.KeyRune && event.Rune() == 'r' {
		//	actionCh <- &types.Action{
		//		Step: types.StepRate,
		//	}
		//}

		if event.Key() == tcell.KeyRune && event.Rune() == 'p' {
			actionCh <- &types.Action{
				Step: types.StepPause,
			}
		}

		// Pass along TailComponent so that once filter view is done, tail()
		// knows what component it was operating on.
		if event.Key() == tcell.KeyRune && event.Rune() == 'f' {
			actionCh <- &types.Action{
				Step:          types.StepFilter,
				TailComponent: tailComponent,
			}
		}

		// Pass along TailComponent so that once search view is done, tail()
		// knows what component it was operating on.
		if event.Key() == tcell.KeyRune && event.Rune() == '/' {
			actionCh <- &types.Action{
				Step:          types.StepSearch,
				TailComponent: tailComponent,
			}
		}

		return event
	})

	c.pages.AddPage(PageTailView, pageTail, true, true)
	c.pages.SwitchToPage(PageTailView)

	return pageTail
}

func (c *Console) Start() {
	if c.started {
		return
	}

	go func() {
		c.app.SetRoot(c.layout, true).SetFocus(c.pages)

		if err := c.app.Run(); err != nil {
			panic("unable to .Run app: " + err.Error())
		}
	}()

	time.Sleep(100 * time.Millisecond) // Hack to give tview app enough time to start

	c.started = true

	return
}

// DisplayRetryModal will display a modal with a given message + retry/quit buttons.
func (c *Console) DisplayRetryModal(msg, pageName string, answerCh chan bool) {
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
		}).
		SetBackgroundColor(Tcell(WindowBg)).
		SetTextColor(tcell.ColorWhite).
		SetButtonActivatedStyle(tcell.StyleDefault.Background(Tcell(ActiveButtonBg)).Foreground(Tcell(ActiveButtonFg))).
		SetButtonStyle(tcell.StyleDefault.Foreground(Tcell(InactiveButtonFg)).Background(Tcell(InactiveButtonBg)))

	// Capture 'q' keypress to quit and tell caller to stop retrying
	retryModal.SetInputCapture(func(event *tcell.EventKey) *tcell.EventKey {
		if event.Key() == tcell.KeyRune && event.Rune() == 'q' {
			answerCh <- false
		}

		return event
	})

	c.pages.AddPage(pageName, retryModal, true, true)

	c.app.QueueUpdateDraw(func() {
		c.pages.SwitchToPage(pageName)
	})
}

// DisplayInfoModal will display an animated modal with the given message.
// InputCh is used by caller to indicate that the modal can be closed (in this
// case, it will cause the method to stop the animation goroutine).
// OutputCh is used by method to inform caller that the user has exited the modal.
func (c *Console) DisplayInfoModal(msg string, quitAnimationCh chan struct{}, answerCh chan error) {
	c.Start()

	// Needed to improve the way the "animation" looks
	msg = msg + " "

	infoModal := tview.NewModal().
		SetText(msg).
		AddButtons([]string{"Cancel"}).
		SetDoneFunc(func(buttonIndex int, buttonLabel string) {
			if buttonIndex == 0 {
				answerCh <- errors.New("user pressed 'cancel' button to quit")
			}
		}).
		SetBackgroundColor(Tcell(WindowBg)).
		SetTextColor(Tcell(TextPrimary)).
		SetButtonActivatedStyle(tcell.StyleDefault.Background(Tcell(ActiveButtonBg)).Foreground(Tcell(ActiveButtonFg)))

	// Capture 'q' keypress to quit
	infoModal.SetInputCapture(func(event *tcell.EventKey) *tcell.EventKey {
		if event.Key() == tcell.KeyRune && event.Rune() == 'q' {
			answerCh <- errors.New("user pressed 'q' to quit")
		}

		return event
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
			case <-quitAnimationCh:
				// Told to quit
				break MAIN
			case <-ticker.C:
				if iter == len(animationElements) {
					iter = 0
				}

				c.app.QueueUpdateDraw(func() {
					infoModal.SetText(fmt.Sprintf("%s[%s]%s[-]", msg, Hex(TextAccent3), animationElements[iter]))
				})

				iter += 1
			}
		}
	}()

	c.pages.AddPage(PageConnectionAttempt, infoModal, true, true)
	c.pages.SwitchToPage(PageConnectionAttempt)
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

	c.pages.AddPage(PageTailError, retryModal, true, true)
	c.pages.SwitchToPage(PageTailError)
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

func (c *Console) Redraw(f func()) {
	c.app.QueueUpdateDraw(f)
}

// DisplaySelectList will display a list of items and return the select item on the
// output channel
func (c *Console) DisplaySelectList(title string, audiences []*protos.Audience, answerCh chan<- *types.TailComponent) {
	selectComponent := tview.NewList()

	selectComponent.SetBackgroundColor(Tcell(WindowBg))
	selectComponent.SetMainTextColor(Tcell(TextPrimary))
	selectComponent.SetSecondaryTextColor(Tcell(TextSecondary))
	selectComponent.SetBorder(true)
	selectComponent.SetTitle(title)

	// I spent a good 15 minutes trying to find how to dynamically generate a
	// rune from an int - couldn't find anything. So, this is what we're doing.
	// ¯\_(ツ)_/¯
	i := 0
	shortcuts := []rune{'1', '2', '3', '4', '5', '6', '7', '8', '9'}

	for _, aud := range audiences {
		name := aud.OperationName
		desc := fmt.Sprintf("[::b]%s[-:-:-] / [::b]%s / [::b]%s[-:-:-]",
			aud.ServiceName,
			util.ProtosOperationTypeToStr(aud.OperationType),
			aud.ComponentName,
		)

		var shortcut rune

		if i >= len(shortcuts) {
			shortcut = '0'
		} else {
			shortcut = shortcuts[i]
		}

		selectComponent.AddItem(name, desc, shortcut, func() {
			answerCh <- util.SelectedToTailComponent(name, desc)
		})

		i++
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

	if _, err := fmt.Fprint(menu, MenuString); err != nil {
		c.log.Infof("error writing menu: %s", err)
	}

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
