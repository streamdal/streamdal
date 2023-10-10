## Streamdal Typescript Protobuf Library for Deno

A Deno compatible Typescript client library based on [protobuf-ts](https://github.com/timostamm/protobuf-ts) 
for Streamdal's Protobuf and GRPC. 

Example use:

```typescript

import { ExternalClient } from "protos/protos/external_api.client";
import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";

const transport = new GrpcWebFetchTransport({
  baseUrl: `${await getEnv("STREAMDAL_GRPC_WEB_URL") || "http://localhost:9091"}`,
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

For a more complete example, see the [console](https://github.com/streamdal/console)
