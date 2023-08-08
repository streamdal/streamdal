package store

import (
	"fmt"
	"strings"
)

const (
	NATSLiveBucket = "snitch_live"
	NATSLiveFormat = "%s/%s/%s" // K: $session_id/$node_name/$audience

	NATSAudienceBucket    = "snitch_audience"
	NATSAudienceKeyFormat = "%s" // K: $audience V: NONE

	// NATSRegisterFormat key resides in the NATSLiveBucket
	NATSRegisterFormat = "%s/%s/register" // K: $session_id/$node_name/register; V: NONE

	NATSPipelineBucket    = "snitch_pipeline"
	NATSPipelineKeyFormat = "%s" // K: $pipeline_id V: serialized protos.Pipeline

	NATSConfigBucket    = "snitch_config"
	NATSConfigKeyFormat = "%s" // K: $audience V: $pipeline_id (string)

	NATSPausedBucket    = "snitch_paused"
	NATSPausedKeyFormat = "%s/%s" // K: $audience:$pipeline_id V: NONE
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

func NATSPipelineKey(pipelineId string) string {
	return strings.ToLower(fmt.Sprintf(NATSPipelineKeyFormat, pipelineId))
}

func NATSConfigKey(audience string) string {
	return strings.ToLower(fmt.Sprintf(NATSConfigKeyFormat, audience))
}

func NATSPausedKey(audience, pipelineId string) string {
	return strings.ToLower(fmt.Sprintf(NATSPausedKeyFormat, audience, pipelineId))
}
