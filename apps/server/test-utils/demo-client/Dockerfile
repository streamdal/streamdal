# Use the specified Alpine version for the build stage
ARG ALPINE_VERSION=3.20

# Use the Go Alpine image for the builder stage
FROM golang:1.22-bullseye AS builder
ARG TARGETARCH
ARG TARGETOS

# Install necessary build tools
RUN apk --update add make bash curl git

# Set the working directory
WORKDIR /

# Copy everything into the build container
COPY . .

# Build the application using Makefile (assuming it's set up for your project)
RUN go get .
RUN CGO_ENABLED=1 make build/$TARGETOS-$TARGETARCH

# Now, in the 2nd build stage, use a lightweight Alpine image
FROM alpine:$ALPINE_VERSION
ARG TARGETARCH
ARG TARGETOS

# Install SSL certificates and some quality-of-life tools
RUN apk --update add bash curl ca-certificates && update-ca-certificates

# Copy the built binary, test data, and assets directory
COPY --from=builder /build/demo-client-$TARGETOS-$TARGETARCH /demo-client
COPY --from=builder /assets /assets

# Make the binary executable
RUN chmod +x /demo-client

# Entrypoint and command to run the specified go command
ENTRYPOINT ["/demo-client"]
