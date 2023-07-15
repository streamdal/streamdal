// This pkg is used for acting on messages received on the isb.
package isb

import (
	"context"
	"fmt"
	"reflect"

	"github.com/pkg/errors"
	amqp "github.com/rabbitmq/amqp091-go"
	"github.com/sirupsen/logrus"

	"github.com/batchcorp/rabbit"

	"github.com/batchcorp/go-template/backends/cache"
)

const (
	DefaultNumConsumers = 10
)

type IISB interface {
	StartConsumers() error
}

type Config struct {
	RabbitMap map[string]*RabbitConfig
	Cache     cache.ICache
}

type RabbitConfig struct {
	RabbitInstance rabbit.IRabbit
	NumConsumers   int
	Func           string
	funcReal       func(amqp.Delivery) error // filled out during New()
}

type ISB struct {
	*Config

	log *logrus.Entry
}

func New(cfg *Config) (*ISB, error) {
	// We have to instantiate this because validateConfig needs access to our instance
	i := &ISB{
		Config: cfg,
		log:    logrus.WithField("pkg", "event"),
	}

	if err := i.validateConfig(cfg); err != nil {
		return nil, fmt.Errorf("unable to validate input cfg: %s", err)
	}

	return i, nil
}

func (i *ISB) validateConfig(cfg *Config) error {
	if cfg.Cache == nil {
		return errors.New("CacheBackend cannot be nil")
	}

	if len(cfg.RabbitMap) == 0 {
		return errors.New("Rabbit map cannot be empty")
	}

	for name, c := range cfg.RabbitMap {
		if c.RabbitInstance == nil {
			return fmt.Errorf("rabbit instance for '%s' cannot be nil", name)
		}

		if c.Func == "" {
			return fmt.Errorf("func for '%s' cannot be nil", name)
		}

		if c.NumConsumers < 1 {
			c.NumConsumers = DefaultNumConsumers
		}

		// Is this a legit legit function?
		method := reflect.ValueOf(i).MethodByName(c.Func)

		if !method.IsValid() {
			return fmt.Errorf("method for '%s' appears to be invalid", c.Func)
		}

		f, ok := method.Interface().(func(amqp.Delivery) error)
		if !ok {
			return fmt.Errorf("unable to type assert method '%s'", c.Func)
		}

		cfg.RabbitMap[name].funcReal = f
	}

	return nil
}

func (i *ISB) StartConsumers() error {
	for name, r := range i.RabbitMap {
		i.log.Debugf("Launching '%d' ISB consumers for '%s'", r.NumConsumers, name)

		for n := 0; n < r.NumConsumers; n++ {
			go r.RabbitInstance.Consume(context.Background(), nil, r.funcReal)
		}
	}

	return nil
}
