package validation

import (
	"github.com/pkg/errors"

	"github.com/streamdal/snitch-protos/build/go/protos"
)

var (
	ErrNilInput = errors.New("request cannot be nil")
)

func ErrEmptyField(field string) error {
	return errors.Errorf("field '%s' cannot be empty", field)
}

func ErrNilField(field string) error {
	return errors.Errorf("field '%s' cannot be nil", field)
}

func ErrUnsetEnum(field string) error {
	return errors.Errorf("enum '%s' cannot be unset", field)
}

func ValidateAudience(aud *protos.Audience) error {
	if aud == nil {
		return ErrNilInput
	}

	if aud.ServiceName == "" {
		return ErrEmptyField("service_name")
	}

	if aud.ComponentName == "" {
		return ErrEmptyField("component_name")
	}

	if aud.OperationName == "" {
		return ErrEmptyField("operation_name")
	}

	if aud.OperationType == protos.OperationType_OPERATION_TYPE_UNSET {
		return ErrUnsetEnum("operation_type")
	}

	return nil
}

func ValidateTailRequestStartCommand(cmd *protos.Command) error {
	if cmd == nil {
		return ErrNilInput
	}

	tail := cmd.GetTail()
	if tail == nil {
		return ErrNilField("tail")
	}

	req := tail.GetRequest()
	if req == nil {
		return ErrNilField("request")
	}

	if req.PipelineId == "" {
		return ErrEmptyField("pipeline_id")
	}

	if err := ValidateAudience(cmd.Audience); err != nil {
		return errors.Wrap(err, "invalid audience")
	}

	return nil
}

func ValidateTailRequestStopCommand(cmd *protos.Command) error {
	if cmd == nil {
		return ErrNilInput
	}

	tail := cmd.GetTail()
	if tail == nil {
		return ErrNilField("tail")
	}

	req := tail.GetRequest()
	if req == nil {
		return ErrNilField("request")
	}

	if req.Id == "" {
		return ErrEmptyField("id")
	}

	return nil
}
