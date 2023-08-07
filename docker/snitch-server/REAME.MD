
# Snitch Server Docker Deployment

This repository contains the Docker Compose setup to deploy the Snitch Server, NATS, Envoy, and a Web Console for Snitch.

## Pre-requisites

- Docker Engine v19.03.0+
- Docker Compose v1.25.5+

## Setup

1. **Navigate to the Docker directory:**
   ```bash
   cd docker/snitch-server/
   ```

2. **Start the services using Docker Compose:**
   ```bash
   docker-compose up -d
   ```

## Services

- **NATS**: A high performance NATS Server. Exposes ports:
  - `4222`: NATS port
  - `6222`
  - `8222`: HTTP Monitor

- **Snitch Servers**: Three instances of Snitch Server are deployed. Each server connects to NATS and serves on ports `8080` and `9090`.

- **Envoy**: A service to proxy gRPC-web to gRPC. Serves on port `9091`.

- **Web Console**: Web interface for Snitch. Connects to the Envoy service and serves on port `3000`.

## Configuration

### NATS:

NATS is configured using the `nats-server.conf` file located in the `assets/nats/` directory.

### Snitch Servers:

Each Snitch Server instance has the following environment variables:

- `SNITCH_SERVER_AUTH_TOKEN`: Authentication token.
- `SNITCH_SERVER_NATSURL`: URL for connecting to NATS.

### Web Console:

The Web Console connects to the Envoy service for gRPC-web to gRPC translation. It has the environment variable `SNITCH_GRPC_WEB_URL` set to `http://envoy:9091`.

## Volumes

- **jetstream-data**: A named volume to store NATS JetStream data.

## Networks

- **snitch-network**: A custom Docker network for inter-service communication.

## Stopping the Services

To stop and remove all running containers defined in the compose file:

```bash
docker-compose down
```
