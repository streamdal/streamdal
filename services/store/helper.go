package store

import (
	"fmt"
	"time"
)

// Cache-related settings
const (
	CacheRegisterPrefix    = "register"
	CacheRegisterKeyFormat = CacheRegisterPrefix + ":%s:%s:%s" // K: $node:$service_name:$session_id V: deserialized protos.RegisterRequest
	CacheRegisterTTL       = 5 * time.Second

	CacheAudiencePrefix    = "audience"
	CacheAudienceKeyFormat = CacheAudiencePrefix + ":%s" // K: $service_name V: deserialized []protos.Audience

	CachePipelinePrefix    = "pipeline"
	CachePipelineKeyFormat = CachePipelinePrefix + ":%s" // K: $pipeline_id V: deserialized protos.Pipeline

	CacheConfigPrefix    = "config"
	CacheConfigKeyFormat = CacheConfigPrefix + ":%s" // K: $audience V: $pipeline_id (string)

	CacheStatePrefix    = "state"
	CacheStateKeyFormat = CacheStatePrefix + ":%s:%s" // K: $audience:$pipeline_id V: deserialized protos.State
)

// NATS-related settings
const (
	NATSRegisterBucket    = "snitch_register"
	NATSRegisterKeyFormat = "%s:%s:%s" // K: $node:$service_name:$session_id V: serialized protos.RegisterRequest
	NATSRegisterTTL       = CacheRegisterTTL

	NATSAudienceBucket    = "snitch_audience"
	NATSAudienceKeyFormat = "%s" // K: $service_name V: serialized []protos.Audience

	NATSPipelineBucket    = "snitch_pipeline"
	NATSPipelineKeyFormat = "%s" // K: $pipeline_id V: serialized protos.Pipeline

	NATSConfigBucket    = "snitch_config"
	NATSConfigKeyFormat = "%s" // K: $audience V: $pipeline_id (string)

	NATSStateBucket    = "snitch_state"
	NATSStateKeyFormat = "%s:%s" // K: $audience:$pipeline_id V: serialized protos.State
)

func CacheRegisterKey(node, service, session string) string {
	return fmt.Sprintf(CacheRegisterKeyFormat, node, service, session)
}

func CacheAudienceKey(service string) string {
	return fmt.Sprintf(CacheAudienceKeyFormat, service)
}

func CachePipelineKey(pipelineId string) string {
	return fmt.Sprintf(CachePipelineKeyFormat, pipelineId)
}

func CacheConfigKey(audience string) string {
	return fmt.Sprintf(CacheConfigKeyFormat, audience)
}

func CacheStateKey(audience, pipelineId string) string {
	return fmt.Sprintf(CacheStateKeyFormat, audience, pipelineId)
}

func NATSRegisterKey(node, service, session string) string {
	return fmt.Sprintf(NATSRegisterKeyFormat, node, service, session)
}

func NATSAudienceKey(service string) string {
	return fmt.Sprintf(NATSAudienceKeyFormat, service)
}

func NATSPipelineKey(pipelineId string) string {
	return fmt.Sprintf(NATSPipelineKeyFormat, pipelineId)
}

func NATSConfigKey(audience string) string {
	return fmt.Sprintf(NATSConfigKeyFormat, audience)
}

func NATSStateKey(audience, pipelineId string) string {
	return fmt.Sprintf(NATSStateKeyFormat, audience, pipelineId)
}
