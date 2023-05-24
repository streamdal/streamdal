package dataqual

import (
	"bytes"
	"compress/gzip"
	"context"
	"time"

	"github.com/pkg/errors"
	"google.golang.org/grpc"

	"github.com/batchcorp/plumber-schemas/build/go/protos"
	"github.com/batchcorp/plumber-schemas/build/go/protos/common"
)

type IPlumberClient interface {
	GetRules(ctx context.Context, bus string) ([]*common.RuleSet, error)
	SendRuleNotification(ctx context.Context, data []byte, rule *common.Rule) error
	GetWasmFile(ctx context.Context, wasmFile string) ([]byte, error)
}

const (
	dialTimeout = time.Second * 5
)

type Plumber struct {
	Token  string
	Conn   *grpc.ClientConn
	Server protos.PlumberServerClient
}

// newServer dials a plumber GRPC server and returns PlumberServer client
func newServer(plumberAddress, plumberToken string) (*Plumber, error) {
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

func (p *Plumber) GetRules(ctx context.Context, bus string) ([]*common.RuleSet, error) {
	req := &protos.GetDataQualityRulesRequest{
		Auth: &common.Auth{
			Token: p.Token,
		},
		Bus: bus,
	}

	resp, err := p.Server.GetRules(ctx, req)
	if err != nil {
		return nil, errors.Wrap(err, "unable to fetch data quality rules")
	}

	return resp.RuleSets, nil
}

// SendRuleNotification sends the data and rule ID to Plumber which handles DLQ and slack notifications
func (p *Plumber) SendRuleNotification(ctx context.Context, data []byte, rule *common.Rule) error {
	req := &protos.SendRuleNotificationRequest{
		Auth: &common.Auth{
			Token: p.Token,
		},
		Data:   data,
		RuleId: rule.Id,
	}

	if _, err := p.Server.SendRuleNotification(ctx, req); err != nil {
		return errors.Wrap(err, "unable to send rule notification")
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
