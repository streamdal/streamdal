//go:build windows

package util

import (
	"os"
)

func RedirectStdErr(f *os.File) {
	// todo: how to redirect low-level errors on windows to a file?
}
