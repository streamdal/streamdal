package store

import (
	"fmt"
	"strings"

	"github.com/streamdal/server/util"

	"github.com/streamdal/protos/build/go/protos"
)

const (
	RedisLivePrefix = "streamdal_live"
	RedisLiveFormat = "streamdal_live:%s:%s:%s" // K: $session_id:$node_name:$audience

	RedisAudiencePrefix    = "streamdal_audience"
	RedisAudienceKeyFormat = "streamdal_audience:%s" // K: $audience V: NONE

	// RedisRegisterFormat key resides in the RedisLivePrefix
	RedisRegisterFormat = "streamdal_live:%s:%s:register" // K: $session_id:$node_name:register; V: NONE

	RedisPipelinePrefix    = "streamdal_pipeline"
	RedisPipelineKeyFormat = "streamdal_pipeline:%s" // K: $pipeline_id V: serialized protos.Pipeline

	RedisConfigPrefix    = "streamdal_config"
	RedisConfigKeyFormat = "streamdal_config:%s:%s" // K: $audience V: $pipeline_id (string)

	RedisPausedPrefix    = "streamdal_paused"
	RedisPausedKeyFormat = "streamdal_paused:%s:%s" // K: $pipeline_id:$audience V: NONE

	RedisNotificationConfigPrefix    = "streamdal_notification_config"
	RedisNotificationConfigKeyFormat = "streamdal_notification_config:%s" // K: $config_id V: serialized protos.NotificationConfig

	RedisNotificationAssocPrefix = "streamdal_notification_assoc"
	RedisNotificationAssocFormat = "streamdal_notification_assoc:%s:%s" // K: $pipeline_id:$config_id V: NONE

	RedisSchemaPrefix = "streamdal_schema"
	RedisSchemaFormat = "streamdal_schema:%s" // K: $audience V: serialized protos.Schema
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

func RedisPipelineKey(pipelineID string) string {
	return strings.ToLower(fmt.Sprintf(RedisPipelineKeyFormat, pipelineID))
}

func RedisConfigKey(audience *protos.Audience, pipelineID string) string {
	audStr := util.AudienceToStr(audience)
	return strings.ToLower(fmt.Sprintf(RedisConfigKeyFormat, audStr, pipelineID))
}

func RedisPausedKey(audience, pipelineID string) string {
	return strings.ToLower(fmt.Sprintf(RedisPausedKeyFormat, pipelineID, audience))
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
