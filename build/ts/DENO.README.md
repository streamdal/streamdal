## Typescript Client Protobuf Library for Snitch

A Deno compatible Typescript client library based on [protobuf-ts](https://github.com/timostamm/protobuf-ts) 
for Snitch Protobuf and GRPC. 

Example use:

```typescript

import { ExternalClient } from "snitch-protos/protos/external_api.client";
import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";

const transport = new GrpcWebFetchTransport({
  baseUrl: `${await getEnv("SNITCH_GRPC_WEB_URL") || "http://localhost:9091"}`,
  format: "binary",
});

const client = new ExternalClient(transport);

try {
  const { response } = await client.test({ input: "hello world" }, {
    meta: { "auth-token": "1234" },
  });
  console.log(response);
} catch (error) {
  console.log("error", error);
}

```

For a more complete example, see the [snitch-console](https://github.com/streamdal/snitch-console)