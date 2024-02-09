export const SAMPLE_DEFAULT = {
  sampleRate: 25,
  sampleIntervalSeconds: 1,
};

export class TokenBucket {
  private sampleRate: number;
  private tokens: number;
  private sampleIntervalSeconds: number;
  private lastRefill: number;

  constructor(
    sampleRate: number | undefined,
    sampleIntervalSeconds: number | undefined
  ) {
    this.sampleRate = sampleRate ?? SAMPLE_DEFAULT.sampleRate;
    this.sampleIntervalSeconds =
      (sampleIntervalSeconds ?? SAMPLE_DEFAULT.sampleIntervalSeconds) / 1000;
    this.lastRefill = Math.floor(Date.now() / 1000);
    this.tokens = this.sampleRate;
  }

  private refill() {
    const now = Math.floor(Date.now() / 1000);
    const rate = (now - this.lastRefill) / this.sampleIntervalSeconds;

    this.tokens = Math.min(
      this.sampleRate,
      this.tokens + Math.floor(rate * this.sampleRate)
    );
    this.lastRefill = now;
  }

  public consume(): boolean {
    this.refill();

    if (this.tokens > 0) {
      this.tokens -= 1;
      return true;
    }

    return false;
  }
}
