package util

import (
	"context"

	"github.com/pkg/errors"
	"github.com/streamdal/streamdal/libs/protos/build/go/protos"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/metadata"
)

const (
	AuthTokenMetadata = "auth-token"
)

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

// NotificationInList checks if a notification is in a list of notification configs.
// TODO: This should _eventually_ be a "deep equal" check as 'id' does not guarantee equality.
func NotificationInList(n *protos.NotificationConfig, list []*protos.NotificationConfig) bool {
	for _, ln := range list {
		if n.GetId() == ln.GetId() {
			return true
		}
	}

	return false
}
