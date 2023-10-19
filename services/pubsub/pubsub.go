package pubsub

import (
	"sync"

	"github.com/sirupsen/logrus"

	"github.com/streamdal/server/util"
)

// IPubSub is an interface for an internal, in-memory pub/sub system. We use it
// to signal events to subscribers (such as when new clients Register() to the
// server or when disconnects occur). This is used to tell the frontend that
// a change has occurred (and the frontend must refresh its view.
type IPubSub interface {
	// HaveTopic determines if there are any open pubsub channels for a given topic
	HaveTopic(topic string) bool

	// Listen will "subscribe" to a topic and return a channel that will receive
	// any messages that are published to that topic. Listen accepts an optional
	// identifier that will be used to identify a specific listener. The identifier
	// is useful for being able to close a _specific_ channel.
	Listen(topic string, channelID ...string) chan interface{}

	// Publish will publish a message to a topic, which may have multiple channels associated
	// with it. Each channel will receive the message
	Publish(topic string, m interface{})

	// Close will delete the channel from the topic map and close the channel.
	// WARNING: Make sure to call Close() only on listeners that no longer Listen()'ing
	Close(topic, channelID string)

	// CloseTopic is used when a tail request is stopped to close all associated channels
	// and prevent a dead-lock
	CloseTopic(topic string) bool

	// Reset will delete all channels from the topic map and close all channels;
	// use this when you are finished
	Reset()
}

type PubSub struct {
	topics map[string]map[string]chan interface{} // k1: topic k2: subscriber id v: channel
	mtx    *sync.RWMutex
	log    *logrus.Entry
}

func New() *PubSub {
	return &PubSub{
		topics: make(map[string]map[string]chan interface{}),
		log:    logrus.WithField("pkg", "pubsub"),
		mtx:    &sync.RWMutex{},
	}
}

func (ps *PubSub) Listen(topic string, channelID ...string) chan interface{} {
	var id string

	if len(channelID) > 0 {
		id = channelID[0]
	} else {
		id = util.GenerateUUID()
	}

	ch := make(chan interface{}, 1)

	ps.log.Debug("pubsub.Listen: before lock")

	ps.mtx.Lock()
	if _, ok := ps.topics[topic]; !ok {
		ps.topics[topic] = make(map[string]chan interface{})
	}

	ps.topics[topic][id] = ch

	ps.mtx.Unlock()

	ps.log.Debug("pubsub.Listen: after unlock")

	return ch
}

func (ps *PubSub) Reset() {
	ps.mtx.Lock()
	defer ps.mtx.Unlock()

	for _, chs := range ps.topics {
		for _, ch := range chs {
			close(ch)
		}
	}

	ps.topics = make(map[string]map[string]chan interface{})
}

func (ps *PubSub) Close(topic, channelID string) {
	ps.mtx.Lock()
	defer ps.mtx.Unlock()

	ch, ok := ps.topics[topic][channelID]
	if !ok {
		// Nothing to do, asked to cleanup ch that does not exist
		return
	}

	delete(ps.topics[topic], channelID)

	if ch != nil {
		close(ch)
	}
}

func (ps *PubSub) CloseTopic(topic string) bool {
	ps.mtx.Lock()
	defer ps.mtx.Unlock()

	channels, ok := ps.topics[topic]
	if !ok {
		return false
	}

	for _, ch := range channels {
		close(ch)
	}

	delete(ps.topics, topic)

	return true
}

func (ps *PubSub) Publish(topic string, m interface{}) {
	ps.mtx.RLock()
	defer ps.mtx.RUnlock()

	if _, ok := ps.topics[topic]; !ok {
		ps.log.Debugf("pubsub.Publish: no such topic '%s' - skipping publish", topic)
		return
	}

	for _, tmpCh := range ps.topics[topic] {
		go func(ch chan interface{}) {
			defer func() {
				if r := recover(); r != nil {
					ps.log.Debug("BUG: pubsub.Publish: tried to write to closed channel")
				}
			}()

			ps.log.Debugf("pubsub.Publish: before topic '%s' write", topic)
			ch <- m
			ps.log.Debugf("pubsub.Publish: after topic '%s' write", topic)
		}(tmpCh)
	}
}

func (ps *PubSub) HaveTopic(topic string) bool {
	ps.mtx.RLock()
	defer ps.mtx.RUnlock()

	_, ok := ps.topics[topic]
	return ok
}
