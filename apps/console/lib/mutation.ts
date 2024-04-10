import {
  Audience,
  ResponseCode,
  StandardResponse,
} from "streamdal-protos/protos/sp_common.ts";
import { client, meta } from "./grpc.ts";
import { Pipeline } from "streamdal-protos/protos/sp_pipeline.ts";
import {
  AppRegisterRejectRequest,
  AppRegistrationRequest,
  CreateNotificationRequest,
  CreatePipelineRequest,
  DeleteAudienceRequest,
  DeletePipelineRequest,
  DeleteServiceRequest,
  PausePipelineRequest,
  ResumePipelineRequest,
  SetPipelinesRequest,
  UpdateNotificationRequest,
  UpdatePipelineRequest,
} from "streamdal-protos/protos/sp_external.ts";
import { NotificationConfig } from "streamdal-protos/protos/sp_notify.ts";
import { getPipeline } from "./fetch.ts";
import { serviceSignal } from "../components/serviceMap/serviceSignal.ts";
import { audienceKey } from "./utils.ts";

export type PatchedPipelineResponse = StandardResponse & {
  pipelineId?: string;
};

export const updatePipelineNotifications = async (
  notificationIds: string[],
  pipeline: Pipeline,
) => {
  const existing = pipeline.id && await getPipeline(pipeline.id);

  if (!existing) {
    return;
  }

  for await (const notification of existing.NotificationConfigs) {
    notification?.id && client.detachNotification(
      { notificationId: notification.id, pipelineId: pipeline.id },
      meta,
    );
  }

  for await (const id of notificationIds) {
    client.attachNotification(
      { notificationId: id, pipelineId: pipeline.id },
      meta,
    );
  }

  return;
};

export const upsertPipeline = async (
  pipeline: Pipeline,
): Promise<PatchedPipelineResponse> => {
  if (pipeline.id) {
    const { response: updateResponse } = await client
      .updatePipeline(
        UpdatePipelineRequest.create({ pipeline }),
        meta,
      );
    return { ...updateResponse, pipelineId: pipeline.id };
  }

  const { response: createResponse } = await client
    .createPipeline(
      CreatePipelineRequest.create({ pipeline }),
      meta,
    );

  //
  // Create pipeline returns a non-standard response with no code so
  // we have to handle it specifically
  return {
    ...createResponse,
    id: "createPipelineRequest",
    pipelineId: createResponse.pipelineId,
    code: createResponse.pipelineId
      ? ResponseCode.OK
      : ResponseCode.INTERNAL_SERVER_ERROR,
  };
};

export const deletePipeline = async (
  pipelineId: string,
): Promise<StandardResponse> => {
  const { response }: { response: StandardResponse } = await client
    .deletePipeline(
      DeletePipelineRequest.create({ pipelineId }),
      meta,
    );

  return response;
};

export const attachPipeline = async (
  pipelineId: string,
  audience: Audience,
) => {
  try {
    const key = audienceKey(audience);
    const existingIds = serviceSignal?.value?.configs[key]?.configs.map((p) =>
      p.id
    ) || [];
    const pipelineIds = [...existingIds, ...[pipelineId]];

    const request: SetPipelinesRequest = SetPipelinesRequest.create({
      audience,
      pipelineIds,
    });
    const { response } = await client.setPipelines(
      request,
      meta,
    );

    return response;
  } catch (error) {
    return {
      id: "attachPipelineRequest",
      code: ResponseCode.INTERNAL_SERVER_ERROR,
      error,
    };
  }
};

export const detachPipeline = async (
  pipelineId: string,
  audience: Audience,
) => {
  try {
    const key = audienceKey(audience);
    const existingIds = serviceSignal?.value?.configs[key]?.configs.map((p) =>
      p.id
    ) || [];
    const pipelineIds = existingIds?.filter((id: string) => id !== pipelineId);
    const request: SetPipelinesRequest = SetPipelinesRequest.create({
      audience,
      pipelineIds,
    });
    const { response } = await client.setPipelines(
      request,
      meta,
    );

    return response;
  } catch (error) {
    console.error("error detaching pipeline", error);
    return {
      id: "detachPipelineRequest",
      code: ResponseCode.INTERNAL_SERVER_ERROR,
      error,
    };
  }
};

