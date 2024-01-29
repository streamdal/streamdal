package store

import (
	"crypto/sha256"
	"fmt"
	"strings"
	"time"

	"github.com/streamdal/streamdal/apps/server/util"

	"github.com/streamdal/streamdal/libs/protos/build/go/protos"
)

const (
	RedisLivePrefix = "streamdal_live"
	RedisLiveFormat = "streamdal_live:%s:%s:%s" // K: $session_id:$node_name:$audience

	RedisAudiencePrefix    = "streamdal_audience"
	RedisAudienceKeyFormat = "streamdal_audience:%s" // K: $audience V: SetPipelineConfig JSON

	// RedisRegisterFormat key resides in the RedisLivePrefix
	RedisRegisterFormat = "streamdal_live:%s:%s:register" // K: $session_id:$node_name:register; V: NONE

	RedisPipelinePrefix    = "streamdal_pipeline"
	RedisPipelineKeyFormat = "streamdal_pipeline:%s" // K: $pipeline_id V: serialized protos.Pipeline

	RedisNotificationConfigPrefix    = "streamdal_notification_config"
	RedisNotificationConfigKeyFormat = "streamdal_notification_config:%s" // K: $config_id V: serialized protos.NotificationConfig

	RedisNotificationAssocPrefix = "streamdal_notification_assoc"
	RedisNotificationAssocFormat = "streamdal_notification_assoc:%s:%s" // K: $pipeline_id:$config_id V: NONE

	RedisSchemaPrefix = "streamdal_schema"
	RedisSchemaFormat = "streamdal_schema:%s" // K: $audience V: serialized protos.Schema

	RedisActiveTailPrefix    = "streamdal_tail"
	RedisActiveTailKeyFormat = "streamdal_tail:%s"        // K: $service_name:$tail_request_id V: serialized protos.TailRequest
	RedisPausedTailKeyFormat = "streamdal_tail_paused:%s" // K: $service_name:$tail_request_id:paused V: serialized protos.TailRequest

	// RedisActiveTailTTL is the TTL for the active tail key. While this key
	// should be automatically cleaned up when the frontend stops a Tail() request,
	// this TTL is a safety mechanism to ensure we do not leave orphaned tails.
	RedisActiveTailTTL = 10 * time.Second

	RedisTelemetryRegistrationPrefix = "streamdal_telemetry:registrations"
	RedisTelemetryRegistrationFormat = "streamdal_telemetry:registrations:%x"

	RedisTelemetryAudiencePrefix = "streamdal_telemetry:audience"
	RedisTelemetryAudienceFormat = "streamdal_telemetry:audience:%x"
)

func RedisRegisterKey(session, node string) string {
	return strings.ToLower(fmt.Sprintf(RedisRegisterFormat, session, node))
}

func RedisAudienceKey(audience string) string {
	return strings.ToLower(fmt.Sprintf(RedisAudienceKeyFormat, audience))
}

func RedisLiveKey(session, node, audience string) string {
	return strings.ToLower(fmt.Sprintf(RedisLiveFormat, session, node, audience))
}

func RedisTelemetryRegistrationKey(serviceName, os, sdk, arch string) string {
	hash := sha256.Sum256([]byte(fmt.Sprintf("%s-%s-%s-%s", serviceName, os, sdk, arch)))
	return strings.ToLower(fmt.Sprintf(RedisTelemetryRegistrationFormat, hash))
}

func RedisTelemetryAudience(aud *protos.Audience) string {
	return strings.ToLower(fmt.Sprintf("%s:%x", RedisTelemetryAudienceFormat, util.AudienceToStr(aud)))
}

func RedisPipelineKey(pipelineID string) string {
	return strings.ToLower(fmt.Sprintf(RedisPipelineKeyFormat, pipelineID))
}

func RedisNotificationConfigKey(configID string) string {
	return strings.ToLower(fmt.Sprintf(RedisNotificationConfigKeyFormat, configID))
}

func RedisNotificationAssocKey(pipelineID, configID string) string {
	return strings.ToLower(fmt.Sprintf(RedisNotificationAssocFormat, pipelineID, configID))
}

func RedisSchemaKey(audience string) string {
	return strings.ToLower(fmt.Sprintf(RedisSchemaFormat, audience))
}

func RedisActiveTailKey(tailID string) string {
	return strings.ToLower(fmt.Sprintf(RedisActiveTailKeyFormat, tailID))
}

func RedisPausedTailKey(tailID string) string {
	return strings.ToLower(fmt.Sprintf(RedisPausedTailKeyFormat, tailID))
}
