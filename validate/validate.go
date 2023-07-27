package validate

import (
	"github.com/pkg/errors"
	"github.com/streamdal/snitch-protos/build/go/protos"
)

var (
	ErrNilInput = errors.New("request cannot be nil")
)

func RegisterRequest(req *protos.RegisterRequest) error {
	if req == nil {
		return ErrNilInput
	}

	if req.ServiceName == "" {
		return ErrEmptyField("ServiceName")
	}

	if req.ClientInfo == nil {
		return errors.New(".ClientInfo cannot be nil")
	}

	// OK to not have audiences, but if defined, they must contain valid entries
	for _, v := range req.Audiences {
		if err := Audience(v); err != nil {
			return errors.Wrap(err, "invalid audience")
		}
	}

	return nil
}

func HeartbeatRequest(req *protos.HeartbeatRequest) error {
	if req == nil {
		return ErrNilInput
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
		return ErrNilInput
	}

	if req.ServiceName == "" {
		return ErrEmptyField("ServiceName")
	}

	return nil
}

func Command(req *protos.Command) error {
	if req == nil {
		return ErrNilInput
	}

	return nil
}

func BusEvent(req *protos.BusEvent) error {
	if req == nil {
		return ErrNilInput
	}

	if req.Event == nil {
		return errors.New(".Event cannot be nil")
	}

	return nil
}

func SetPipelineCommand(req *protos.SetPipelineCommand) error {
	if req == nil {
		return ErrNilInput
	}

	if req.Pipeline == nil {
		return errors.New(".Pipeline cannot be nil")
	}

	if req.Pipeline.Name == "" {
		return ErrEmptyField("Name")
	}

	if len(req.Pipeline.Steps) == 0 {
		return errors.New("must have at least one step in pipeline")
	}

	return nil
}

func DeletePipelineCommand(req *protos.DeletePipelineCommand) error {
	if req == nil {
		return ErrNilInput
	}

	if req.Id == "" {
		return ErrEmptyField("Id")
	}

	return nil
}

func PausePipelineCommand(req *protos.PausePipelineCommand) error {
	if req == nil {
		return ErrNilInput
	}

	if req.Id == "" {
		return ErrEmptyField("Id")
	}

	return nil
}

func UnpausePipelineCommand(req *protos.UnpausePipelineCommand) error {
	if req == nil {
		return ErrNilInput
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

func GetPipelineRequest(req *protos.GetPipelineRequest) error {
	if req == nil {
		return ErrNilInput
	}

	if req.PipelineId == "" {
		return ErrEmptyField("PipelineId")
	}

	return nil
}

func GetPipelinesRequest(req *protos.GetPipelinesRequest) error {
	if req == nil {
		return ErrNilInput
	}

	return nil
}

func CreatePipelineRequest(req *protos.CreatePipelineRequest) error {
	if req == nil {
		return ErrNilInput
	}

	return Pipeline(req.Pipeline, false)
}

func Pipeline(p *protos.Pipeline, requireId bool) error {
	if p == nil {
		return ErrNilInput
	}

	if requireId && p.Id == "" {
		return ErrEmptyField("Id")
	}

	if p.Name == "" {
		return ErrEmptyField("Name")
	}

	if len(p.Steps) == 0 {
		return errors.New("must have at least one step in pipeline")
	}

	for _, s := range p.Steps {
		if err := PipelineStep(s); err != nil {
			return errors.Wrap(err, "invalid step")
		}
	}

	return nil
}

func PipelineStep(s *protos.PipelineStep) error {
	if s == nil {
		return ErrNilInput
	}

	if s.GetStep() == nil {
		return errors.New(".Step cannot be nil")
	}

	// Should name be required? ~DS

	return nil
}

func UpdatePipelineRequest(req *protos.UpdatePipelineRequest) error {
	if req == nil {
		return ErrNilInput
	}

	return Pipeline(req.Pipeline, true)
}
