package config

import (
	"fmt"
	"time"

	"github.com/kelseyhightower/envconfig"
)

const (
	EnvConfigPrefix = "GO_TEMPLATE"
)

type Config struct {
	ListenAddress string `envconfig:"LISTEN_ADDRESS" default:":8282"`
	HealthFreqSec int    `envconfig:"HEALTH_FREQ_SEC" default:"60"`
	EnvName       string `envconfig:"ENV_NAME" default:"local"`
	ServiceName   string `envconfig:"SERVICE_NAME" default:"go-template"`

	// Queue for _internal_ events
	ISBDedicatedURLs              []string `envconfig:"ISB_DEDICATED_URL" default:"amqp://localhost"`
	ISBDedicatedExchangeName      string   `envconfig:"ISB_DEDICATED_EXCHANGE_NAME" default:"events"`
	ISBDedicatedExchangeDeclare   bool     `envconfig:"ISB_DEDICATED_EXCHANGE_DECLARE" default:"true"`
	ISBDedicatedExchangeDurable   bool     `envconfig:"ISB_DEDICATED_EXCHANGE_DURABLE" default:"true"`
	ISBDedicatedBindingKeys       []string `envconfig:"ISB_DEDICATED_ROUTING_KEY" default:"messages.collect.#"` // UPDATE THIS
	ISBDedicatedQueueName         string   `envconfig:"ISB_DEDICATED_QUEUE_NAME" default:""`                    // Purposefully left blank
	ISBDedicatedNumConsumers      int      `envconfig:"ISB_DEDICATED_NUM_CONSUMERS" default:"10"`
	ISBDedicatedRetryReconnectSec int      `envconfig:"ISB_DEDICATED_RETRY_RECONNECT_SEC" default:"10"`
	ISBDedicatedAutoAck           bool     `envconfig:"ISB_DEDICATED_AUTO_ACK" default:"false"`
	ISBDedicatedQueueDeclare      bool     `envconfig:"ISB_DEDICATED_QUEUE_DECLARE" default:"true"`
	ISBDedicatedQueueDurable      bool     `envconfig:"ISB_DEDICATED_QUEUE_DURABLE" default:"false"`
	ISBDedicatedQueueExclusive    bool     `envconfig:"ISB_DEDICATED_QUEUE_EXCLUSIVE" default:"true"`
	ISBDedicatedQueueAutoDelete   bool     `envconfig:"ISB_DEDICATED_QUEUE_AUTO_DELETE" default:"true"`
	ISBDedicatedUseTLS            bool     `envconfig:"ISB_DEDICATED_USE_TLS" default:"false"`
	ISBDedicatedSkipVerifyTLS     bool     `envconfig:"ISB_DEDICATED_SKIP_VERIFY_TLS" default:"false"`

	// Shared queue. Used for messages that should be received by only one instance of this service
	ISBSharedURLs              []string `envconfig:"ISB_SHARED_URL" default:"amqp://localhost"`
	ISBSharedExchangeName      string   `envconfig:"ISB_SHARED_EXCHANGE_NAME" default:"events"`
	ISBSharedExchangeDeclare   bool     `envconfig:"ISB_SHARED_EXCHANGE_DECLARE" default:"false"`
	ISBSharedExchangeDurable   bool     `envconfig:"ISB_SHARED_EXCHANGE_DURABLE" default:"true"`
	ISBSharedBindingKeys       []string `envconfig:"ISB_SHARED_ROUTING_KEY" default:"messages.collect.#"` // UPDATE THIS
	ISBSharedQueueName         string   `envconfig:"ISB_SHARED_QUEUE_NAME" default:"go-template_shared"`
	ISBSharedNumConsumers      int      `envconfig:"ISB_SHARED_NUM_CONSUMERS" default:"3"`
	ISBSharedRetryReconnectSec int      `envconfig:"ISB_SHARED_RETRY_RECONNECT_SEC" default:"10"`
	ISBSharedAutoAck           bool     `envconfig:"ISB_SHARED_AUTO_ACK" default:"false"`
	ISBSharedQueueDeclare      bool     `envconfig:"ISB_SHARED_QUEUE_DECLARE" default:"true"`
	ISBSharedQueueDurable      bool     `envconfig:"ISB_SHARED_QUEUE_DURABLE" default:"true"`
	ISBSharedQueueExclusive    bool     `envconfig:"ISB_SHARED_QUEUE_EXCLUSIVE" default:"false"`
	ISBSharedQueueAutoDelete   bool     `envconfig:"ISB_SHARED_QUEUE_AUTO_DELETE" default:"false"`
	ISBSharedUseTLS            bool     `envconfig:"ISB_SHARED_USE_TLS" default:"false"`
	ISBSharedSkipVerifyTLS     bool     `envconfig:"ISB_SHARED_SKIP_VERIFY_TLS" default:"false"`

	// Queue for hsb messages
	HSBBrokerURLs     []string      `envconfig:"HSB_BROKER_URLS" default:"localhost:9092"`
	HSBUseTLS         bool          `envconfig:"HSB_USE_TLS" default:"false"`
	HSBTopicName      string        `envconfig:"HSB_TOPIC_NAME" default:"inbound"`
	HSBNumPublishers  int           `envconfig:"HSB_NUM_PUBLISHERS" default:"10"`
	HSBConnectTimeout time.Duration `envconfig:"HSB_CONNECT_TIMEOUT" default:"10s"`
	HSBBatchSize      int           `envconfig:"HSB_BATCH_SIZE" default:"1"`

	// Medium term storage
	BackendStorageHost      string `envconfig:"BACKEND_STORAGE_HOST" default:"localhost"`
	BackendStorageName      string `envconfig:"BACKEND_STORAGE_NAME" default:"go-template"`
	BackendStoragePort      int    `envconfig:"BACKEND_STORAGE_PORT" default:"5432"`
	BackendStorageUser      string `envconfig:"BACKEND_STORAGE_USER" default:"postgres"`
	BackendStoragePass      string `envconfig:"BACKEND_STORAGE_PASS"`
	BackendStorageEnableTLS bool   `envconfig:"BACKEND_STORAGE_ENABLE_TLS" default:"false"`

	NATSURL               []string `envconfig:"NATS_URL" default:"localhost:4222"`
	NATSUseTLS            bool     `envconfig:"NATS_USE_TLS" default:"false"`
	NATSTLSSkipVerify     bool     `envconfig:"NATS_TLS_SKIP_VERIFY" default:"false"`
	NATSTLSCertFile       string   `envconfig:"NATS_TLS_CERT_FILE"`
	NATSTLSKeyFile        string   `envconfig:"NATS_TLS_KEY_FILE"`
	NATSTLSCaFile         string   `envconfig:"NATS_TLS_CA_FILE"`
	NATSNumBucketReplicas int      `envconfig:"NATS_NUM_BUCKET_REPLICAS"  default:"1"`
}

func New() *Config {
	return &Config{}
}

func (c *Config) LoadEnvVars() error {
	if err := envconfig.Process(EnvConfigPrefix, c); err != nil {
		return fmt.Errorf("unable to fetch env vars: %s", err)
	}

	return nil
}
