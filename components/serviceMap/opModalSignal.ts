import { signal } from "@preact/signals";
import { Audience } from "snitch-protos/protos/sp_common.ts";
import { Pipeline } from "snitch-protos/protos/sp_pipeline.ts";

export type OpModalType = {
  audience: Audience;
  attachedPipeline?: Pipeline;
  clients: number;
  attach?: boolean;
  schema?: any;
  pause?: boolean;
  detach?: boolean;
  delete?: boolean;
};

export const opModal = signal<OpModalType | null>(null);
