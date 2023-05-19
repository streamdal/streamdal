package dataqual

import (
	"context"
	"log"
	"os"
	"sync"
	"time"

	"github.com/pkg/errors"
	"github.com/wasmerio/wasmer-go/wasmer"

	protos "github.com/batchcorp/plumber-schemas/build/go/protos/common"

	"github.com/streamdal/dataqual/common"
	"github.com/streamdal/dataqual/detective"
)

type Module string
type Mode string

const (
	Consumer Mode = "consumer"
	Producer Mode = "producer"

	Match     Module = "match"
	Transform Module = "transform"
)

var (
	ErrEmptyBus           = errors.New("bus cannot be empty")
	ErrMissingShutdownCtx = errors.New("shutdown context cannot be nil")
)

type IDataQual interface {
	ApplyRules(mode Mode, key string, data []byte) ([]byte, error)
}

type DataQual struct {
	*Config
	functions    map[Module]*function
	bus          string
	rules        map[Mode][]*protos.RuleSet
	functionsMtx *sync.RWMutex
	rulesMtx     *sync.RWMutex
	plumber      *Plumber
	shutdownCtx  context.Context
}

type Config struct {
	//PlumberURL   string // http address to access plumber with
	//PlumberToken string // token to access plumber API with
	Bus         string
	ShutdownCtx context.Context
}

func New(cfg *Config) (*DataQual, error) {
	plumberURL := os.Getenv("PLUMBER_URL")
	plumberToken := os.Getenv("PLUMBER_TOKEN")

	// We instantiate this library based on whether or not we have a plumber URL+token
	// If these are not provided, the wrapper library will not perform rule checks and
	// will act as normal
	if plumberURL == "" || plumberToken == "" {
		return nil, nil
	}

	if err := validateConfig(cfg); err != nil {
		return nil, errors.Wrap(err, "unable to validate config")
	}

	plumber, err := newServer(plumberURL, plumberToken)
	if err != nil {
		return nil, errors.Wrap(err, "failed to connect to plumber")
	}

	// Get initial ruleset
	rules, err := plumber.GetRules(context.Background(), cfg.Bus)
	if err != nil {
		return nil, errors.Wrap(err, "failed to get initial ruleset")
	}

	dq := &DataQual{
		functions:    make(map[Module]*function),
		functionsMtx: &sync.RWMutex{},
		plumber:      plumber,
		rules:        rules,
		rulesMtx:     &sync.RWMutex{},
		Config:       cfg,
	}

	dq.watchForRuleUpdates()

	return dq, nil
}

func validateConfig(cfg *Config) error {
	if cfg.Bus == "" {
		return ErrEmptyBus
	}

	if cfg.ShutdownCtx == nil {
		return ErrMissingShutdownCtx
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

func (d *DataQual) ApplyRules(mode Mode, key string, data []byte) ([]byte, error) {
	d.rulesMtx.RLock()
	modeSets, ok := d.rules[mode]
	d.rulesMtx.RUnlock()

	// TODO: combine rulesets if mode == both

	if !ok {
		// No rules for this mode, nothing to do
		return data, nil
	}

	for _, ruleSet := range modeSets {
		// Check if we have rules for this key
		// Key = kafka topic or rabbit routing/binding key
		group, ok := ruleSet.Rules[key]
		if !ok {
			// No rules for this key, nothing to do
			continue
		}

		for _, rule := range group.Rules {
			switch rule.Type {
			case protos.RuleType_RULE_TYPE_TRANSFORM:
				cfg := rule.GetTransformConfig()
				if cfg == nil {
					return nil, errors.New("BUG: transform rule is missing transform config")
				}

				transformed, err := d.RunTransform(cfg.Path, cfg.Value, data)
				if err != nil {
					return nil, errors.Wrapf(err, "failed to run transform on field '%s'", cfg.Path)
				}

				return transformed, nil
			case protos.RuleType_RULE_TYPE_MATCH:
				cfg := rule.GetMatchConfig()
				if cfg == nil {
					return nil, errors.New("BUG: match rule is missing match config")
				}

				isMatch, err := d.RunMatch(detective.MatchType(cfg.Type), cfg.Path, data)
				if err != nil {
					return nil, errors.Wrapf(err, "failed to run match '%s' on field '%s'", cfg.Type, cfg.Path)
				}

				// Didn't hit, nothing further to do
				if !isMatch {
					continue
				}

				// Hit, apply failure rule
				if rule.FailureMode == protos.RuleFailureMode_RULE_FAILURE_MODE_REJECT {
					// TODO: think this is sufficient enough for calling lib to know to reject
					return nil, nil
				}

				return d.Fail(data, rule)
			case protos.RuleType_RULE_TYPE_CUSTOM:
				// TODO: implement eventually
				return data, nil
			default:
				return nil, errors.Errorf("unknown rule type: %s", rule.Type)
			}
		}
	}

	return nil, nil
}

func (d *DataQual) Fail(data []byte, rule *protos.Rule) ([]byte, error) {
	switch rule.FailureMode {
	case protos.RuleFailureMode_RULE_FAILURE_MODE_TRANSFORM:
		return d.failTransform(data, rule.GetTransform())
	case protos.RuleFailureMode_RULE_FAILURE_MODE_DLQ:
		return d.failDLQ(data, rule.GetDlq())
	case protos.RuleFailureMode_RULE_FAILURE_MODE_ALERT_SLACK:
		return d.failSlack(data, rule.GetAlertSlack())
	default:
		return nil, errors.Errorf("unknown failure mode: %s", rule.FailureMode)
	}
}

func (d *DataQual) failTransform(data []byte, cfg *protos.FailureModeTransform) ([]byte, error) {
	transformed, err := d.RunTransform(cfg.Path, cfg.Value, data)
	if err != nil {
		return nil, errors.Wrap(err, "failed to run transform on failure mode")
	}

	return transformed, nil
}

func (d *DataQual) failDLQ(data []byte, cfg *protos.FailureModeDLQ) ([]byte, error) {
	// TODO: implement
	return nil, nil
}

func (d *DataQual) failSlack(data []byte, cfg *protos.FailureModeAlertSlack) ([]byte, error) {
	// TODO: implement
	return nil, nil
}

func (d *DataQual) watchForRuleUpdates() {
	// TODO: need some kind of shutdown context here probably
	for {
		select {
		case <-d.shutdownCtx.Done():
			return
		default:
			// NOOP
		}

		ruleSets, err := d.plumber.GetRules(context.Background(), d.bus)
		if err != nil {
			log.Println("failed to get rules:", err)
		}

		d.rulesMtx.Lock()

		for _, ruleSet := range ruleSets {
			var mode Mode
			switch ruleSet.Mode {
			case protos.RuleMode_RULE_MODE_PUBLISH:
				mode = Producer
			case protos.RuleMode_RULE_MODE_CONSUME:
				mode = Consumer
			}

			d.rules[mode] = append(d.rules[mode], ruleSet)
		}

		d.rulesMtx.Unlock()

		time.Sleep(time.Second * 30) // TODO: config?
	}
}
