import { Audience } from "@streamdal/protos/protos/sp_common";
import { NotifyRequest_ConditionType } from "@streamdal/protos/protos/sp_internal";
import { PipelineStep } from "@streamdal/protos/protos/sp_pipeline";
import { ExecStatus, StepStatus } from "@streamdal/protos/protos/sp_sdk";

import { PipelineConfigs } from "./process.js";

export const statusToNotifyType = (
  status: ExecStatus
): NotifyRequest_ConditionType => {
  switch (status) {
    case ExecStatus.TRUE: {
      return NotifyRequest_ConditionType.ON_TRUE as NotifyRequest_ConditionType;
    }
    case ExecStatus.FALSE: {
      return NotifyRequest_ConditionType.ON_FALSE as NotifyRequest_ConditionType;
    }
    case ExecStatus.ERROR: {
      return NotifyRequest_ConditionType.ON_ERROR as NotifyRequest_ConditionType;
    }
    default:
      return NotifyRequest_ConditionType.UNSET as NotifyRequest_ConditionType;
  }
};

export const notifyStep = async ({
  configs,
  step,
  stepStatus,
  audience,
  pipelineId,
  payload,
}: {
  configs: PipelineConfigs;
  step: PipelineStep;
  stepStatus: StepStatus;
  audience: Audience;
  pipelineId: string;
  payload: Uint8Array;
}) => {
  console.debug("notifying error step", step.name);
  try {
    await configs.grpcClient.notify(
      {
        conditionType: statusToNotifyType(stepStatus.status),
        step,
        audience,
        pipelineId,
        payload,
        occurredAtUnixTsUtc: Date.now().toString(),
      },
      { meta: { "auth-token": configs.streamdalToken } }
    );
  } catch (e) {
    console.error("error sending notification to server", e);
  }
};
