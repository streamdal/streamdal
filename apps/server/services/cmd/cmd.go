package cmd

import (
	"sync"

	"github.com/sirupsen/logrus"

	"github.com/streamdal/mono/libs/protos/build/go/protos"
)

type ICmd interface {
	AddChannel(sessionID string) (chan *protos.Command, bool)
	RemoveChannel(sessionID string) bool
	GetChannel(sessionID string) chan *protos.Command
	HaveChannel(sessionID string) bool
}

type Cmd struct {
	channels    map[string]chan *protos.Command
	channelsMtx sync.RWMutex
	log         *logrus.Entry
}

func New() (*Cmd, error) {
	return &Cmd{
		channels:    make(map[string]chan *protos.Command),
		channelsMtx: sync.RWMutex{},
		log:         logrus.WithField("pkg", "cmd"),
	}, nil
}

func (c *Cmd) HaveChannel(sessionId string) bool {
	c.channelsMtx.RLock()
	defer c.channelsMtx.RUnlock()

	_, ok := c.channels[sessionId]

	return ok
}

// AddChannel will either add a new channel or return an existing channel;
// bool indicates if new channel was created.
func (c *Cmd) AddChannel(sessionID string) (chan *protos.Command, bool) {
	ch := c.GetChannel(sessionID)
	if ch != nil {
		return ch, false
	}

	c.channelsMtx.Lock()
	defer c.channelsMtx.Unlock()

	c.channels[sessionID] = make(chan *protos.Command, 1)

	return c.channels[sessionID], true
}

// Returns channel or nil if channel not found
func (c *Cmd) GetChannel(sessionID string) chan *protos.Command {
	if !c.HaveChannel(sessionID) {
		return nil
	}

	c.channelsMtx.RLock()
	defer c.channelsMtx.RUnlock()

	return c.channels[sessionID]
}

// Bool indicates if channel with sessionID exists
func (c *Cmd) RemoveChannel(sessionID string) bool {
	if !c.HaveChannel(sessionID) {
		return false
	}

	c.channelsMtx.Lock()
	defer c.channelsMtx.Unlock()

	close(c.channels[sessionID])
	delete(c.channels, sessionID)

	return true
}
