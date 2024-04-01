package wasm

import (
	"context"
	"crypto/sha256"
	"os"

	"github.com/gofrs/uuid"
	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"
	"github.com/streamdal/streamdal/libs/protos/build/go/protos"
	"github.com/streamdal/streamdal/libs/protos/build/go/protos/steps"

	"github.com/streamdal/streamdal/apps/server/services/store"
	"github.com/streamdal/streamdal/apps/server/util"
)

type IWasm interface {
	PopulateWASMFields(ctx context.Context, pipeline *protos.Pipeline) error
	InjectSchemaInferenceForPipelines(ctx context.Context, pipelines []*protos.Pipeline) ([]*protos.Pipeline, error)
	InjectSchemaInferenceForSetPipelinesCommands(ctx context.Context, cmds []*protos.Command) (int, error)
	GetNumPreloaded() int          // Returns number of wasm modules preloaded into store at startup
	GetWasmStats() (*Stats, error) // Returns stats about ALL wasm modules in the store
}

var (
	config = map[string]protos.Wasm{
		"detective": {
			FunctionName: "f",
			XFilename:    "detective.wasm",
		},
		"transform": {
			FunctionName: "f",
			XFilename:    "transform.wasm",
		},
		"httprequest": {
			FunctionName: "f",
			XFilename:    "httprequest.wasm",
		},
		"kv": {
			FunctionName: "f",
			XFilename:    "kv.wasm",
		},
		"inferschema": {
			FunctionName: "f",
			XFilename:    "inferschema.wasm",
		},
		"validjson": {
			FunctionName: "f",
			XFilename:    "validjson.wasm",
		},
		"schemavalidation": {
			FunctionName: "f",
			XFilename:    "schemavalidation.wasm",
		},
	}
)

type Wasm struct {
	storeService    store.IStore
	wasmPrefix      string
	numPreloaded    int
	shutdownContext context.Context
	log             *logrus.Entry
}

func New(shutdownCtx context.Context, storeService store.IStore, wasmPrefix string) (*Wasm, error) {
	if shutdownCtx == nil {
		shutdownCtx = context.Background()
	}

	if storeService == nil {
		return nil, errors.New("store service is required")
	}

	if wasmPrefix == "" {
		return nil, errors.New("wasm prefix is required")
	}

	numPreloaded, err := preloadAll(storeService, wasmPrefix)
	if err != nil {
		return nil, errors.Wrap(err, "unable to preload bundled Wasm files")
	}

	return &Wasm{
		storeService:    storeService,
		wasmPrefix:      wasmPrefix,
		log:             logrus.WithField("pkg", "wasm"),
		numPreloaded:    numPreloaded,
		shutdownContext: shutdownCtx,
	}, nil
}

// GetNumPreloaded returns the number of bundled Wasm modules that were preloaded at startup
func (w *Wasm) GetNumPreloaded() int {
	return w.numPreloaded
}

type Stats struct {
	NumBundled int
	NumCustom  int
	All        []*protos.Wasm
}

// GetWasmStats returns statistics about the Wasm modules in the store
func (w *Wasm) GetWasmStats() (*Stats, error) {
	ctx := context.Background()

	all, err := w.storeService.GetAllWasm(ctx)
	if err != nil {
		return nil, errors.Wrap(err, "unable to get all wasm from store")
	}

	stats := &Stats{}

	for _, entry := range all {
		if entry.XBundled {
			stats.NumBundled += 1
		} else {
			stats.NumCustom += 1
		}

		// Strip wasm bytes to reduce log noise
		entry.Bytes = nil
	}

	stats.All = all

	return stats, nil
}

// PopulateWASMFields is used for populating WASM in *protos.Pipeline because
// the SDK may not have had audiences at startup and thus GetSetPipelinesByService()
// would not have returned any WASM data. This method attempts to read Wasm from
// the store (bundled wasm should be prepopulated at startup).`
func (w *Wasm) PopulateWASMFields(ctx context.Context, pipeline *protos.Pipeline) error {
	if pipeline == nil {
		return errors.New("pipeline cannot be nil")
	}

	for _, s := range pipeline.Steps {
		var (
			entry *protos.Wasm
			err   error
		)

		// TODO: Do this dynamically
		switch s.Step.(type) {
		// TODO: All of these should be fetched by 'id' only but that can only
		// happen once we have deterministic IDs for both bundled and custom WASM
		case *protos.PipelineStep_Detective:
			entry, err = w.storeService.GetWasmByName(ctx, "detective")
		case *protos.PipelineStep_Transform:
			entry, err = w.storeService.GetWasmByName(ctx, "transform")
		case *protos.PipelineStep_Kv:
			entry, err = w.storeService.GetWasmByName(ctx, "kv")
		case *protos.PipelineStep_HttpRequest:
			entry, err = w.storeService.GetWasmByName(ctx, "httprequest")
		case *protos.PipelineStep_InferSchema:
			entry, err = w.storeService.GetWasmByName(ctx, "inferschema")
		case *protos.PipelineStep_SchemaValidation:
			entry, err = w.storeService.GetWasmByName(ctx, "schemavalidation")
		case *protos.PipelineStep_ValidJson:
			entry, err = w.storeService.GetWasmByName(ctx, "validjson")
		case *protos.PipelineStep_Custom:
			// Fetching by ID because we don't have a name on the step
			entry, err = w.storeService.GetWasmByID(ctx, s.GetXWasmId())
		default:
			return errors.Errorf("unknown pipeline step type: %T", s.Step)
		}

		if err != nil {
			return errors.Wrapf(err, "error loading '%T' (id: '%s') Wasm entry", s.Step, s.GetXWasmId())
		}

		s.XWasmFunction = &entry.FunctionName
		s.XWasmBytes = entry.Bytes
		s.XWasmId = &entry.Id
	}

	return nil
}

