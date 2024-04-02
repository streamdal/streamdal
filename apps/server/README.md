streamdal-server
================
[![Release](https://github.com/streamdal/streamdal/actions/workflows/apps-server-release.yml/badge.svg)](https://github.com/streamdal/streamdal/actions/workflows/apps-server-release.yml)
[![Pull Request](https://github.com/streamdal/streamdal/actions/workflows/apps-server-pr.yml/badge.svg)](https://github.com/streamdal/streamdal/actions/workflows/apps-server-pr.yml)
[![Discord](https://img.shields.io/badge/Community-Discord-4c57e8.svg)](https://discord.gg/streamdal)
<!-- TODO: NEED TO UPDATE GOREPORTCARD -->
<!-- [![Go Report Card](https://goreportcard.com/badge/github.com/streamdal/server)](https://goreportcard.com/report/github.com/streamdal/server) -->

_**Go server used for facilitating communications between SDKs and Console.**_

<sub>For more details, see the main
[streamdal repo](https://github.com/streamdal/streamdal).</sub>

---

The server exposes 3 APIs:

1. gRPC API on port `8082`
   1. Used by SDKs
2. gRPC-Web API on port `8083`
   1. Used by the UI component
3. REST API on port `8081`
   1. Exposes metrics, prometheus and health-check endpoints

## Configuration

The server can be configured via environment variables.

All environment variables are prefixed with `STREAMDAL_SERVER`.

| Variable        | Description                                          | Default                        | Required |
|-----------------|------------------------------------------------------|--------------------------------|----------| 
| `NODE_NAME` | Name for this node (MUST BE UNIQUE IN CLUSTER)       | NONE                           | ✅        |
| `AUTH_TOKEN` | Authentication token                                 | NONE                           | ✅        |
| `HTTP_API_LISTEN_ADDRESS` | HTTP API listen address    | :8081                          | ❌        |
| `GRPC_API_LISTEN_ADDRESS` | gRPC API listen address    | :8082                          | ❌        |
| `REDIS_URL` | Address for Redis cluster used by Streamdal server   | localhost:6379                 | ❌        |
| `REDIS_DATABASE` | Redis database number to use                         | 0                              | ❌        |
| `REDIS_PASSWORD` | Redis password             | NONE                           | ❌        |
| `HEALTH_FREQ_SEC` | How often to perform health checks on dependencies   | 60                             | ❌        |
| `SESSION_TTL` | TTL for session keys in RedisBackend live K/V bucket | 5s                             | ❌        |
| `WASM_DIR` | Directory where WASM files are stored                | ./assets/wasm                  | ❌        |
| `NUM_TAIL_WORKERS` | Number of tail workers to run                        | 4                              | ❌        |
| `NUM_BROADCAST_WORKERS` | Number of (Redis) broadcast workers to run           | 4                              | ❌        |
| `DEMO_MODE` | Run server in demo mode. This disables modifications | false                          | ❌        |
| `TELEMETRY_DISABLE` | Disable sending usage analytics to Streamdal         | false                          | ❌        |
| `TELEMETRY_ADDRESS` | Address to send telemetry to                         | "telemetry.streamdal.com:8125" | ❌        |
| `DEBUG` | Enable debug logging       | false                          | ❌        |

<sub>NOTE: For most up-to-date list of available configuration options, see [`config/config.go`](./config/config.go).</sub>

## Development

To develop _against_ the server, you must have Go installed as you 
will need to compile the server. You can run `make setup` which will install
it via `brew`. Otherwise, you will have to install Go manually.

To run the server and its dependencies, run: `make run/dev`

To develop the server itself, you'll want to only run the `redis` and
`envoy` dependencies and run `go run main.go` manually, on-demand.

## gRPC API Usage

You can view the available methods by looking at [protos](https://github.com/streamdal/streamdal/tree/main/libs/protos)
or doing it via `grpcurl`:

```bash
$ grpcurl -H "auth-token: 1234" --plaintext localhost:8082 describe
grpc.reflection.v1alpha.ServerReflection is a service:
service ServerReflection {
  rpc ServerReflectionInfo ( stream .grpc.reflection.v1alpha.ServerReflectionRequest ) returns ( stream .grpc.reflection.v1alpha.ServerReflectionResponse );
}
protos.External is a service:
service External {
  rpc CreateStep ( .protos.CreateStepRequest ) returns ( .protos.CreateStepResponse );
  rpc DeletePipeline ( .protos.DeletePipelineRequest ) returns ( .protos.DeletePipelineResponse );
  rpc DeleteStep ( .protos.DeleteStepRequest ) returns ( .protos.DeleteStepResponse );
  rpc GetPipeline ( .protos.GetPipelineRequest ) returns ( .protos.GetPipelineResponse );
  rpc GetPipelines ( .protos.GetPipelinesRequest ) returns ( .protos.GetPipelinesResponse );
  rpc GetService ( .protos.GetServiceRequest ) returns ( .protos.GetServiceResponse );
  rpc GetServices ( .protos.GetServicesRequest ) returns ( .protos.GetServicesResponse );
  rpc GetSteps ( .protos.GetStepsRequest ) returns ( .protos.GetStepsResponse );
  rpc SetPipeline ( .protos.SetPipelineRequest ) returns ( .protos.SetPipelineResponse );
  rpc Test ( .protos.TestRequest ) returns ( .protos.TestResponse );
  rpc UpdateStep ( .protos.UpdateStepRequest ) returns ( .protos.UpdateStepResponse );
}
protos.Internal is a service:
service Internal {
  rpc Heartbeat ( .protos.HeartbeatRequest ) returns ( .protos.StandardResponse );
  rpc Metrics ( .protos.MetricsRequest ) returns ( .protos.StandardResponse );
  rpc Notify ( .protos.NotifyRequest ) returns ( .protos.StandardResponse );
  rpc Register ( .protos.RegisterRequest ) returns ( stream .protos.CommandResponse );
}
```

You can test your gRPC integration by using the `protos.Internal/Test` method
either in code or via `grpcurl`: 

```
$ grpcurl -d '{"input": "Hello world"}' -plaintext -H "auth-token: 1234" \
localhost:8082 protos.External/Test
```

## Encryption

To run the server, you will have to generate an AES256 key and pass it via `--aes-key` flag or `STREAMDAL_SERVER_AES_KEY` 
environment variable.

To generate a key, you can use the following command:

```bash
openssl enc -aes-256-cbc -k secret -P -md sha1 -pbkdf2
```

## Release

Any push or merge to the `main` branch with any changes in `/apps/server/*` 
will automatically tag and release a new console version with `apps/server/vX.Y.Z`.

<sub>If you'd like to skip running the release action on push/merge to `main`,
include "norelease" anywhere in the commit message.</sub>

## Testing
1. The server test suite consists of integration tests (and thus require deps like `redis` to be running).
1. Make sure to run tests via `make test`.
