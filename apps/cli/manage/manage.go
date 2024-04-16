package manage

import (
	"context"
	"fmt"
	"os"

	"github.com/cactus/go-statsd-client/v5/statsd"
	"github.com/charmbracelet/log"
	"github.com/dselans/go-prettyjson-tview"
	"github.com/pkg/errors"
	"github.com/streamdal/streamdal/libs/protos/build/go/protos"
	"github.com/streamdal/streamdal/libs/protos/build/go/protos/shared"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/metadata"
	"google.golang.org/protobuf/encoding/protojson"
	"google.golang.org/protobuf/proto"

	"github.com/streamdal/streamdal/apps/cli/config"
	"github.com/streamdal/streamdal/apps/cli/validate"
)

const (
	AuthTokenMetadata = "auth-token"
)

type Manage struct {
	cfg    *config.Config
	logger *log.Logger
	t      statsd.Statter
	client protos.ExternalClient
}

func New(cfg *config.Config, logger *log.Logger, t statsd.Statter) (*Manage, error) {
	if err := validateParams(cfg, logger, t); err != nil {
		return nil, errors.Wrap(err, "unable to complete validation")
	}

	opts := []grpc.DialOption{
		grpc.WithTransportCredentials(insecure.NewCredentials()),
	}

	conn, err := grpc.Dial(cfg.Server, opts...)
	if err != nil {
		return nil, errors.Wrap(err, "failed to dial gRPC server")
	}

	client := protos.NewExternalClient(conn)

	ctx := metadata.NewOutgoingContext(context.Background(), metadata.Pairs(AuthTokenMetadata, cfg.Auth))

	if _, err := client.Test(ctx, &protos.TestRequest{Input: "ping"}); err != nil {
		return nil, errors.Wrap(err, "failed to complete grpc test request")
	}

	return &Manage{
		cfg:    cfg,
		logger: logger,
		t:      t,
		client: client,
	}, nil
}

func (m *Manage) CreatePipeline(cfg *config.Config) error {
	if err := validate.ManageCreatePipeline(cfg); err != nil {
		return errors.Wrap(err, "unable to validate manage create pipeline params")
	}

	pipelineJSON, err := os.ReadFile(cfg.Manage.Create.Pipeline.JSON)
	if err != nil {
		return errors.Wrapf(err, "failed to read pipeline JSON file '%s'", cfg.Manage.Create.Pipeline.JSON)
	}

	ctx := metadata.NewOutgoingContext(context.Background(), metadata.Pairs(AuthTokenMetadata, cfg.Auth))

	req := &protos.CreatePipelineRequest{
		PipelineJson: pipelineJSON,
	}

	resp, err := m.client.CreatePipeline(ctx, req)
	if err != nil {
		return errors.Wrap(err, "failed to create pipeline")
	}

	return m.prettyPrint(resp)
}

func (m *Manage) UpdatePipeline(cfg *config.Config) error {
	if err := validate.ManageUpdatePipeline(cfg); err != nil {
		return errors.Wrap(err, "unable to validate manage update pipeline params")
	}

	pipelineJSON, err := os.ReadFile(cfg.Manage.Create.Pipeline.JSON)
	if err != nil {
		return errors.Wrapf(err, "failed to read pipeline JSON file '%s'", cfg.Manage.Create.Pipeline.JSON)
	}

	ctx := metadata.NewOutgoingContext(context.Background(), metadata.Pairs(AuthTokenMetadata, cfg.Auth))

	// JSON must contain the pipeline ID
	req := &protos.UpdatePipelineRequest{
		PipelineJson: pipelineJSON,
	}

	resp, err := m.client.UpdatePipeline(ctx, req)
	if err != nil {
		return errors.Wrap(err, "failed to update pipeline")
	}

	return m.prettyPrint(resp)
}

func (m *Manage) GetPipeline(cfg *config.Config) error {
	if err := validate.ManageGetPipeline(cfg); err != nil {
		return errors.Wrap(err, "unable to validate manage get pipeline params")
	}

	ctx := metadata.NewOutgoingContext(context.Background(), metadata.Pairs(AuthTokenMetadata, cfg.Auth))

	var (
		resp proto.Message
		err  error
	)

	if cfg.Manage.Get.Pipeline.ID == "" {
		resp, err = m.client.GetPipelines(ctx, &protos.GetPipelinesRequest{})
	} else {
		resp, err = m.client.GetPipeline(ctx, &protos.GetPipelineRequest{
			PipelineId: cfg.Manage.Get.Pipeline.ID,
		})
	}

	if err != nil {
		return errors.Wrap(err, "failed to get pipeline(s)")
	}

	return m.prettyPrint(resp)
}

func (m *Manage) prettyPrint(resp proto.Message) error {
	data, err := protojson.Marshal(resp)
	if err != nil {
		return errors.Wrap(err, "failed to convert server response to JSON")
	}

	formattedData, err := prettyjson.Format(data)
	if err != nil {
		m.logger.Warnf("unable to format grpc response: %s", err)
		fmt.Println(string(data))
	} else {
		fmt.Println(string(formattedData))
	}

	return nil
}

