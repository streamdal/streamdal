package isb

import (
	"github.com/golang/protobuf/proto"
	amqp "github.com/rabbitmq/amqp091-go"

	"github.com/batchcorp/schemas/build/go/events"
)

// This method is intended to be passed as a closure into a rabbit ConsumeAndRun
func (i *ISB) DedicatedConsumeFunc(msg amqp.Delivery) error {
	if err := msg.Ack(false); err != nil {
		i.log.Errorf("Error acknowledging message: %s", err)
		return nil
	}

	pbMessage := &events.Message{}

	if err := proto.Unmarshal(msg.Body, pbMessage); err != nil {
		i.log.Errorf("unable to unmarshal event message: %s", err)
		return nil
	}

	switch pbMessage.Type {
	// Add event cases here
	default:
		i.log.Debugf("got an internal message: %+v", pbMessage)
	}

	return nil
}
