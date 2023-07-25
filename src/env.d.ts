export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      ENV: "test" | "dev" | "prod";
      SNITCH_URL?: string;
      SNITCH_TOKEN?: string;
      SNITCH_SERVICE_NAME?: string;
      SNITCH_PIPELINE_TIMEOUT?: string;
      SNITCH_STEP_TIMEOUT?: string;
      SNITCH_DRY_RUN?: boolean;
    }
  }
}
