package validate

import (
	"github.com/pkg/errors"
	"github.com/streamdal/snitch-protos/build/go/protos"
)

var (
	ErrNilRequest = errors.New("request cannot be nil")
)

func RegisterRequest(req *protos.RegisterRequest) error {
	if req == nil {
		return ErrNilRequest
	}

	return nil
}

func CommandResponse(req *protos.CommandResponse) error {
	if req == nil {
		return ErrNilRequest
	}

	return nil
}

func BusEvent(req *protos.BusEvent) error {
	if req == nil {
		return ErrNilRequest
	}

	if req.Event == nil {
		return errors.New(".Event cannot be nil")
	}

	return nil
}
