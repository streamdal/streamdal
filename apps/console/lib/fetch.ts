import { client, meta } from "./grpc.ts";
import { REST_TOKEN, REST_URL } from "./configs.ts";
import { GetAllResponse } from "streamdal-protos/protos/sp_external.ts";
import { PipelineInfo } from "streamdal-protos/protos/sp_info.ts";
import { Audience } from "streamdal-protos/protos/sp_common.ts";
import { setServiceSignal } from "../components/serviceMap/serviceSignal.ts";
import { serverErrorSignal } from "root/lib/serverError.ts";
import hljs from "root/static/vendor/highlight@11.8.0.min.js";
import { SERVER_ERROR } from "./serverError.ts";
import { SchemaType } from "root/routes/schema/[id]/index.tsx";

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

export const getNotification = async (notificationId: string) => {
  const { response } = await client.getNotification({ notificationId }, meta);
  return response?.notification;
};

export const getNotifications = async () => {
  const { response } = await client.getNotifications({}, meta);
  return Object.values(response.notifications)?.sort((a: any, b: any) =>
    a.name.localeCompare(b.name)
  );
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

export const getFormattedSchema = async (
  audience: Audience,
): Promise<SchemaType> => {
  try {
    const { schema } = await getSchema(audience);
    const decoded = new TextDecoder().decode(schema?.jsonSchema);
    const parsed = JSON.parse(decoded);
    const highlighted = hljs.highlight(JSON.stringify(parsed, null, 2), {
      language: "json",
    }).value;

    return {
      schema: highlighted,
      version: schema?.Version || 0,
      lastUpdated: schema?.Metadata?.last_updated,
    };
  } catch (e) {
    console.error("error fetching and parsing json schema", e);
    return {
      schema: "",
      version: 0,
    };
  }
};

const serverHttpHeaders = {
  Authorization: `Bearer ${REST_TOKEN}`,
};

export const getConfigs = async (): Promise<any> => {
  const url = `${REST_URL}/api/v1/config`;
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: serverHttpHeaders,
    });
    const body = await response.json();
    return {
      config: body,
    };
  } catch (err) {
    console.error("Error fetching configs", err);
    return {};
  }
};
