//go:build !windows

package util

import (
	"os"
	"syscall"

	"github.com/charmbracelet/log"
)

func RedirectStdErr(f *os.File) {
	if f == nil {
		panic("file passed to redirectStdErr cannot be nil")
	}

	err := syscall.Dup2(int(f.Fd()), int(os.Stderr.Fd()))
	if err != nil {
		log.Warnf("failed to redirect stderr to file '%s': %v", f.Name(), err)
	}
}
