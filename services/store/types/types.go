package types

import (
	"github.com/streamdal/snitch-protos/build/go/protos"
)

type LiveEntry struct {
	SessionID string
	NodeName  string
	Audience  *protos.Audience
	Register  bool
}
