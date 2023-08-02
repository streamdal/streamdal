package types

import (
	"github.com/streamdal/snitch-protos/build/go/protos"
)

type LiveEntry struct {
	Key       string
	SessionID string
	NodeName  string
	Audience  *protos.Audience
	Register  bool
}
