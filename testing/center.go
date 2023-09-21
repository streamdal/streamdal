package main

import "github.com/rivo/tview"

type displayType int

const (
	NoWrap   displayType = iota
	UseFlex1             // This case is problematic
	UseFlex2             // This case is problematic too
	UseGrid
)

var display = UseFlex2

func main() {
	app := tview.NewApplication()

	// The behavior is the same whether this form is actually doing things or not.
	form := tview.NewForm()
	form.SetBorder(true)
	form.AddInputField("Field 1", "text", 0, nil, nil)
	form.AddInputField("Field 2", "text", 0, nil, nil)
	form.AddButton("OK", nil)

	var prim tview.Primitive
	switch display {
	case UseFlex1:
		prim = flexWrapper(form, 40, 9)
	case UseFlex2:
		prim = flexWrapper2(form, 40, 9)
	case UseGrid:
		prim = gridWrapper(form, 40, 9)
	case NoWrap:
		fallthrough
	default:
		prim = form
	}
	if err := app.SetRoot(prim, true).EnableMouse(true).Run(); err != nil {
		panic(err)
	}
}

func gridWrapper(prim tview.Primitive, width, height int) *tview.Grid {
	return tview.NewGrid().
		SetColumns(0, width, 0).
		SetRows(0, height, 0).
		AddItem(prim, 1, 1, 1, 1, 0, 0, true)
}

// Copied from the wiki
// https://github.com/rivo/tview/wiki/Modal
func flexWrapper(p tview.Primitive, width, height int) tview.Primitive {
	return tview.NewFlex().
		AddItem(nil, 0, 1, false).
		AddItem(tview.NewFlex().SetDirection(tview.FlexRow).
			AddItem(nil, 0, 1, false).
			AddItem(p, height, 1, false).
			AddItem(nil, 0, 1, false), width, 1, true).
		AddItem(nil, 0, 1, false)
}

func flexWrapper2(p tview.Primitive, width, height int) tview.Primitive {
	return tview.NewFlex().
		AddItem(nil, 0, 1, false).
		AddItem(tview.NewFlex().SetDirection(tview.FlexRow).
			AddItem(nil, 0, 1, false).
			AddItem(p, height, 1, true). // <-- only deviation from above is setting this focus parameter
			AddItem(nil, 0, 1, false), width, 1, true).
		AddItem(nil, 0, 1, false)
}
