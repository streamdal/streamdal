import { signal } from "@preact/signals";
import { DisplayServiceMap, ServiceMap } from "../../lib/serviceMap.ts";

export const serviceSignal = signal<ServiceMap | null>(
  null,
);

export const serviceDisplaySignal = signal<DisplayServiceMap | null>(
  null,
);
