# Start from the official Golang base image
ARG ALPINE_VERSION=3.20

FROM golang:1.22-bullseye AS builder
ARG TARGETARCH
ARG TARGETOS

# Set the Current Working Directory inside the container
WORKDIR /

# Copy everything into build container
COPY . .

# Build the Go app
RUN CGO_ENABLED=1 make build/$TARGETOS-$TARGETARCH

# Next stage
FROM debian:bookworm-slim
ARG TARGETARCH
ARG TARGETOS

# SSL and quality-of-life tools
RUN apt-get update && apt-get autoclean && apt-get install ca-certificates -y && update-ca-certificates

# Copy bin
COPY --from=builder /build/log-processor-$TARGETOS-$TARGETARCH /log-processor

RUN chmod +x /log-processor

EXPOSE 6000

CMD ["/log-processor"]
