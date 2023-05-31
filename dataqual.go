package dataqual

import (
	"context"
	"log"
	"os"
	"sync"
	"time"

	"github.com/pkg/errors"
	"github.com/wasmerio/wasmer-go/wasmer"

	// Forcing import to allow running on M1
	_ "github.com/wasmerio/wasmer-go/wasmer/packaged/lib/darwin-aarch64"

	protos "github.com/batchcorp/plumber-schemas/build/go/protos/common"

	"github.com/streamdal/dataqual/common"
	"github.com/streamdal/dataqual/detective"
)

type Module string
type Mode int

const (
	Publish Mode = 1 // Must match proto's mode
	Consume Mode = 2 // Must match proto's mode

	// RuleUpdateInterval is how often to check for rule updates
	RuleUpdateInterval = time.Second * 30

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
	rules        map[Mode]map[string][]*protos.Rule
	ruleSetMap   map[string]string
	ruleSetMtx   *sync.RWMutex
	functionsMtx *sync.RWMutex
	rulesMtx     *sync.RWMutex
	plumber      IPlumberClient
	shutdownCtx  context.Context
}

type Config struct {
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

	dq := &DataQual{
		functions:    make(map[Module]*function),
		functionsMtx: &sync.RWMutex{},
		plumber:      plumber,
		rules:        make(map[Mode]map[string][]*protos.Rule),
		rulesMtx:     &sync.RWMutex{},
		ruleSetMap:   make(map[string]string),
		ruleSetMtx:   &sync.RWMutex{},
		Config:       cfg,
	}

	go dq.watchForRuleUpdates()

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

func (d *DataQual) runTransform(path, replace string, data []byte) ([]byte, error) {
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
	defer d.rulesMtx.RUnlock()

	if !ok {
		// No rules for this mode, nothing to do
		return data, nil
	}

	// Check if we have rules for this key
	// Key = kafka topic or rabbit routing/binding key
	rules, ok := modeSets[key]
	if !ok {
		// No rules for this key, nothing to do
		return data, nil
	}

	for _, rule := range rules {
		switch rule.Type {
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

			switch rule.FailureMode {
			case protos.RuleFailureMode_RULE_FAILURE_MODE_REJECT:
				// Downstream libraries will check if data == nil and not publish/consume the message
				return nil, nil
			case protos.RuleFailureMode_RULE_FAILURE_MODE_TRANSFORM:
				return d.failTransform(data, rule.GetTransform())
			case protos.RuleFailureMode_RULE_FAILURE_MODE_ALERT_SLACK:
				fallthrough
			case protos.RuleFailureMode_RULE_FAILURE_MODE_DLQ:
				if err := d.plumber.SendRuleNotification(context.Background(), data, rule); err != nil {
					return nil, errors.Wrap(err, "failed to send rule notification")
				}

				// Return nil so downstream lib will not publish/consume the message
				return nil, nil
			default:
				return nil, errors.Errorf("unknown rule failure mode: %s", rule.FailureMode)
			}
		case protos.RuleType_RULE_TYPE_CUSTOM:
			// TODO: implement eventually
			return data, nil
		default:
			return nil, errors.Errorf("unknown rule type: %s", rule.Type)
		}
	}

	return data, nil
}

func (d *DataQual) failTransform(data []byte, cfg *protos.FailureModeTransform) ([]byte, error) {
	transformed, err := d.runTransform(cfg.Path, cfg.Value, data)
	if err != nil {
		return nil, errors.Wrap(err, "failed to run transform on failure mode")
	}

	return transformed, nil
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

		if err := d.getRuleUpdates(); err != nil {
			log.Println("failed to get rule updates:", err)
		}

		time.Sleep(RuleUpdateInterval)
	}
}

func (d *DataQual) getRuleUpdates() error {
	ruleSets, err := d.plumber.GetRules(context.Background(), d.bus)
	if err != nil {
		return errors.Wrap(err, "failed to get rules")
	}

	// First key is mode: producer, consumer
	// Second map key is rule key: kafka topic, rabbit routing/binding key
	// We need a way to look these up O(1)
	rules := make(map[Mode]map[string][]*protos.Rule)
	ruleSetMap := make(map[string]string)

	for _, set := range ruleSets {
		if _, ok := rules[Mode(set.Mode)]; !ok {
			rules[Mode(set.Mode)] = make(map[string][]*protos.Rule)
		}

		for _, rule := range set.Rules {
			if _, ok := rules[Mode(set.Mode)][set.Key]; !ok {
				rules[Mode(set.Mode)][set.Key] = make([]*protos.Rule, 0)
			}

			rules[Mode(set.Mode)][set.Key] = append(rules[Mode(set.Mode)][set.Key], rule)
			ruleSetMap[rule.Id] = set.Id
		}
	}

	d.rulesMtx.Lock()
	d.rules = rules
	d.rulesMtx.Unlock()

	d.ruleSetMtx.Lock()
	d.ruleSetMap = ruleSetMap
	d.ruleSetMtx.Unlock()

	return nil
}

// getRuleSetIDForRule gets the ruleset ID for a given rule ID.
// This is needed when communicating rule failure alerts to plumber
func (d *DataQual) getRuleSetIDForRule(ruleID string) (string, bool) {
	d.ruleSetMtx.RLock()
	defer d.ruleSetMtx.RUnlock()

	ruleSetID, ok := d.ruleSetMap[ruleID]
	return ruleSetID, ok
}
