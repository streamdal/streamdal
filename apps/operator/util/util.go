package util

import (
	"context"
	"strings"

	"github.com/pkg/errors"
	"github.com/streamdal/streamdal/libs/protos/build/go/protos"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/metadata"
)

const (
	AuthTokenMetadata = "auth-token"
)

func ContainsString(slice []string, s string) bool {
	for _, item := range slice {
		if strings.Contains(item, s) {
			return true
		}
	}

	return false
}

func NewGrpcExternalClient(ctx context.Context, serverAddress, serverAuth string) (protos.ExternalClient, error) {
	// TODO: Expose a way to pass TLS options
	opts := []grpc.DialOption{
		grpc.WithTransportCredentials(insecure.NewCredentials()),
	}

	conn, err := grpc.DialContext(ctx, serverAddress, opts...)
	if err != nil {
		return nil, errors.Wrap(err, "failed to dial gRPC server")
	}

	client := protos.NewExternalClient(conn)

	outgoingCtx := metadata.NewOutgoingContext(ctx, metadata.Pairs(AuthTokenMetadata, serverAuth))

	if _, err := client.Test(outgoingCtx, &protos.TestRequest{Input: "ping"}); err != nil {
		return nil, errors.Wrap(err, "failed to complete grpc test request")
	}

	return client, nil
}
