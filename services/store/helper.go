package store

import (
	"fmt"
	"time"
)

const (
	NATSLiveBucket = "snitch_live"
	NATSLiveFormat = "%s/%s/%s" // K: $session_id/$node_name/$audience OR $session_id/$node_name/register; V: NONE
	NATSLiveTTL    = 5 * time.Second

	NATSPipelineBucket    = "snitch_pipeline"
	NATSPipelineKeyFormat = "%s" // K: $pipeline_id V: serialized protos.Pipeline

	NATSConfigBucket    = "snitch_config"
	NATSConfigKeyFormat = "%s" // K: $audience V: $pipeline_id (string)

	NATSPausedBucket    = "snitch_paused"
	NATSPausedKeyFormat = "%s/%s" // K: $audience:$pipeline_id V: NONE
)

func NATSLiveKey(session, node, audience string) string {
	return fmt.Sprintf(NATSLiveFormat, session, node, audience)
}

func NATSPipelineKey(pipelineId string) string {
	return fmt.Sprintf(NATSPipelineKeyFormat, pipelineId)
}

func NATSConfigKey(audience string) string {
	return fmt.Sprintf(NATSConfigKeyFormat, audience)
}

func NATSPausedKey(audience, pipelineId string) string {
	return fmt.Sprintf(NATSPausedKeyFormat, audience, pipelineId)
}
