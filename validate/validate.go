package validate

import (
	"regexp"

	"github.com/pkg/errors"
	"github.com/streamdal/snitch-protos/build/go/protos"
)

var (
	ErrNilInput          = errors.New("request cannot be nil")
	ValidCharactersRegex = regexp.MustCompile(`^[a-zA-Z0-9_-]+$`)
)

func RegisterRequest(req *protos.RegisterRequest) error {
	if req == nil {
		return ErrNilInput
	}

	if req.ServiceName == "" {
		return ErrEmptyField("ServiceName")
	}

	if req.SessionId == "" {
		return ErrEmptyField("SessionId")
	}

	if err := ClientInfo(req.ClientInfo); err != nil {
		return errors.Wrap(err, "invalid client info")
	}

	if !ValidCharactersRegex.MatchString(req.ServiceName) {
		return ErrInvalidCharacters("ServiceName")
	}

	if !ValidCharactersRegex.MatchString(req.SessionId) {
		return ErrInvalidCharacters("SessionId")
	}

	// OK to not have audiences, but if defined, they must contain valid entries
	for _, v := range req.Audiences {
		if err := Audience(v); err != nil {
			return errors.Wrap(err, "invalid audience")
		}
	}

	return nil
}

func ClientInfo(clientInfo *protos.ClientInfo) error {
	if clientInfo == nil {
		return ErrNilInput
	}

	if clientInfo.Arch == "" {
		return ErrEmptyField("ClientInfo.Arch")
	}

	if clientInfo.Os == "" {
		return ErrEmptyField("ClientInfo.Os")
	}

	if clientInfo.Language == "" {
		return ErrEmptyField("ClientInfo.Language")
	}

	if clientInfo.LibraryName == "" {
		return ErrEmptyField("ClientInfo.LibraryName")
	}

	if clientInfo.LibraryVersion == "" {
		return ErrEmptyField("ClientInfo.LibraryVersion")
	}

	return nil
}

func ErrInvalidCharacters(field string) error {
	return errors.Errorf("field '%s' contains invalid characters", field)
}

func HeartbeatRequest(req *protos.HeartbeatRequest) error {
	if req == nil {
		return ErrNilInput
	}

	if req.SessionId == "" {
		return ErrEmptyField("SessionId")
	}

	if !ValidCharactersRegex.MatchString(req.SessionId) {
		return ErrInvalidCharacters("SessionId")
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

	if !ValidCharactersRegex.MatchString(audience.ServiceName) {
		return ErrInvalidCharacters("ServiceName")
	}

	if audience.ComponentName == "" {
		return ErrEmptyField("Audience.ComponentName")
	}

	if !ValidCharactersRegex.MatchString(audience.ComponentName) {
		return ErrInvalidCharacters("ComponentName")
	}

	if audience.OperationType == protos.OperationType_OPERATION_TYPE_UNSET {
		return ErrUnsetEnum("Audience.OperationType")
	}

	if audience.OperationName == "" {
		return ErrEmptyField("Audience.OperationName")
	}

	if !ValidCharactersRegex.MatchString(audience.OperationName) {
		return ErrInvalidCharacters("OperationName")
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

	if !ValidCharactersRegex.MatchString(p.Name) {
		return ErrInvalidCharacters("p.Name")
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

	// TODO: OK if OnSuccess or OnFailure empty? ~DS

	return nil
}

func UpdatePipelineRequest(req *protos.UpdatePipelineRequest) error {
	if req == nil {
		return ErrNilInput
	}

	return Pipeline(req.Pipeline, true)
}

func DeletePipelineRequest(req *protos.DeletePipelineRequest) error {
	if req == nil {
		return ErrNilInput
	}

	if req.PipelineId == "" {
		return ErrEmptyField("PipelineId")
	}

	return nil
}

func AttachPipelineRequest(req *protos.AttachPipelineRequest) error {
	if req == nil {
		return ErrNilInput
	}

	if req.PipelineId == "" {
		return ErrEmptyField("PipelineId")
	}

	return Audience(req.Audience)
}

func DetachPipelineRequest(req *protos.DetachPipelineRequest) error {
	if req == nil {
		return ErrNilInput
	}

	if req.PipelineId == "" {
		return ErrEmptyField("PipelineId")
	}

	return Audience(req.Audience)
}

func PausePipelineRequest(req *protos.PausePipelineRequest) error {
	if req == nil {
		return ErrNilInput
	}

	if req.PipelineId == "" {
		return ErrEmptyField("PipelineId")
	}

	return nil
}

func ResumePipelineRequest(req *protos.ResumePipelineRequest) error {
	if req == nil {
		return ErrNilInput
	}

	if req.PipelineId == "" {
		return ErrEmptyField("PipelineId")
	}

	return nil
}

func NewAudienceRequest(req *protos.NewAudienceRequest) error {
	if req == nil {
		return ErrNilInput
	}

	if req.SessionId == "" {
		return ErrEmptyField("SessionId")
	}

	return Audience(req.Audience)
}
