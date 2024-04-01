package wasm

import (
	"crypto/sha256"
	"os"

	"github.com/gofrs/uuid"
	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"
	"github.com/streamdal/streamdal/libs/protos/build/go/protos"

	"github.com/streamdal/streamdal/apps/server/services/store"
)

var (
	config = map[string]*protos.Wasm{
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
	storeService store.IStore
	wasmPrefix   string
	log          *logrus.Entry
}

func New(storeService store.IStore, wasmPrefix string) (*Wasm, error) {
	if storeService == nil {
		return nil, errors.New("store service is required")
	}

	if wasmPrefix == "" {
		return nil, errors.New("wasm prefix is required")
	}

	if err := preloadBundled(storeService, wasmPrefix); err != nil {
		return nil, errors.Wrap(err, "unable to preload bundled Wasm files")
	}

	return &Wasm{
		storeService: storeService,
		wasmPrefix:   wasmPrefix,
		log:          logrus.WithField("pkg", "wasm"),
	}, nil
}

func preloadBundledAll(storeService store.IStore, wasmPrefix string) error {
	for name := range config {
		if _, err := preloadBundledAll(storeService, name, wasmPrefix); err != nil {
			return errors.Wrapf(err, "unable to preload bundled Wasm file '%s'", name)
		}
	}

	return nil
}

// Preloads a WASM file from disk and writes it to redis
func preloadBundledOne(storeService store.IStore, name string, prefix ...string) error {
	mapping, ok := config[name]
	if !ok {
		return errors.Errorf("wasm mapping '%s' not found", name)
	}

	if mapping.XFilename == "" {
		return errors.Errorf("wasm mapping '%s' does not have a filename", name)
	}

	fullPath := mapping.XFilename

	if len(prefix) > 0 {
		fullPath = prefix[0] + "/" + fullPath
	}

	// Attempt to read data
	data, err := os.ReadFile(fullPath)
	if err != nil {
		return errors.Wrapf(err, "unable to read wasm file '%s'", fullPath)
	}

	// Generate ID
	wasmID := determinativeUUID(data)
	if wasmID == "" {
		return errors.Errorf("unable to generate UUID for wasm file '%s'", fullPath)
	}

	entry := &protos.Wasm{
		Id:           wasmID,
		Name:         mapping.Name,
		Bytes:        data,
		FunctionName: mapping.FunctionName,
		XFilename:    mapping.XFilename,
		XBundled:     true,
	}

	// Delete existing entry (if it exists), using exclusive lock
	if err := storeService.DeleteWasmByName(entry.Id, &store.Option{
		ExclusiveLock: true,
	}); err != nil {

	}
}

func determinativeUUID(data []byte) string {
	hash := sha256.Sum256(data)

	id, err := uuid.FromBytes(hash[16:])
	if err != nil {
		return ""
	}

	return id.String()
}
