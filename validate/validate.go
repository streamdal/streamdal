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

	if req.ServiceName == "" {
		return ErrEmptyField("ServiceName")
	}

	return nil
}

func HeartbeatRequest(req *protos.HeartbeatRequest) error {
	if req == nil {
		return ErrNilRequest
	}

	if err := Audience(req.Audience); err != nil {
		return errors.Wrap(err, "invalid audience")
	}

	return nil
}

func Audience(audience *protos.Audience) error {
	if audience == nil {
		return ErrNilField("Audience")
	}

	if audience.ServiceName == "" {
		return ErrEmptyField("Audience.ServiceName")
	}

	if audience.ComponentName == "" {
		return ErrEmptyField("Audience.ComponentName")
	}

	if audience.OperationType == protos.OperationType_OPERATION_TYPE_UNSET {
		return ErrUnsetEnum("Audience.OperationType")
	}

	return nil
}

func DeregisterRequest(req *protos.DeregisterRequest) error {
	if req == nil {
		return ErrNilRequest
	}

	if req.ServiceName == "" {
		return ErrEmptyField("ServiceName")
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
		return ErrEmptyField("Name")
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
		return ErrEmptyField("Id")
	}

	return nil
}

func PausePipelineCommand(req *protos.PausePipelineCommand) error {
	if req == nil {
		return ErrNilRequest
	}

	if req.Id == "" {
		return ErrEmptyField("Id")
	}

	return nil
}

func UnpausePipelineCommand(req *protos.UnpausePipelineCommand) error {
	if req == nil {
		return ErrNilRequest
	}

	if req.Id == "" {
		return ErrEmptyField("Id")
	}

	return nil
}

func ErrEmptyField(field string) error {
	return errors.Errorf("field '%s' cannot be empty", field)
}

func ErrNilField(field string) error {
	return errors.Errorf("field '%s' cannot be nil", field)
}

func ErrUnsetEnum(field string) error {
	return errors.Errorf("enum '%s' cannot be unset", field)
}
