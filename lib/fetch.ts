import {dummyServiceMap} from "./dummies.ts";
import {client, meta} from "./grpc.ts";

export const getServiceMap = async () => {
    try {
        const {response} = await client.getServiceMap({}, meta);

        return response;
    } catch (error) {
        console.error("error fetching service map", error);
        console.log("returning dummy data instead");
        return dummyServiceMap;
    }
};

export const getPipelines = async () => {
    const {response} = await client.getPipelines({}, meta);

    return response?.pipelines?.sort((a, b) => a.name.localeCompare(b.name));
};

export const getPipeline = async (pipelineId: string) => {
    const {response} = await client.getPipeline({pipelineId}, meta);
    return response?.pipeline;
};

export const pausePipeline = async (pipeline: any) => {
    const {response} = await client.pausePipeline(
        {pipelineId: pipeline},
        meta,
    );
    return response;
};

export const attachPipeline = async (pipeline: string) => {
    const {response} = await client.attachPipeline(
        {pipelineId: pipeline},
        meta,
    );
    return response;
};
