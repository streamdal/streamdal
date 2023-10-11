export const grpcUrl = async () =>
  (await Deno.env.get("STREAMDAL_GRPC_WEB_URL")) ||
  "http://localhost:9091";

export const grpcToken = async () =>
  (await Deno.env.get("STREAMDAL_GRPC_AUTH_TOKEN")) ||
  "1234";
