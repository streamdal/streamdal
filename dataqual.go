package dataqual

import (
	"os"
	"sync"

	"github.com/streamdal/dataqual/detective"

	"github.com/pkg/errors"
	"github.com/streamdal/dataqual/common"
	"github.com/wasmerio/wasmer-go/wasmer"
)

type Module string

type IDataQual interface {
	RunMatch(mt detective.MatchType, path string, data []byte) (bool, error)
	RunTransform(path, replace string, data []byte) ([]byte, error)
}

var (
	Match     Module = "match"
	Transform Module = "transform"
)

var (
	ErrEmptyPlumberURL   = errors.New("PlumberURL cannot be empty")
	ErrEmptyPlumberToken = errors.New("PlumberToken cannot be empty")
)

type DataQual struct {
	functions    map[Module]*function
	functionsMtx *sync.RWMutex
	plumber      *Plumber
}

type Config struct {
	PlumberURL   string // http address to access plumber with
	PlumberToken string // token to access plumber API with
}

func New(cfg *Config) (*DataQual, error) {
	if err := validateConfig(cfg); err != nil {
		return nil, errors.Wrap(err, "invalid config")
	}

	plumberURL := getenv("PLUMBER_URL", "localhost:9090")
	plumberToken := getenv("PLUMBER_TOKEN", "streamdal")

	// TODO: predownload wasm modules somehow,
	// TODO: or if we don't have rules at this point, download standard modules at least
	plumber, err := newServer(plumberURL, plumberToken)
	if err != nil {
		return nil, errors.Wrap(err, "failed to connect to plumber")
	}

	return &DataQual{
		functions:    make(map[Module]*function),
		functionsMtx: &sync.RWMutex{},
		plumber:      plumber,
	}, nil
}

func getenv(name, def string) string {
	if val := os.Getenv(name); val != "" {
		return val
	}

	return def
}

func validateConfig(cfg *Config) error {
	if cfg.PlumberURL == "" {
		return ErrEmptyPlumberURL
	}

	if cfg.PlumberToken == "" {
		return ErrEmptyPlumberToken
	}

	return nil
}

func createWASMInstance(wasmBytes []byte) (*wasmer.Instance, error) {
	if len(wasmBytes) == 0 {
		return nil, errors.New("wasm data is empty")
	}

	store := wasmer.NewStore(wasmer.NewEngine())

	// Compiles the module
	module, err := wasmer.NewModule(store, wasmBytes)
	if err != nil {
		return nil, errors.Wrap(err, "failed to compile module")
	}

	wasiEnv, err := wasmer.NewWasiStateBuilder("wasi-program").Finalize()
	if err != nil {
		return nil, errors.Wrap(err, "failed to generate wasi env")
	}

	importObject, err := wasiEnv.GenerateImportObject(store, module)
	if err != nil {
		return nil, errors.Wrap(err, "failed to generate import object")
	}

	// Instantiates the module
	instance, err := wasmer.NewInstance(module, importObject)
	if err != nil {
		return nil, errors.Wrap(err, "failed to instantiate module")
	}

	return instance, nil
}

func (d *DataQual) RunTransform(path, replace string, data []byte) ([]byte, error) {
	// Get WASM module
	f, err := d.getFunction(Transform)
	if err != nil {
		return nil, errors.Wrap(err, "failed to get wasm data")
	}

	request := &common.TransformRequest{
		Path:  path,
		Value: replace,
		Data:  data,
	}

	req, err := request.MarshalJSON()
	if err != nil {
		return nil, errors.Wrap(err, "unable to generate request")
	}

	returnData, err := f.Exec(req)
	if err != nil {
		return nil, errors.Wrap(err, "error during wasm exec")
	}

	resp := &common.TransformResponse{}

	if err := resp.UnmarshalJSON(returnData); err != nil {
		return nil, errors.Wrap(err, "error during tinyjson.Unmarshal")
	}

	if resp.Error != "" {
		return nil, errors.New(resp.Error)
	}

	return resp.Data, nil
}

func (d *DataQual) RunMatch(mt detective.MatchType, path string, data []byte) (bool, error) {
	// Get WASM module
	f, err := d.getFunction(Match)
	if err != nil {
		return false, errors.Wrap(err, "failed to get wasm data")
	}

	request := &common.MatchRequest{
		MatchType: mt,
		Path:      path,
		Data:      data,
	}

	req, err := request.MarshalJSON()
	if err != nil {
		panic("unable to generate request: " + err.Error())
	}

	returnData, err := f.Exec(req)
	if err != nil {
		return false, errors.Wrap(err, "error during wasm exec")
	}

	resp := &common.MatchResponse{}

	if err := resp.UnmarshalJSON(returnData); err != nil {
		return false, errors.Wrap(err, "error during tinyjson.Unmarshal")
	}

	if resp.Error != "" {
		return false, errors.New(resp.Error)
	}

	return resp.IsMatch, nil
}
