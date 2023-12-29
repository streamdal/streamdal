package types

import (
	"github.com/streamdal/streamdal/libs/protos/build/go/protos"
)

type LiveEntry struct {
	Key       string             // $session_id/$node_name/$audience OR $session_id/$node_name/register
	Value     *protos.ClientInfo // Filled out during GetAll() and only if Register == true
	SessionID string
	NodeName  string
	Audience  *protos.Audience
	Register  bool
}

type PausedEntry struct {
	Key        string
	Audience   *protos.Audience
	PipelineID string
}
