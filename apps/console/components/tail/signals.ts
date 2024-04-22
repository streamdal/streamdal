import { signal } from "@preact/signals";

export type TailSampleRate = {
  default?: boolean;
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
export const tailRunningSignal = signal<boolean>(false);
export const tailSamplingSignal = signal<TailSampleRate>({
  default: true,
  rate: defaultTailSampleRate.rate,
  intervalSeconds: defaultTailSampleRate.intervalSeconds,
});
export const tailDiffSignal = signal<boolean>(false);