export const deleteNotification = async (
  notificationId: string,
): Promise<StandardResponse> => {
  const { response }: { response: StandardResponse } = await client
    .deleteNotification(
      { notificationId },
      meta,
    );

  return response;
};

export const updateNotification = async (
  notificationConfig: NotificationConfig,
) => {
  try {
    const request = UpdateNotificationRequest.create({
      notification: notificationConfig,
    });

    const { response } = await client.updateNotification(request, meta);
    return response;
  } catch (error) {
    console.error("error updating notification", error);
    return {
      id: "updateNotification",
      code: ResponseCode.INTERNAL_SERVER_ERROR,
      message:
        "There was a problem updating the notification, please try again later",
    };
  }
};

export const createNotification = async (
  notificationConfig: NotificationConfig,
) => {
  try {
    const request = CreateNotificationRequest.create({
      notification: notificationConfig,
    });

    const { response } = await client.createNotification(request, meta);
    //
    // monkey patch a success code in here so we can check for success
    // downstream just like we do for updates
    return {
      ...response,
      code: ResponseCode.OK,
      message: "Notification created!",
    };
  } catch (error) {
    console.error("error creating notification", error);
    return {
      id: "createNotification",
      code: ResponseCode.INTERNAL_SERVER_ERROR,
      message:
        "There was a problem creating the notification, please try again later",
    };
  }
};

export const pausePipeline = async (
  pipelineId: string,
  audience: Audience,
) => {
  try {
    const request = PausePipelineRequest.create({ audience, pipelineId });

    const { response } = await client.pausePipeline(
      request,
      meta,
    );

    return response;
  } catch (error) {
    console.error("error pausing pipeline", error);
    return {
      id: "pausePipelineRequest",
      code: ResponseCode.INTERNAL_SERVER_ERROR,
      error,
    };
  }
};

export const resumePipeline = async (
  pipelineId: string,
  audience: Audience,
) => {
  try {
    const request = ResumePipelineRequest.create({ audience, pipelineId });

    const { response } = await client.resumePipeline(
      request,
      meta,
    );

    return response;
  } catch (error) {
    console.error("error resuming pipeline", error);
    return {
      id: "resumePipelineRequest",
      code: ResponseCode.INTERNAL_SERVER_ERROR,
      error,
    };
  }
};

export const deleteAudience = async (audience: Audience, force: boolean) => {
  try {
    const request: DeleteAudienceRequest = { audience, force };
    const { response } = await client.deleteAudience(
      request,
      meta,
    );
    return response;
  } catch (error) {
    console.error("error deleting audience", error);
    return {
      id: "deleteAudienceRequest",
      code: ResponseCode.INTERNAL_SERVER_ERROR,
      error,
    };
  }
};

export const deleteService = async (serviceName: string) => {
  try {
    const request: DeleteServiceRequest = { serviceName, force: true };
    const { response } = await client.deleteService(
      request,
      meta,
    );
    return response;
  } catch (error) {
    console.error("error deleting service", error);
    return {
      id: "deleteServiceRequest",
      code: ResponseCode.INTERNAL_SERVER_ERROR,
      error,
    };
  }
};

export const sendEmail = async (email: string) => {
  try {
    const request = AppRegistrationRequest.create({ email });
    const { response } = await client.appRegister(request, meta);
    return response;
  } catch (error) {
    console.error("error registering app", error);
    return {
      id: "appRegistrationRequest",
      code: ResponseCode.INTERNAL_SERVER_ERROR,
      error,
    };
  }
};

export const rejectEmailCollection = async () => {
  try {
    const request = AppRegisterRejectRequest.create();
    const { response } = await client.appRegisterReject(request, meta);
    return response;
  } catch (error) {
    console.error("error rejecting to register app", error);
    return {
      id: "appRegistrationRejectRequest",
      code: ResponseCode.INTERNAL_SERVER_ERROR,
      error,
    };
  }
};
