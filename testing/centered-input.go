package main

import (
	"github.com/rivo/tview"
)

func main() {
	app := tview.NewApplication()

	form := tview.NewForm().
		AddInputField("", "Existing input", 30, nil, nil).
		AddButton("OK", func() {
			app.Stop()
		}).
		AddButton("Reset", func() {
			app.Stop()
		}).
		AddButton("Cancel", func() {
			app.Stop()
		})

	form.SetBorder(true).SetTitle("Set filter")
	form.SetButtonsAlign(tview.AlignCenter)

	inputDialog := Center(form, 36, 7)

	// Fullscreen must be true for centering to work
	if err := app.SetRoot(inputDialog, true).EnableMouse(true).Run(); err != nil {
		panic(err)
	}
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
