import { signal } from "@preact/signals";
import { Audience } from "streamdal-protos/protos/sp_common.ts";
import { Pipeline } from "streamdal-protos/protos/sp_pipeline.ts";

export type OpModalType = {
  audience: Audience;
  displayType: string;
  attachedPipeline?: Pipeline & { paused?: boolean };
  clients: number;
  pause?: boolean;
  resume?: boolean;
  detach?: boolean;
  delete?: boolean;
  schemaModal?: boolean;
  deleteService?: boolean;
};

export const OP_MODAL_KEY = "OP_MODAL_VALUE";

export const deserializeOp = () => {
  try {
    const savedOperation = localStorage.getItem(OP_MODAL_KEY);
    const parsedOperation = JSON.parse(savedOperation!);
    return parsedOperation;
  } catch (e) {
    console.error("failed to deserialize and parse saved audience", e);
  }
  return null;
};

export const opModal = signal<OpModalType | null>(deserializeOp());
