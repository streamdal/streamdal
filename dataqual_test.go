package dataqual

import (
	"context"
	"os"
	"path"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/batchcorp/plumber-schemas/build/go/protos/common"
	protos "github.com/batchcorp/plumber-schemas/build/go/protos/common"
	"github.com/google/uuid"
	"github.com/pkg/errors"

	"github.com/streamdal/dataqual/detective"
	"github.com/streamdal/dataqual/logger"
	"github.com/streamdal/dataqual/logger/loggerfakes"
	"github.com/streamdal/dataqual/plumber/plumberfakes"
)

func TestMatch(t *testing.T) {
	cases := []struct {
		data     []byte
		search   string
		expected bool
	}{
		{[]byte(`{"type": "hello world"}`), "hello", true},
		{[]byte(`{"type": "hello world"}`), "gmail", false},
	}

	d, err := setup(Match)
	if err != nil {
		t.Error(err)
	}

	for _, c := range cases {
		isMatch, err := d.runMatch(context.Background(), "string_contains_any", "type", c.data, []string{c.search})
		if err != nil {
			t.Error("error during runMatch: " + err.Error())
		}

		if isMatch != c.expected {
			t.Errorf("expected %v, got %v", c.expected, isMatch)
		}
	}
}

func TestValidateConfig(t *testing.T) {
	t.Run("invalid config", func(t *testing.T) {
		err := validateConfig(nil)
		if err != ErrEmptyConfig {
			t.Error("expected error but got nil")
		}
	})

	t.Run("empty data source", func(t *testing.T) {
		cfg := &Config{
			DataSource:   "",
			ShutdownCtx:  context.Background(),
			PlumberURL:   "http://localhost:9090",
			PlumberToken: "foo",
			DryRun:       false,
			WasmTimeout:  time.Second,
			Logger:       &logger.NoOpLogger{},
		}
		err := validateConfig(cfg)
		if err != ErrEmptyDataSource {
			t.Error("expected ErrEmptyDataSource")
		}
	})

	t.Run("empty context", func(t *testing.T) {
		cfg := &Config{
			DataSource:   "kafka",
			ShutdownCtx:  nil,
			PlumberURL:   "http://localhost:9090",
			PlumberToken: "foo",
			DryRun:       false,
			WasmTimeout:  time.Second,
			Logger:       &logger.NoOpLogger{},
		}
		err := validateConfig(cfg)
		if err != ErrMissingShutdownCtx {
			t.Error("expected ErrMissingShutdownCtx")
		}
	})

	t.Run("invalid wasm timeout duration", func(t *testing.T) {
		os.Setenv("DATAQUAL_WASM_TIMEOUT", "foo")
		cfg := &Config{
			DataSource:   "kafka",
			ShutdownCtx:  context.Background(),
			PlumberURL:   "http://localhost:9090",
			PlumberToken: "foo",
			DryRun:       false,
			Logger:       &logger.NoOpLogger{},
		}
		err := validateConfig(cfg)
		if err == nil || !strings.Contains(err.Error(), "unable to parse DATAQUAL_WASM_TIMEOUT") {
			t.Error("expected time.ParseDuration error")
		}
		os.Unsetenv("DATAQUAL_WASM_TIMEOUT")
	})
}

func TestGetRuleUpdates(t *testing.T) {
	rsID := uuid.New().String()
	ruleID := uuid.New().String()

	fakePlumber := getFakePlumber()
	fakePlumber.GetRulesStub = func(context.Context, string) ([]*common.RuleSet, error) {
		return []*common.RuleSet{
			{
				Id:         rsID,
				Name:       "Transform message",
				Mode:       common.RuleMode_RULE_MODE_PUBLISH,
				DataSource: "kafka",
				Key:        "mytopic",
				Version:    2,
				Rules: map[string]*common.Rule{
					ruleID: {
						Id:   ruleID,
						Type: common.RuleType_RULE_TYPE_MATCH,
						RuleConfig: &common.Rule_MatchConfig{
							MatchConfig: &common.RuleConfigMatch{
								Path: "payload.ccnum",
								Type: "pii_creditcard",
							},
						},
						FailureModeConfigs: []*common.FailureMode{
							{
								Mode: common.RuleFailureMode_RULE_FAILURE_MODE_TRANSFORM,
								Config: &common.FailureMode_Transform{
									Transform: &common.FailureModeTransform{
										Path:  "payload.ccnum",
										Value: "****",
									},
								},
							},
						},
					},
				},
			},
		}, nil
	}

	d := &DataQual{
		Plumber:    fakePlumber,
		ruleSetMtx: &sync.RWMutex{},
		rulesMtx:   &sync.RWMutex{},
		Config: &Config{
			DataSource: "kafka",
		},
	}

	// Ensure method doesn't error
	if err := d.getRuleUpdates(); err != nil {
		t.Error("unexpected error: " + err.Error())
	}

	// Ensure we set ruleID -> ruleSetID association
	v, ok := d.ruleSetMap[ruleID]
	if !ok {
		t.Error("expected rule to be in ruleSetMap")
	}
	if v != rsID {
		t.Errorf("expected rule set id %s, got %s", rsID, v)
	}

	// We should have gotten 1 rule
	if len(d.rules) != 1 {
		t.Errorf("expected 1 rule set, got %d", len(d.rules))
	}

	if _, ok := d.rules[Publish]["mytopic"]; !ok {
		t.Error("expected publish rule for topic 'mytopic' to be in rules map")
	}

	if len(d.rules[Publish]["mytopic"]) != 1 {
		t.Errorf("expected 1 rule for topic 'mytopic', got %d", len(d.rules[Publish]["mytopic"]))
	}

}

