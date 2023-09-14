package store

import (
	"fmt"
	"strings"

	"github.com/streamdal/snitch-server/util"

	"github.com/streamdal/snitch-protos/build/go/protos"
)

const (
	RedisLivePrefix = "live"
	RedisLiveFormat = "live:%s:%s:%s" // K: $session_id:$node_name:$audience

	RedisAudiencePrefix    = "audience"
	RedisAudienceKeyFormat = "audience:%s" // K: $audience V: NONE

	// RedisRegisterFormat key resides in the RedisLivePrefix
	RedisRegisterFormat = "live:%s:%s:register" // K: $session_id:$node_name:register; V: NONE

	RedisPipelinePrefix    = "pipeline"
	RedisPipelineKeyFormat = "pipeline:%s" // K: $pipeline_id V: serialized protos.Pipeline

	RedisConfigPrefix    = "config"
	RedisConfigKeyFormat = "config:%s:%s" // K: $audience V: $pipeline_id (string)

	RedisPausedPrefix    = "paused"
	RedisPausedKeyFormat = "paused:%s:%s" // K: $pipeline_id:$audience V: NONE

	RedisNotificationConfigPrefix    = "notification_config"
	RedisNotificationConfigKeyFormat = "notification_config:%s" // K: $config_id V: serialized protos.NotificationConfig

	RedisNotificationAssocPrefix = "notification_assoc"
	RedisNotificationAssocFormat = "notification_assoc:%s:%s" // K: $pipeline_id:$config_id V: NONE
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
