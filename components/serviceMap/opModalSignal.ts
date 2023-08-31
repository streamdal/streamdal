import { signal } from "@preact/signals";
import { Audience } from "snitch-protos/protos/sp_common.ts";
import { Pipeline } from "snitch-protos/protos/sp_pipeline.ts";

export type OpModalType = {
  audience: Audience;
  attachedPipeline?: Pipeline;
  clients: number;
  attach?: boolean;
  pause?: boolean;
  detach?: boolean;
};
export const opModal = signal<OpModalType | null>(null);
