package util

import (
	"context"

	"github.com/google/go-cmp/cmp"
	"github.com/pkg/errors"
	"github.com/streamdal/streamdal/libs/protos/build/go/protos"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/metadata"
	"google.golang.org/protobuf/testing/protocmp"
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

func GetNotificationConfigByID(id string, configs []*protos.NotificationConfig) *protos.NotificationConfig {
	for _, n := range configs {
		if n.GetId() == id {
			return n
		}
	}

	return nil
}

func GetPipelineByID(id string, pipelines []*protos.Pipeline) *protos.Pipeline {
	for _, p := range pipelines {
		if p.GetId() == id {
			return p
		}
	}

	return nil
}

// CompareNotificationConfig compares two NotificationConfig protos and returns
// a boolean indicating whether they are equal and a human readable diff if they
// are not equal.
func CompareNotificationConfig(a, b *protos.NotificationConfig) (bool, string) {
	opts := cmp.Options{
		// We need this so that baseline compare pkg can properly compare proto
		// messages.
		protocmp.Transform(),

		// Leaving this here as an example of how to ignore fields. Note that
		// the protocmp.Transform() option is required for this to work.
		//protocmp.IgnoreFields(&protos.NotificationConfig{}, "_created_by"),
	}

	diff := cmp.Diff(a, b, opts...)

	return diff == "", diff
}

func ComparePipeline(a, b *protos.Pipeline) (bool, string) {
	opts := cmp.Options{
		// We need this so that baseline compare pkg can properly compare proto
		// messages.
		protocmp.Transform(),

		// Leaving this here as an example of how to ignore fields. Note that
		// the protocmp.Transform() option is required for this to work.
		//protocmp.IgnoreFields(&protos.Pipeline{}, "_created_by"),
	}

	diff := cmp.Diff(a, b, opts...)

	return diff == "", diff
}
