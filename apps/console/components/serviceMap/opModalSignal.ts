import { signal } from "@preact/signals";
import { Audience } from "streamdal-protos/protos/sp_common.ts";
import { Pipeline } from "streamdal-protos/protos/sp_pipeline.ts";

export type OpModalType = {
  audience?: Audience;
  displayType?: string;
  clients: number;
  attachPipeline?: Pipeline | null;
  pausePipeline?: Pipeline | null;
  resumePipeline?: Pipeline | null;
  detachPipeline?: Pipeline | null;
  deletePipeline?: Pipeline | null;
  deleteOperation?: boolean;
  schemaModal?: boolean;
  deleteService?: boolean;
  tailRateModal?: boolean;
};

export const initOpModal: OpModalType = { clients: 0 };

export const OP_MODAL_KEY = "OP_MODAL_VALUE";

export const deserializeOp = (): OpModalType => {
  try {
    const savedOperation = localStorage.getItem(OP_MODAL_KEY);
    return JSON.parse(savedOperation!);
  } catch (e) {
    console.error("failed to deserialize and parse saved audience", e);
  }
  return initOpModal;
};

export const opModal = signal<OpModalType>(deserializeOp());
