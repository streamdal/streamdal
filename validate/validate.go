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

func SetPipelineCommand(req *protos.SetPipelineCommand) error {
	if req == nil {
		return ErrNilRequest
	}

	if req.Name == "" {
		return EmptyFieldError("Name")
	}

	if len(req.Steps) == 0 {
		return errors.New("must have at least one step in pipeline")
	}

	return nil
}

func DeletePipelineCommand(req *protos.DeletePipelineCommand) error {
	if req == nil {
		return ErrNilRequest
	}

	if req.Id == "" {
		return EmptyFieldError("Id")
	}

	return nil
}

func PausePipelineCommand(req *protos.PausePipelineCommand) error {
	if req == nil {
		return ErrNilRequest
	}

	if req.Id == "" {
		return EmptyFieldError("Id")
	}

	return nil
}

func UnpausePipelineCommand(req *protos.UnpausePipelineCommand) error {
	if req == nil {
		return ErrNilRequest
	}

	if req.Id == "" {
		return EmptyFieldError("Id")
	}

	return nil
}

func EmptyFieldError(field string) error {
	return errors.Errorf("field '%s' cannot be empty", field)
}
