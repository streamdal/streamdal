import { client, meta } from "./grpc.ts";
import { GetAllResponse } from "streamdal-protos/protos/sp_external.ts";
import { PipelineInfo } from "streamdal-protos/protos/sp_info.ts";
import { Audience } from "streamdal-protos/protos/sp_common.ts";
import { setServiceSignal } from "../components/serviceMap/serviceSignal.ts";
import { serverErrorSignal } from "root/lib/serverError.ts";
import { SERVER_ERROR } from "./serverError.ts";

export type ConfigType = { [key: string]: string };
export type PipelinesType = { [key: string]: PipelineInfo };

export const initAllServices = async () => {
  const allServices = await getAll();
  allServices && setServiceSignal(allServices);
};

export const getAll = async (): Promise<GetAllResponse | null> => {
  try {
    const { response } = await client.getAll({}, meta);
    serverErrorSignal.value = "";
    return response;
  } catch (e) {
    serverErrorSignal.value = SERVER_ERROR;
    console.error("error calling grpc getAll", e);
    return Promise.resolve(null);
  }
};

export const getPipelines = async () => {
  const { response } = await client.getPipelines({}, meta);
  return response?.pipelines?.sort((a, b) => a.name.localeCompare(b.name));
};

export const getPipeline = async (pipelineId: string) => {
  const { response } = await client.getPipeline({ pipelineId }, meta);
  return response?.pipeline;
};

export const getNotifications = async () => {
  const { response } = await client.getNotifications({}, meta);

  return response.notifications;
};

export const getSchema = async (audience: Audience) => {
  try {
    const { response } = await client.getSchema({ audience }, meta);
    return response;
  } catch (e) {
    console.error("Error fetching schema", e);
    return {};
  }
};
