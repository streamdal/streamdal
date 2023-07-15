package isb

import (
	"github.com/golang/protobuf/proto"
	amqp "github.com/rabbitmq/amqp091-go"

	"github.com/batchcorp/schemas/build/go/events"
)

// SharedConsumeFunc will receive rabbitmq messages on only one running instance of this service
func (i *ISB) SharedConsumeFunc(msg amqp.Delivery) error {
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
