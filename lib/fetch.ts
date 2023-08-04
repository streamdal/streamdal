import { dummyPipelines, dummyServiceMap } from "./dummies.ts";
import { client } from "./grpc.ts";

export const getServiceMap = async () => {
  try {
    const { response } = await client.getServiceMap({}, {
      meta: { "auth-token": "1234" },
    });

    return response;
  } catch (error) {
    console.log("error fetching service map", error);
    console.log("returning dummy data instead");
    return dummyServiceMap;
  }
};

export const getPipelines = async () => {
  try {
    const { response } = await client.getPipelines({}, {
      meta: { "auth-token": "1234" },
    });

    return response?.pipelines?.length || dummyPipelines;
  } catch (error) {
    console.log("error fetching pipelines", error);
    console.log("sending dummy data until this is implemented");
    return dummyPipelines;
  }
};

export const pausePipeline = async (pipeline: any) => {
  try {
    const { response } = await client.pausePipeline({ pipelineId: pipeline }, {
      meta: { "auth-token": "1234" },
    });
    console.log(response)
    return response;
  } catch (error) {
    console.log("error pausing pipeline", error);
    console.log("dummy data??");
    return dummyPipelines;
  }
};

export const attachPipeline = async(pipeline: string) => {
  try {
    const { response } = await client.attachPipeline({ pipelineId: pipeline }, {
      meta: { "auth-token": "1234" },
    });
    console.log(response)
    return response;
  } catch (error) {
    console.log("error pausing pipeline", error);
    console.log("dummy data??");
    return dummyPipelines;
  }
};