func TestRunMatch(t *testing.T) {
	d := &DataQual{
		Plumber:      getFakePlumber(),
		functions:    map[Module]*function{},
		functionsMtx: &sync.RWMutex{},
		Config: &Config{
			DataSource: "kafka",
		},
	}

	data := []byte(`{"type": "hello world"}`)

	matched, err := d.runMatch(context.Background(), detective.StringContainsAny, "type", data, []string{"hello"})
	if err != nil {
		t.Error("unexpected error: " + err.Error())
	}

	if !matched {
		t.Error("expected match")
	}
}

func TestFailTransform(t *testing.T) {
	d := &DataQual{
		Plumber:      getFakePlumber(),
		functions:    map[Module]*function{},
		functionsMtx: &sync.RWMutex{},
		Config: &Config{
			DataSource: "kafka",
		},
	}

	data := []byte(`{"type": "hello world"}`)

	cfg := &common.FailureModeTransform{
		Type:  common.FailureModeTransform_TRANSFORM_TYPE_REPLACE,
		Path:  "type",
		Value: `"****"`,
	}

	want := []byte(`{"type": "****"}`)
	got, err := d.failTransform(context.Background(), data, cfg)
	if err != nil {
		t.Error("unexpected error: " + err.Error())
	}

	if string(got) != string(want) {
		t.Errorf("expected transformed data to be %s', got %s", string(want), string(got))
	}
}

func TestApplyRules_MaxData(t *testing.T) {
	fakeLogger := &loggerfakes.FakeLogger{}

	d := &DataQual{
		functions:    map[Module]*function{},
		functionsMtx: &sync.RWMutex{},
		Config: &Config{
			DataSource: "kafka",
			Logger:     fakeLogger,
		},
	}

	got, err := d.ApplyRules(context.Background(), Publish, "somekewy", make([]byte, DefaultMaxDataSize+1))
	if err != nil {
		t.Error("unexpected error: " + err.Error())
	}

	// Ensure a warning was logged
	if fakeLogger.WarnfCallCount() != 1 {
		t.Error("expected warning to be logged")
	}

	// Ensure data was returned unmodified
	if len(got) != DefaultMaxDataSize+1 {
		t.Errorf("expected data to be %d bytes, got %d", DefaultMaxDataSize+1, len(got))
	}
}

func TestApplyRules_FailTransform(t *testing.T) {
	d := setupForFailure([]*common.FailureMode{
		{
			Mode: common.RuleFailureMode_RULE_FAILURE_MODE_TRANSFORM,
			Config: &common.FailureMode_Transform{
				Transform: &common.FailureModeTransform{
					Type:  common.FailureModeTransform_TRANSFORM_TYPE_REPLACE,
					Path:  "type",
					Value: `"****"`,
				},
			},
		},
	})

	want := `{"type": "****"}`
	got, err := d.ApplyRules(context.Background(), Publish, "mytopic", []byte(`{"type": "hello world"}`))
	if err != nil {
		t.Error("unexpected error: " + err.Error())
	}

	if string(got) != want {
		t.Errorf("expected data to be %s, got %s", want, string(got))
	}
}

func TestApplyRules_FailReject(t *testing.T) {
	d := setupForFailure([]*common.FailureMode{
		{
			Mode:   common.RuleFailureMode_RULE_FAILURE_MODE_REJECT,
			Config: &common.FailureMode_Reject{},
		},
	})

	got, err := d.ApplyRules(context.Background(), Publish, "mytopic", []byte(`{"type": "hello world"}`))

	// We should be getting back an error indicating the message was dropped
	if err != ErrMessageDropped {
		t.Error("expected ErrMessageDropped error")
	}

	// Ensure data was dropped
	if len(got) != 0 {
		t.Errorf("expected data to be empty, got %s", string(got))
	}
}

