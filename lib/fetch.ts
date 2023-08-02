import { dummyPipelines, dummyServiceMap } from "./dummies.ts";
import { client } from "../routes/index.tsx";

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
