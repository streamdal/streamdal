import { dummyServiceMap } from "./dummies.ts";
import { client, meta } from "./grpc.ts";

export const getServiceMap = async () => {
  try {
    const { response } = await client.getServiceMap({}, meta);
    return response;
  } catch (error) {
    console.error("error fetching service map", error);
    console.log("returning dummy data instead");
    return dummyServiceMap;
  }
};

export const getPipelines = async () => {
  const { response } = await client.getPipelines({}, meta);
  return response?.pipelines;
};

export const getPipeline = async (pipelineId: string) => {
  const { response } = await client.getPipeline({ pipelineId }, meta);
  return response?.pipeline;
};