func TestApplyRules_FailPlumber(t *testing.T) {

	d := setupForFailure([]*common.FailureMode{
		{
			Mode: common.RuleFailureMode_RULE_FAILURE_MODE_DLQ,
			Config: &common.FailureMode_Dlq{
				Dlq: &common.FailureModeDLQ{
					StreamdalToken: uuid.New().String(),
				},
			},
		},
	})

	// Overwrite since we need SendRuleNotificationCallCount()
	fakePlumber := getFakePlumber()
	d.Plumber = fakePlumber

	got, err := d.ApplyRules(context.Background(), Publish, "mytopic", []byte(`{"type": "hello world"}`))

	// We should be getting back an error indicating the message was dropped
	if err != ErrMessageDropped {
		t.Error("expected ErrMessageDropped error")
	}

	// Ensure data was dropped
	if len(got) != 0 {
		t.Errorf("expected data to be empty, got %s", string(got))
	}

	// Ensure SendRuleNotification was called
	if fakePlumber.SendRuleNotificationCallCount() != 1 {
		t.Error("expected SendRuleNotification to be called")
	}
}

func BenchmarkMatchSmallJSON(b *testing.B) {
	matchBench("json-examples/small.json", b)
}

func BenchmarkMatchMediumJSON(b *testing.B) {
	matchBench("json-examples/medium.json", b)
}

func BenchmarkMatchLargeJSON(b *testing.B) {
	matchBench("json-examples/large.json", b)
}

func BenchmarkTransformSmallJSON(b *testing.B) {
	transformBench("json-examples/small.json", b)
}

func BenchmarkTransformMediumJSON(b *testing.B) {
	transformBench("json-examples/medium.json", b)
}

func BenchmarkTransformLargeJSON(b *testing.B) {
	transformBench("json-examples/large.json", b)
}

func matchBench(fileName string, b *testing.B) {
	jsonData, err := os.ReadFile(fileName)
	if err != nil {
		b.Error("unable to read json: " + err.Error())
	}

	d, err := setup(Match)
	if err != nil {
		b.Error(err)
	}

	b.ResetTimer()

	ctx, cancel := context.WithTimeout(context.Background(), time.Minute)
	defer cancel()

	for i := 0; i < b.N; i++ {
		_, err := d.runMatch(ctx, "string_contains_any", "firstname", jsonData, []string{"Rani"})
		if err != nil {
			cancel()
			b.Fatal("error during runMatch: " + err.Error())
		}
		cancel()
	}
}

func transformBench(fileName string, b *testing.B) {
	jsonData, err := os.ReadFile(fileName)
	if err != nil {
		b.Error("unable to read json: " + err.Error())
	}

	d, err := setup(Transform)
	if err != nil {
		b.Error(err)
	}

	b.ResetTimer()

	fm := &protos.FailureModeTransform{
		Type:  protos.FailureModeTransform_TRANSFORM_TYPE_REPLACE,
		Path:  "firstname",
		Value: "Testing",
	}

	ctx, cancel := context.WithTimeout(context.Background(), time.Minute)
	defer cancel()

	for i := 0; i < b.N; i++ {
		_, err := d.failTransform(ctx, jsonData, fm)
		if err != nil {
			b.Error("error during runTransform: " + err.Error())
		}
	}
}

func setup(m Module) (*DataQual, error) {
	d := &DataQual{
		functions:    map[Module]*function{},
		functionsMtx: &sync.RWMutex{},
		Config:       &Config{WasmTimeout: time.Second},
	}

	wasmFile := path.Join("src", string(m)+".wasm")

	data, err := os.ReadFile(wasmFile)
	if err != nil {
		return nil, errors.New("unable to read wasm file: " + err.Error())
	}

	if len(data) == 0 {
		return nil, errors.New("empty wasm file")
	}

	inst, err := createFunction(data)
	if err != nil {
		return nil, err
	}

	d.functions[m] = inst

	return d, nil
}

func setupForFailure(configs []*common.FailureMode) *DataQual {
	ruleID := uuid.New().String()
	rsID := uuid.New().String()

	return &DataQual{
		Plumber:      getFakePlumber(),
		functions:    map[Module]*function{},
		functionsMtx: &sync.RWMutex{},
		rulesMtx:     &sync.RWMutex{},
		ruleSetMtx:   &sync.RWMutex{},
		Config:       &Config{DataSource: "kafka"},
		ruleSetMap:   map[string]string{ruleID: rsID},
		rules: map[Mode]map[string][]*protos.Rule{
			Publish: {
				"mytopic": {
					{
						Id:   ruleID,
						Type: common.RuleType_RULE_TYPE_MATCH,
						RuleConfig: &common.Rule_MatchConfig{
							MatchConfig: &common.RuleConfigMatch{
								Path: "type",
								Type: "string_contains_any",
								Args: []string{"hello"},
							},
						},
						FailureModeConfigs: configs,
					},
				},
			},
		},
	}
}

func getFakePlumber() *plumberfakes.FakeIPlumberClient {
	fakePlumber := &plumberfakes.FakeIPlumberClient{}
	fakePlumber.GetWasmFileStub = func(ctx context.Context, file string) ([]byte, error) {
		data, err := os.ReadFile("src/" + file)
		if err != nil {
			return nil, err
		}

		return data, nil
	}

	return fakePlumber
}
