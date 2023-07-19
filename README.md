# snitch-server

The server component in the `snitch` ecosystem.

The server exposes two APIs: 

1. gRPC API on `:9090`
2. REST API on `:8080`

## Development

To develop _against_ the `snitch-server`, you must have Go installed as you 
will need to compile the server. You can run `make setup` which will install
it via `brew`. Otherwise, you will have to install Go manually.

To run the full stack, run: `make run/dev`

## gRPC API Usage

You can view the available methods by looking at [protos](https://github.com/streamdal/protos)
or doing it via `grpcurl`:

```bash
$ grpcurl -H "auth-token: 1234" --plaintext localhost:9090 describe
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
localhost:9090 protos.External/Test
```

