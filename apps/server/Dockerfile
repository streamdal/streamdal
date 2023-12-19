# This Dockerfile utilizes a multi-stage build
ARG ALPINE_VERSION=3.18

FROM golang:1.20-alpine$ALPINE_VERSION AS builder
ARG TARGETARCH
ARG TARGETOS

# Install necessary build tools
RUN apk --update add make bash curl git

# Switch to root dir (default for go is /go)
WORKDIR /

# Copy everything into build container
COPY . .

# Switch to assets/wasm
WORKDIR /assets/wasm

# Download wasm release specified in 'version' file
RUN sh ./download-wasm.sh

# Switch back to root dir
WORKDIR /

# Build the application
RUN make build/$TARGETOS-$TARGETARCH

# Now in 2nd build stage
FROM library/alpine:$ALPINE_VERSION
ARG TARGETARCH
ARG TARGETOS

# SSL and quality-of-life tools
RUN apk --update add bash curl ca-certificates && update-ca-certificates

# Copy bin & WASM
COPY --from=builder /build/server-$TARGETOS-$TARGETARCH /streamdal-server
COPY --from=builder /assets/wasm/* /assets/wasm/

RUN chmod +x /streamdal-server

EXPOSE 8081
EXPOSE 8082

CMD ["/streamdal-server", "--debug"]
