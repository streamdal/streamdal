// Package plumber is a wrapper for the Plumber gRPC API.
// It provides a simple interface to interact with and mock.
package plumber

import (
	"bytes"
	"compress/gzip"
	"context"
	"fmt"
	"time"

	"github.com/batchcorp/plumber-schemas/build/go/protos"
	"github.com/batchcorp/plumber-schemas/build/go/protos/common"
	"github.com/pkg/errors"
	"google.golang.org/grpc"

	"github.com/streamdal/dataqual/types"
)

//go:generate go run github.com/maxbrunsfeld/counterfeiter/v6 . IPlumberClient
type IPlumberClient interface {

	// GetRules returns a list of rules for the given message bus/data source from the Plumber server
	GetRules(ctx context.Context, dataSource string) ([]*common.RuleSet, error)

	// GetWasmFile downloads a WASM file from the Plumber server
	GetWasmFile(ctx context.Context, wasmFile string) ([]byte, error)

	// SendMetrics dumps a metric value to the Plumber server
	SendMetrics(ctx context.Context, entry *types.CounterEntry) error

	// SendRuleNotification sends a notification to the Plumber server that a rule has been triggered
	// Plumber will handle the notification based on the rule's configuration
	SendRuleNotification(ctx context.Context, data []byte, rule *common.Rule, ruleSetID string) error
}

const (
	dialTimeout = time.Second * 5
)

type Plumber struct {
	Token  string
	Conn   *grpc.ClientConn
	Server protos.PlumberServerClient
}

// New dials a plumber GRPC server and returns IPlumberClient
func New(plumberAddress, plumberToken string) (*Plumber, error) {
	dialCtx, dialCancel := context.WithTimeout(context.Background(), dialTimeout)
	defer dialCancel()

	conn, err := grpc.DialContext(dialCtx, plumberAddress, grpc.WithInsecure())
	if err != nil {
		return nil, errors.Wrap(err, "Could not dial GRPC server: %s")
	}

	return &Plumber{
		Conn:   conn,
		Server: protos.NewPlumberServerClient(conn),
		Token:  plumberToken,
	}, nil
}

func (p *Plumber) GetWasmFile(ctx context.Context, wasmFile string) ([]byte, error) {
	req := &protos.DownloadWasmFileRequest{
		Auth: &common.Auth{
			Token: p.Token,
		},
		Name: wasmFile,
	}

	resp, err := p.Server.DownloadWasmFile(ctx, req)
	if err != nil {
		return nil, errors.Wrap(err, "unable to download wasm file")
	}

	// Decompress
	decompressed, err := decompress(resp.Data)
	if err != nil {
		return nil, errors.Wrap(err, "unable to decompress gzipped wasm file")
	}

	return decompressed, nil
}

func (p *Plumber) GetRules(ctx context.Context, dataSource string) ([]*common.RuleSet, error) {
	req := &protos.GetDataQualityRuleSetsRequest{
		Auth: &common.Auth{
			Token: p.Token,
		},
		DataSource: dataSource,
	}

	resp, err := p.Server.GetRuleSets(ctx, req)
	if err != nil {
		return nil, errors.Wrap(err, "unable to fetch data quality rules")
	}

	return resp.RuleSets, nil
}

// SendRuleNotification sends the data and rule ID to Plumber which handles DLQ and slack notifications
func (p *Plumber) SendRuleNotification(ctx context.Context, data []byte, rule *common.Rule, ruleSetID string) error {
	req := &protos.SendRuleNotificationRequest{
		Auth: &common.Auth{
			Token: p.Token,
		},
		Data:      data,
		RuleId:    rule.Id,
		RulesetId: ruleSetID,
	}

	if _, err := p.Server.SendRuleNotification(ctx, req); err != nil {
		return errors.Wrap(err, "unable to send rule notification")
	}

	return nil
}

func (p *Plumber) SendMetrics(ctx context.Context, counter *types.CounterEntry) error {
	labels := make(map[string]string)
	for k, v := range counter.Labels {
		labels[k] = v
	}

	// Only pass these labels if set.
	// Prometheus is not able to handle variable labels.
	if counter.RuleID != "" {
		labels["rule_id"] = counter.RuleID
		labels["ruleset_id"] = counter.RuleSetID
	}

	labels["type"] = string(counter.Type)

	req := &protos.PublishMetricsRequest{
		Auth: &common.Auth{
			Token: p.Token,
		},
		Counter: string(counter.Name),
		Labels:  labels,
		Value:   float64(counter.Value),
	}

	if counter.Name == types.CounterFailureTrigger {
		fmt.Printf("Sending failure trigger: %#v\n", req)
	}

	if _, err := p.Server.PublishMetrics(ctx, req); err != nil {
		return errors.Wrap(err, "unable to send metrics")
	}

	return nil
}

// Decompress data using gzip. Used after downloading WASM files from plumber server
func decompress(data []byte) ([]byte, error) {
	r, err := gzip.NewReader(bytes.NewBuffer(data))
	if err != nil {
		return nil, errors.Wrap(err, "unable to create new gzip reader")
	}

	var decompressed bytes.Buffer
	_, err = decompressed.ReadFrom(r)
	if err != nil {
		return nil, errors.Wrap(err, "unable to read from gzip reader")
	}

	return decompressed.Bytes(), nil
}
