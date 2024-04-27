# Start from the official Golang base image
ARG ALPINE_VERSION=3.18

FROM golang:1.22-alpine$ALPINE_VERSION AS builder
ARG TARGETARCH
ARG TARGETOS

# Install necessary build tools
RUN apk --update add make bash curl git

# Set the Current Working Directory inside the container
WORKDIR /

# Copy everything into build container
COPY . .

# Build the Go app
RUN make build/$TARGETOS-$TARGETARCH

# Next stage
FROM library/alpine:$ALPINE_VERSION
ARG TARGETARCH
ARG TARGETOS

# SSL and quality-of-life tools
RUN apk --update add bash curl ca-certificates && update-ca-certificates

# Copy bin
COPY --from=builder /build/log-processor-$TARGETOS-$TARGETARCH /log-processor

RUN chmod +x /log-processor

EXPOSE 6000

CMD ["/log-processor"]
