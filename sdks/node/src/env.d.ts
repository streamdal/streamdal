export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      ENV: "test" | "dev" | "prod";
      STREAMDAL_URL?: string;
      STREAMDAL_TOKEN?: string;
      STREAMDAL_SERVICE_NAME?: string;
      STREAMDAL_PIPELINE_TIMEOUT?: string;
      STREAMDAL_STEP_TIMEOUT?: string;
      STREAMDAL_DRY_RUN?: string;
    }
  }
}
