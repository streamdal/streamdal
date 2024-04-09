import { signal } from "@preact/signals";

export type TailSampleRate = {
  rate: number;
  intervalSeconds: number;
};

export type TailData = { timestamp: Date; data: string; originalData: string };

export const defaultTailSampleRate = {
  rate: 1,
  intervalSeconds: 1,
  maxRate: 25,
};

export const tailSignal = signal<TailData[] | null>(null);
export const tailSocketSignal = signal<WebSocket | null>(null);
export const tailEnabledSignal = signal<boolean>(false);
export const tailPausedSignal = signal<boolean>(false);
export const tailSamplingSignal = signal<TailSampleRate>({
  rate: defaultTailSampleRate.rate,
  intervalSeconds: defaultTailSampleRate.intervalSeconds,
});
export const tailDiffSignal = signal<boolean>(false);
