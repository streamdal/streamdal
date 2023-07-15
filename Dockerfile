# This Dockerfile utilizes a multi-stage builds
ARG ALPINE_VERSION=3.14

FROM golang:1.18-alpine$ALPINE_VERSION AS builder
ARG TARGETARCH
ARG TARGETOS

# Install necessary build tools
RUN apk --update add make bash curl git

# Switch workdir, otherwise we end up in /go (default)
WORKDIR /

# Copy everything into build container
COPY . .

# Build the application
RUN make build/$TARGETOS-$TARGETARCH

# Now in 2nd build stage
FROM library/alpine:$ALPINE_VERSION
ARG TARGETARCH
ARG TARGETOS

# Necessary depedencies
RUN apk --update add bash curl ca-certificates && update-ca-certificates

# Copy bin, tools, scripts, migrations
COPY --from=builder /build/go-template-$TARGETOS-$TARGETARCH /go-template-linux
COPY --from=builder /docker-entrypoint.sh /docker-entrypoint.sh
COPY --from=builder /backends/db/migrations /migrations
COPY --from=builder /dbmate /dbmate

RUN chmod +x /dbmate && chmod +x /docker-entrypoint.sh

EXPOSE 8080

CMD ["/docker-entrypoint.sh"]
