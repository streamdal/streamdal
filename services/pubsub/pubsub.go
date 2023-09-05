package pubsub

import (
	"sync"

	"github.com/sirupsen/logrus"

	"github.com/streamdal/snitch-server/util"
)

type IPubSub interface {
	HaveTopic(topic string) bool
	Listen(topic string, channelID ...string) chan interface{}
	Publish(topic string, m interface{})
	Close(topic, channelID string)
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

// Listen will "subscribe" to a topic and return a channel that will receive
// any messages that are published to that topic. Listen accepts an optional
// identifier that will be used to identify a specific listener. The identifier
// is useful for being able to close a _specific_ channel.
func (ps *PubSub) Listen(topic string, channelID ...string) chan interface{} {
	var id string

	if len(channelID) > 0 {
		id = channelID[0]
	} else {
		id = util.GenerateUUID()
	}

	ch := make(chan interface{}, 1)

	ps.mtx.Lock()
	if _, ok := ps.topics[topic]; !ok {
		ps.topics[topic] = make(map[string]chan interface{})
	}

	ps.topics[topic][id] = ch

	ps.mtx.Unlock()

	return ch
}

// Reset will delete all channels from the topic map and close all channels;
// use this when you are finished
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

// Close will delete the channel from the topic map and close the channel.
// WARNING: Make sure to call Close() only on listeners that no longer Listen()'ing
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

func (ps *PubSub) Publish(topic string, m interface{}) {
	ps.mtx.RLock()
	defer ps.mtx.RUnlock()

	if _, ok := ps.topics[topic]; !ok {
		return
	}

	for _, ch := range ps.topics[topic] {
		ch <- m
	}
}

func (ps *PubSub) HaveTopic(topic string) bool {
	ps.mtx.RLock()
	defer ps.mtx.RUnlock()

	_, ok := ps.topics[topic]
	return ok
}
