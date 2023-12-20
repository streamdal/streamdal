import { signal } from "@preact/signals";

export const serverErrorSignal = signal<string | null>(null);