func (w *Wasm) GenerateSchemaInferencePipeline(ctx context.Context) (*protos.Pipeline, error) {
	pipeline := &protos.Pipeline{
		Id:   util.GenerateUUID(),
		Name: "Schema Inference (auto-generated pipeline)",
		Steps: []*protos.PipelineStep{
			{
				Name: "Infer Schema (auto-generated step)",
				Step: &protos.PipelineStep_InferSchema{
					InferSchema: &steps.InferSchemaStep{
						CurrentSchema: make([]byte, 0),
					},
				},
			},
		},
	}

	if err := w.PopulateWASMFields(ctx, pipeline); err != nil {
		return nil, errors.Wrap(err, "error populating schema inference Wasm fields")
	}

	return pipeline, nil
}

// InjectSchemaInferenceForSetPipelinesCommands is a helper function for injecting
// a schema inference pipeline into a slice of SetPipelines commands. This is
// basically InjectSchemaInferenceForPipeline() but for commands. Returns number
// of times schema inference was injected.
func (w *Wasm) InjectSchemaInferenceForSetPipelinesCommands(ctx context.Context, cmds []*protos.Command) (int, error) {
	if len(cmds) == 0 {
		return 0, nil
	}

	var numInjected int

	for _, cmd := range cmds {
		if cmd.GetSetPipelines() == nil {
			w.log.Debugf("skipping injection for non-SetPipelines command for audience '%s'\n", util.AudienceToStr(cmd.Audience))
			continue
		}

		updatedPipelines, err := w.InjectSchemaInferenceForPipelines(ctx, cmd.GetSetPipelines().Pipelines)
		if err != nil {
			return 0, errors.Wrap(err, "error injecting schema inference pipeline")
		}

		cmd.GetSetPipelines().Pipelines = updatedPipelines

		numInjected += 1
	}

	return numInjected, nil
}

// InjectSchemaInferenceForPipelines will inject a schema inference pipeline into
// the given slice of pipelines.
func (w *Wasm) InjectSchemaInferenceForPipelines(ctx context.Context, pipelines []*protos.Pipeline) ([]*protos.Pipeline, error) {
	schemaInferencePipeline, err := w.GenerateSchemaInferencePipeline(ctx)
	if err != nil {
		return nil, errors.Wrap(err, "unable to generate schema inference pipeline")
	}

	return append([]*protos.Pipeline{schemaInferencePipeline}, pipelines...), nil
}

// Helper for preloading all bundled Wasm modules; returns number of wasm modules preloaded.
func preloadAll(storeService store.IStore, wasmPrefix string) (int, error) {
	var numPreloaded int

	for name, _ := range config {
		if err := preload(context.Background(), storeService, name, wasmPrefix); err != nil {
			return numPreloaded, errors.Wrapf(err, "unable to preload bundled Wasm file '%s'", name)
		}

		numPreloaded += 1
	}

	return numPreloaded, nil
}

// Preloads a WASM file from disk (using optional prefix) and writes it to redis
func preload(ctx context.Context, storeService store.IStore, name string, wasmPrefix ...string) error {
	entry, ok := config[name]
	if !ok {
		return errors.Errorf("wasm entry '%s' not found in config", name)
	}

	if entry.XFilename == "" {
		return errors.Errorf("wasm entry '%s' does not have a filename", name)
	}

	fullPath := entry.XFilename

	if len(wasmPrefix) > 0 {
		fullPath = wasmPrefix[0] + "/" + fullPath
	}

	// Attempt to read data
	data, err := os.ReadFile(fullPath)
	if err != nil {
		return errors.Wrapf(err, "unable to read wasm file '%s'", fullPath)
	}

	// Generate ID
	// TODO: This probably needs to be updated to use filename or name because
	// it is currently not deterministic (if the file contents change, the ID will change)
	wasmID := determinativeUUID(data)
	if wasmID == "" {
		return errors.Errorf("unable to generate UUID for wasm file '%s'", fullPath)
	}

	entry.Id = wasmID
	entry.Name = name
	entry.Bytes = data
	entry.XBundled = true
	entry.XCreatedAtUnixTsNsUtc = util.NowUnixTsNsUtcPtr()

	// Delete ALL bundled entries
	if err := storeService.DeleteWasmByName(ctx, name); err != nil {
		if err != store.ErrWasmNotFound {
			return errors.Wrapf(err, "unable to delete existing '%s' bundled wasm", name)
		}
	}

	// Write bundled wasm to store
	if err := storeService.SetWasm(ctx, name, entry.Id, &entry); err != nil {
		return errors.Wrapf(err, "unable to set wasm entry '%s'", name)
	}

	return nil
}

func determinativeUUID(data []byte) string {
	hash := sha256.Sum256(data)

	id, err := uuid.FromBytes(hash[16:])
	if err != nil {
		return ""
	}

	return id.String()
}
