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

// TODO: function to check for rule updates on an interval

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
