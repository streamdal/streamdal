import { signal } from "@preact/signals";
import { Audience } from "snitch-protos/protos/common.ts";

export const opModal = signal<Audience | null>(null);
