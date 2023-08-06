import { dummyServiceMap } from "./dummies.ts";
import { client } from "./grpc.ts";

export const getServiceMap = async () => {
  try {
    const { response } = await client.getServiceMap({}, {
      meta: { "auth-token": "1234" },
    });

    return response;
  } catch (error) {
    console.error("error fetching service map", error);
    console.log("returning dummy data instead");
    return dummyServiceMap;
  }
};

export const getPipelines = async () => {
  const { response } = await client.getPipelines({}, {
    meta: { "auth-token": "1234" },
  });

  return response?.pipelines;
};
