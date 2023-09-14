package store

import (
	"fmt"
	"strings"

	"github.com/streamdal/snitch-server/util"

	"github.com/streamdal/snitch-protos/build/go/protos"
)

const (
	NATSLiveBucket = "live"
	NATSLiveFormat = "live:%s:%s:%s" // K: $session_id:$node_name:$audience

	NATSAudienceBucket    = "audience"
	NATSAudienceKeyFormat = "audience:%s" // K: $audience V: NONE

	// NATSRegisterFormat key resides in the NATSLiveBucket
	NATSRegisterFormat = "live:%s:%s:register" // K: $session_id:$node_name:register; V: NONE

	NATSPipelineBucket    = "pipeline"
	NATSPipelineKeyFormat = "pipeline:%s" // K: $pipeline_id V: serialized protos.Pipeline

	NATSConfigBucket    = "config"
	NATSConfigKeyFormat = "config:%s:%s" // K: $audience V: $pipeline_id (string)

	NATSPausedBucket    = "paused"
	NATSPausedKeyFormat = "paused:%s:%s" // K: $pipeline_id:$audience V: NONE

	NATSNotificationConfigBucket    = "notification_config"
	NATSNotificationConfigKeyFormat = "notification_config:%s" // K: $config_id V: serialized protos.NotificationConfig

	NATSNotificationAssocBucket = "notification_assoc"
	NATSNotificationAssocFormat = "notification_assoc:%s:%s" // K: $pipeline_id:$config_id V: NONE
)

func NATSRegisterKey(session, node string) string {
	return strings.ToLower(fmt.Sprintf(NATSRegisterFormat, session, node))
}

func NATSAudienceKey(audience string) string {
	return strings.ToLower(fmt.Sprintf(NATSAudienceKeyFormat, audience))
}

func NATSLiveKey(session, node, audience string) string {
	return strings.ToLower(fmt.Sprintf(NATSLiveFormat, session, node, audience))
}

func NATSPipelineKey(pipelineID string) string {
	return strings.ToLower(fmt.Sprintf(NATSPipelineKeyFormat, pipelineID))
}

func NATSConfigKey(audience *protos.Audience, pipelineID string) string {
	audStr := util.AudienceToStr(audience)
	return strings.ToLower(fmt.Sprintf(NATSConfigKeyFormat, audStr, pipelineID))
}

func NATSPausedKey(audience, pipelineID string) string {
	return strings.ToLower(fmt.Sprintf(NATSPausedKeyFormat, pipelineID, audience))
}

func NATSNotificationConfigKey(configID string) string {
	return strings.ToLower(fmt.Sprintf(NATSNotificationConfigKeyFormat, configID))
}

func NATSNotificationAssocKey(pipelineID, configID string) string {
	return strings.ToLower(fmt.Sprintf(NATSNotificationAssocFormat, pipelineID, configID))
}