func (m *Manage) DeletePipeline(cfg *config.Config) error {
	if err := validate.ManageDeletePipeline(cfg); err != nil {
		return errors.Wrap(err, "unable to validate manage delete pipeline params")
	}

	ctx := metadata.NewOutgoingContext(context.Background(), metadata.Pairs(AuthTokenMetadata, cfg.Auth))

	resp, err := m.client.DeletePipeline(ctx, &protos.DeletePipelineRequest{
		PipelineId: cfg.Manage.Delete.Pipeline.ID,
	})

	if err != nil {
		return errors.Wrap(err, "failed to get wasm module(s)")
	}

	return m.prettyPrint(resp)
}

func stringPointer(s string) *string {
	if s == "" {
		return nil
	}

	return &s
}

func (m *Manage) CreateWasm(cfg *config.Config) error {
	if err := validate.ManageCreateWasm(cfg); err != nil {
		return errors.Wrap(err, "unable to validate manage create wasm params")
	}

	wasmData, err := os.ReadFile(cfg.Manage.Create.Wasm.File)
	if err != nil {
		return errors.Wrapf(err, "failed to read wasm file '%s'", cfg.Manage.Create.Wasm.File)
	}

	ctx := metadata.NewOutgoingContext(context.Background(), metadata.Pairs(AuthTokenMetadata, cfg.Auth))

	req := &protos.CreateWasmRequest{
		Wasm: &shared.WasmModule{
			Bytes:       wasmData,
			Function:    cfg.Manage.Create.Wasm.Function,
			Name:        cfg.Manage.Create.Wasm.Name,
			Description: stringPointer(cfg.Manage.Create.Wasm.ModuleDescription),
			Version:     stringPointer(cfg.Manage.Create.Wasm.ModuleVersion),
			Url:         stringPointer(cfg.Manage.Create.Wasm.ModuleURL),
		},
	}

	resp, err := m.client.CreateWasm(ctx, req)
	if err != nil {
		return errors.Wrap(err, "failed to create wasm module")
	}

	return m.prettyPrint(resp)
}

func (m *Manage) UpdateWasm(cfg *config.Config) error {
	if err := validate.ManageUpdateWasm(cfg); err != nil {
		return errors.Wrap(err, "unable to validate manage update wasm params")
	}

	wasmData, err := os.ReadFile(cfg.Manage.Create.Wasm.File)
	if err != nil {
		return errors.Wrapf(err, "failed to read wasm file '%s'", cfg.Manage.Create.Wasm.File)
	}

	ctx := metadata.NewOutgoingContext(context.Background(), metadata.Pairs(AuthTokenMetadata, cfg.Auth))

	req := &protos.UpdateWasmRequest{
		Wasm: &shared.WasmModule{
			Id:          cfg.Manage.Update.Wasm.ID,
			Bytes:       wasmData,
			Function:    cfg.Manage.Create.Wasm.Function,
			Name:        cfg.Manage.Create.Wasm.Name,
			Description: stringPointer(cfg.Manage.Create.Wasm.ModuleDescription),
			Version:     stringPointer(cfg.Manage.Create.Wasm.ModuleVersion),
			Url:         stringPointer(cfg.Manage.Create.Wasm.ModuleURL),
		},
	}

	resp, err := m.client.UpdateWasm(ctx, req)
	if err != nil {
		return errors.Wrap(err, "failed to update wasm module")
	}

	return m.prettyPrint(resp)
}

func (m *Manage) GetWasm(cfg *config.Config) error {
	if err := validate.ManageGetWasm(cfg); err != nil {
		return errors.Wrap(err, "unable to validate manage get wasm params")
	}

	ctx := metadata.NewOutgoingContext(context.Background(), metadata.Pairs(AuthTokenMetadata, cfg.Auth))

	var (
		resp proto.Message
		err  error
	)

	if cfg.Manage.Get.Wasm.ID == "" {
		resp, err = m.client.GetAllWasm(ctx, &protos.GetAllWasmRequest{})
	} else {
		resp, err = m.client.GetWasm(ctx, &protos.GetWasmRequest{
			Id: cfg.Manage.Get.Wasm.ID,
		})
	}

	if err != nil {
		return errors.Wrap(err, "failed to get wasm module(s)")
	}

	return m.prettyPrint(resp)
}

func (m *Manage) DeleteWasm(cfg *config.Config) error {
	if err := validate.ManageDeleteWasm(cfg); err != nil {
		return errors.Wrap(err, "unable to validate manage delete wasm params")
	}

	ctx := metadata.NewOutgoingContext(context.Background(), metadata.Pairs(AuthTokenMetadata, cfg.Auth))

	resp, err := m.client.DeleteWasm(ctx, &protos.DeleteWasmRequest{
		Ids: []string{cfg.Manage.Delete.Wasm.ID},
	})

	if err != nil {
		return errors.Wrap(err, "failed to get wasm module(s)")
	}

	return m.prettyPrint(resp)
}

func validateParams(cfg *config.Config, logger *log.Logger, t statsd.Statter) error {
	if cfg == nil {
		return errors.New("config cannot be nil")
	}

	if logger == nil {
		return errors.New("logger cannot be nil")
	}

	if t == nil {
		return errors.New("telemetry cannot be nil")
	}

	return nil
}
