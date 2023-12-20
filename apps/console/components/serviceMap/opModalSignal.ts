import { signal } from "@preact/signals";
import { Audience } from "streamdal-protos/protos/sp_common.ts";
import { Pipeline } from "streamdal-protos/protos/sp_pipeline.ts";

export type OpModalType = {
  audience: Audience;
  displayType: string;
  clients: number;
  pausePipeline?: Pipeline | null;
  resumePipeline?: Pipeline | null;
  detachPipeline?: Pipeline | null;
  deletePipeline?: Pipeline | null;
  schemaModal?: boolean;
  deleteService?: boolean;
};

export const OP_MODAL_KEY = "OP_MODAL_VALUE";

export const deserializeOp = () => {
  try {
    const savedOperation = localStorage.getItem(OP_MODAL_KEY);
    return JSON.parse(savedOperation!);
  } catch (e) {
    console.error("failed to deserialize and parse saved audience", e);
  }
  return null;
};

export const opModal = signal<OpModalType | null>(deserializeOp());
