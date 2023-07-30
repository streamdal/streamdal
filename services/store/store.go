package store

import (
	"context"
	"encoding/json"

	"github.com/nats-io/nats.go"
	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"
	"github.com/streamdal/natty"
	"github.com/streamdal/snitch-protos/build/go/protos"
	"google.golang.org/protobuf/proto"

	"github.com/streamdal/snitch-server/backends/cache"
	"github.com/streamdal/snitch-server/util"
	"github.com/streamdal/snitch-server/validate"
)

/*

!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

Storage strategy is defined here:

https://www.notion.so/streamdal/Snitch-Server-Storage-Spec-417bfa71f04b481082373ad18cbdb0e9

!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

`store` is a service that handles storage and retrieval of data such as service
registrations and service commands.

On READ, it performs lookups by first looking in in-memory cache and if not
present, it will attempt to fetch the data from NATS K/V.

On WRITE, it will write to both in-memory cache and NATS K/V.

On DELETE, it will delete from both in-memory cache and NATS k/V.

*/

var (
	ErrPipelineNotFound = errors.New("pipeline not found")
)

type IStore interface {
	AddRegistration(ctx context.Context, req *protos.RegisterRequest) error
	DeleteRegistration(ctx context.Context, req *protos.DeregisterRequest) error
	AddHeartbeat(ctx context.Context, req *protos.HeartbeatRequest) error
	GetPipelines(ctx context.Context) (map[string]*protos.Pipeline, error)
	GetPipeline(ctx context.Context, pipelineId string) (*protos.Pipeline, error)
	CreatePipeline(ctx context.Context, pipeline *protos.Pipeline) error
	AddAudience(ctx context.Context, req *protos.NewAudienceRequest) error
	DeletePipeline(ctx context.Context, pipelineId string) error
	UpdatePipeline(ctx context.Context, pipeline *protos.Pipeline) error
	AttachPipeline(ctx context.Context, req *protos.AttachPipelineRequest) error
	DetachPipeline(ctx context.Context, req *protos.DetachPipelineRequest) error
	PausePipeline(ctx context.Context, req *protos.PausePipelineRequest) error
	ResumePipeline(ctx context.Context, req *protos.ResumePipelineRequest) error
}

type Options struct {
	NATSBackend  natty.INatty
	CacheBackend cache.ICache
	ShutdownCtx  context.Context
	NodeName     string
}

type Store struct {
	options *Options
	log     *logrus.Entry
}

func New(opts *Options) (*Store, error) {
	if err := opts.Validate(); err != nil {
		return nil, errors.Wrap(err, "error validating options")
	}

	return &Store{
		options: opts,
		log:     logrus.WithField("pkg", "store"),
	}, nil
}

func (s *Store) AddRegistration(ctx context.Context, req *protos.RegisterRequest) error {
	llog := s.log.WithField("method", "AddRegistration")
	llog.Debug("received request to add registration")

	if err := validate.RegisterRequest(req); err != nil {
		return errors.Wrap(err, "error validating register request")
	}

	// Save registration to cache
	s.options.CacheBackend.Set(CacheRegisterKey(s.options.NodeName, req.ServiceName, req.SessionId), req)

	// Save registration to K/V
	data, err := proto.Marshal(req)
	if err != nil {
		return errors.Wrap(err, "error marshaling register request")
	}

	if err := s.options.NATSBackend.Put(
		ctx,
		NATSRegisterBucket,
		NATSRegisterKey(s.options.NodeName, req.ServiceName, req.SessionId),
		data,
	); err != nil {
		return errors.Wrap(err, "error saving register request to NATS")
	}

	// Save audience(s)
	if req.Audiences != nil && len(req.Audiences) > 0 {
		for _, audience := range req.Audiences {
			if err := s.AddAudience(ctx, &protos.NewAudienceRequest{
				SessionId: req.SessionId,
				Audience:  audience,
			}); err != nil {
				return errors.Wrap(err, "error adding audience")
			}
		}
	}

	return nil
}

func (s *Store) DeleteRegistration(ctx context.Context, req *protos.DeregisterRequest) error {
	llog := s.log.WithField("method", "DeleteRegistration")
	llog.Debug("received request to delete registration")

	// TODO: DeregisterRequest should take a session id (instead of service name)

	return nil
}

// AddHeartbeat updates the TTL for a given registration
func (s *Store) AddHeartbeat(ctx context.Context, req *protos.HeartbeatRequest) error {
	llog := s.log.WithField("method", "AddHeartbeat")
	llog.Debug("received request to add heartbeat")

	// Find registration by session id
	registration, err := s.GetRegistrationBySessionID(ctx, req.SessionId)
	if err != nil {
		return errors.Wrapf(err, "unable to lookup registration by session id '%s'", req.SessionId)
	}

	// Refresh in cache
	if ok := s.options.CacheBackend.Refresh(CacheRegisterKey(s.options.NodeName, registration.ServiceName, registration.SessionId)); !ok {
		return errors.Errorf("unable to refresh cache for registration '%s'", registration.SessionId)
	}

	// Refresh in NATS
	if _, err := s.options.NATSBackend.RefreshKey(
		ctx,
		NATSRegisterBucket,
		NATSRegisterKey(s.options.NodeName, registration.ServiceName, registration.SessionId),
	); err != nil {
		return errors.Wrapf(err, "unable to refresh NATS for registration '%s'", registration.SessionId)
	}

	return nil
}

func (s *Store) GetPipelines(ctx context.Context) (map[string]*protos.Pipeline, error) {
	llog := s.log.WithField("method", "GetPipelines")
	llog.Debug("received request to get pipelines")

	// Attempt to fetch pipelines from NATS first (as cache currently does not have a Keys() method)
	pipelineIds, err := s.options.NATSBackend.Keys(ctx, NATSPipelineBucket)
	if err != nil {
		return nil, errors.Wrap(err, "error fetching pipeline keys from NATS")
	}

	// k == pipelineId
	pipelines := make(map[string]*protos.Pipeline, 0)

	for _, pipelineId := range pipelineIds {
		pipelineData, err := s.options.NATSBackend.Get(ctx, NATSPipelineBucket, pipelineId)
		if err != nil {
			return nil, errors.Wrapf(err, "error fetching pipeline '%s' from NATS", pipelineId)
		}

		pipeline := &protos.Pipeline{}

		if err := proto.Unmarshal(pipelineData, pipeline); err != nil {
			return nil, errors.Wrapf(err, "error unmarshaling pipeline '%s'", pipelineId)
		}

		pipelines[pipelineId] = pipeline
	}

	return pipelines, nil
}

func (s *Store) GetPipeline(ctx context.Context, pipelineId string) (*protos.Pipeline, error) {
	llog := s.log.WithField("method", "GetPipeline")
	llog.Debug("received request to get pipeline")

	// Attempt to fetch from cache first
	tmpPipeline, ok := s.options.CacheBackend.Get(CachePipelineKey(pipelineId))
	if ok {
		pipeline, ok := tmpPipeline.(*protos.Pipeline)
		if ok {
			return pipeline, nil
		}
	}

	// Either not in cache or unable to assert pipeline
	pipelineData, err := s.options.NATSBackend.Get(ctx, NATSPipelineBucket, pipelineId)
	if err != nil {
		if err != nats.ErrKeyNotFound {
			return nil, ErrPipelineNotFound
		}

		return nil, errors.Wrap(err, "error fetching pipeline from NATS")
	}

	pipeline := &protos.Pipeline{}

	if err := proto.Unmarshal(pipelineData, pipeline); err != nil {
		return nil, errors.Wrap(err, "error deserializing pipeline")
	}

	// Save it to cache
	s.options.CacheBackend.Set(CachePipelineKey(pipelineId), pipeline)

	return pipeline, nil
}

func (s *Store) CreatePipeline(ctx context.Context, pipeline *protos.Pipeline) error {
	llog := s.log.WithField("method", "CreatePipeline")
	llog.Debug("received request to create pipeline")

	if err := validate.Pipeline(pipeline, false); err != nil {
		return errors.Wrap(err, "error validating pipeline")
	}

	// Save to cache
	s.options.CacheBackend.Set(CachePipelineKey(pipeline.Id), pipeline)

	// Save to K/V
	pipelineData, err := proto.Marshal(pipeline)
	if err != nil {
		return errors.Wrap(err, "error serializing pipeline to protobuf")
	}

	if err := s.options.NATSBackend.Put(ctx, NATSPipelineBucket, NATSPipelineKey(pipeline.Id), pipelineData); err != nil {
		return errors.Wrap(err, "error saving pipeline to NATS")
	}

	return nil
}

func (s *Store) DeletePipeline(ctx context.Context, pipelineId string) error {
	llog := s.log.WithField("method", "DeletePipeline")
	llog.Debug("received request to delete pipeline")

	// Does this pipeline exist?
	if _, err := s.GetPipeline(ctx, pipelineId); err != nil {
		return errors.Wrap(err, "error fetching pipeline")
	}

	// Pipeline exists -> delete it
	s.options.CacheBackend.Remove(CachePipelineKey(pipelineId))

	if err := s.options.NATSBackend.Delete(ctx, NATSPipelineBucket, NATSPipelineKey(pipelineId)); err != nil {
		return errors.Wrap(err, "error deleting pipeline from NATS")
	}

	return nil
}

func (s *Store) UpdatePipeline(ctx context.Context, pipeline *protos.Pipeline) error {
	llog := s.log.WithField("method", "UpdatePipeline")
	llog.Debug("received request to update pipeline")

	if err := validate.Pipeline(pipeline, true); err != nil {
		return errors.Wrap(err, "error validating pipeline")
	}

	// Save to cache
	s.options.CacheBackend.Set(CachePipelineKey(pipeline.Id), pipeline)

	// Save to K/V
	pipelineData, err := proto.Marshal(pipeline)
	if err != nil {
		return errors.Wrap(err, "error serializing pipeline to protobuf")
	}

	if err := s.options.NATSBackend.Put(ctx, NATSPipelineBucket, NATSPipelineKey(pipeline.Id), pipelineData); err != nil {
		return errors.Wrap(err, "error saving pipeline to NATS")
	}

	return nil
}

func (s *Store) AttachPipeline(ctx context.Context, req *protos.AttachPipelineRequest) error {
	llog := s.log.WithField("method", "AttachPipeline")
	llog.Debug("received request to attach pipeline")

	if err := validate.AttachPipelineRequest(req); err != nil {
		return errors.Wrap(err, "error validating attach pipeline request")
	}

	// Does this pipeline exist?
	if _, err := s.GetPipeline(ctx, req.PipelineId); err != nil {
		return errors.Wrap(err, "error fetching pipeline")
	}

	// Pipeline exists -> record the attachment
	cacheKey := CacheConfigKey(util.AudienceStr(req.Audience))
	s.options.CacheBackend.Set(cacheKey, req.PipelineId)

	// Store attachment in NATS
	natsKey := NATSConfigKey(util.AudienceStr(req.Audience))
	if err := s.options.NATSBackend.Put(ctx, NATSConfigBucket, natsKey, []byte(req.PipelineId)); err != nil {
		return errors.Wrap(err, "error saving pipeline attachment to NATS")
	}

	return nil
}

func (s *Store) DetachPipeline(ctx context.Context, req *protos.DetachPipelineRequest) error {
	llog := s.log.WithField("method", "DetachPipeline")
	llog.Debug("received request to detach pipeline")

	if err := validate.DetachPipelineRequest(req); err != nil {
		return errors.Wrap(err, "error validating detach pipeline request")
	}

	// Does this pipeline exist?
	if _, err := s.GetPipeline(ctx, req.PipelineId); err != nil {
		if err == ErrPipelineNotFound {
			llog.Debugf("pipeline '%s' not found - nothing to do", req.PipelineId)
			return nil
		}

		return errors.Wrap(err, "error fetching pipeline")
	}

	// Pipeline attachment exists, OK to remove it
	s.options.CacheBackend.Remove(CacheConfigKey(util.AudienceStr(req.Audience)))

	if err := s.options.NATSBackend.Delete(ctx, NATSConfigBucket, NATSConfigKey(util.AudienceStr(req.Audience))); err != nil {
		return errors.Wrap(err, "error deleting pipeline attachment from NATS")
	}

	return nil
}

func (s *Store) PausePipeline(ctx context.Context, req *protos.PausePipelineRequest) error {
	llog := s.log.WithField("method", "PausePipeline")
	llog.Debug("received request to pause pipeline")

	if err := validate.PausePipelineRequest(req); err != nil {
		return errors.Wrap(err, "error validating pause pipeline request")
	}

	// Does this pipeline exist?
	if _, err := s.GetPipeline(ctx, req.PipelineId); err != nil {
		return errors.Wrap(err, "error fetching pipeline")
	}

	// Pipeline exists, is it already paused?
	isPaused, exists := s.IsPaused(ctx, req.Audience, req.PipelineId)
	if !exists {
		return errors.New("pipeline does not have state")
	}

	if isPaused {
		llog.Debug("pipeline is already paused - nothing to do")
		return nil
	}

	llog.Debug("pipeline is not paused - pausing")

	// Save pause state in cache
	s.options.CacheBackend.Set(CacheStateKey(util.AudienceStr(req.Audience), req.PipelineId), nil)

	// Save pause state in NATS
	if err := s.options.NATSBackend.Put(ctx, NATSStateBucket, NATSStateKey(util.AudienceStr(req.Audience), req.PipelineId), nil); err != nil {
		return errors.Wrap(err, "error saving pipeline state to NATS")
	}

	return nil
}

// IsPaused returns if pipeline is paused and if it exists
func (s *Store) IsPaused(ctx context.Context, audience *protos.Audience, pipelineID string) (bool, bool) {
	llog := s.log.WithField("method", "IsPaused")
	llog.Debug("received request to check if pipeline is paused")

	// Check cache
	if _, exists := s.options.CacheBackend.Get(CacheStateKey(util.AudienceStr(audience), pipelineID)); exists {
		return true, true
	}

	// Not in cache - check NATS
	if _, err := s.options.NATSBackend.Get(ctx, NATSStateBucket, NATSStateKey(util.AudienceStr(audience), pipelineID)); err != nil {
		if err == nats.ErrKeyNotFound {
			llog.Debug("pipeline state not found in NATS")
		} else {
			llog.WithError(err).Error("error fetching pipeline state from NATS")
		}

		return false, false
	}

	return true, true
}

func (s *Store) ResumePipeline(ctx context.Context, req *protos.ResumePipelineRequest) error {
	llog := s.log.WithField("method", "ResumePipeline")
	llog.Debug("received request to resume pipeline")

	if err := validate.PausePipelineRequest(req); err != nil {
		return errors.Wrap(err, "error validating pause pipeline request")
	}

	// Does this pipeline exist?
	if _, err := s.GetPipeline(ctx, req.PipelineId); err != nil {
		return errors.Wrap(err, "error fetching pipeline")
	}

	// Pipeline exists, is it already resumed?
	isPaused, exists := s.IsPaused(ctx, req.Audience, req.PipelineId)
	if !exists || !isPaused {
		// Pipeline does not have state, so it is not paused
		return nil
	}

	// Pipeline is paused, resume it
	llog.Debug("pipeline is paused - resuming")
	s.options.CacheBackend.Remove(CacheStateKey(util.AudienceStr(req.Audience), req.PipelineId))

	if err := s.options.NATSBackend.Delete(ctx, NATSStateBucket, NATSStateKey(util.AudienceStr(req.Audience), req.PipelineId)); err != nil {
		return errors.Wrap(err, "error deleting pipeline state from NATS")
	}

	return nil
}

func (s *Store) AddAudience(ctx context.Context, req *protos.NewAudienceRequest) error {
	llog := s.log.WithField("method", "AddAudience")
	llog.Debug("received request to add audience")

	if err := validate.NewAudienceRequest(req); err != nil {
		return errors.Wrap(err, "error validating new audience request")
	}

	// Does this audience already exist?
	audiences, err := s.GetAudiences(ctx, req.Audience.ServiceName)
	if err != nil {
		return errors.Wrap(err, "error fetching existing audiences")
	}

	for _, a := range audiences {
		if a.ServiceName == req.Audience.ServiceName &&
			a.ComponentName == req.Audience.ComponentName &&
			a.OperationType == req.Audience.OperationType {

			llog.Debugf("audience '%s' already exists - nothing to do", util.AudienceStr(req.Audience))
			return nil
		}
	}

	// Audience doesn't exist - add new audience to existing audiences and save to cache
	audiences = append(audiences, req.Audience)
	s.options.CacheBackend.Set(CacheAudienceKey(req.Audience.ServiceName), audiences)

	// Save audience in NATS
	data, err := json.Marshal(audiences)
	if err != nil {
		return errors.Wrap(err, "error marshalling audiences")
	}

	if err := s.options.NATSBackend.Put(ctx, NATSAudienceBucket, NATSAudienceKey(req.Audience.ServiceName), data); err != nil {
		return errors.Wrap(err, "error saving audiences to NATS")
	}

	return nil
}

// Will return empty audiences if none exist
func (s *Store) GetAudiences(ctx context.Context, serviceName string) ([]*protos.Audience, error) {
	llog := s.log.WithField("method", "GetAudiences")
	llog.Debug("received request to get audiences")

	// Attempt to fetch audiences from cache
	if tmpAudiences, exists := s.options.CacheBackend.Get(CacheAudienceKey(serviceName)); exists {
		llog.Debug("audiences found in cache")
		audiences, ok := tmpAudiences.([]*protos.Audience)

		if ok {
			llog.Debug("successfully converted audiences from cache")
			return audiences, nil
		}

		llog.Debug("error converting audiences from cache")
	}

	llog.Debug("attempting to fetch audiences from NATS")

	audiencesData, err := s.options.NATSBackend.Get(ctx, NATSAudienceBucket, NATSAudienceKey(serviceName))
	if err != nil {
		if err == nats.ErrKeyNotFound {
			llog.Debug("no audiences found in NATS")
			return make([]*protos.Audience, 0), nil
		}

		return nil, errors.Wrap(err, "error fetching audiences from NATS")
	}

	llog.Debug("successfully fetched audiences from NATS")
	audiences := make([]*protos.Audience, 0)

	if err := json.Unmarshal(audiencesData, &audiences); err != nil {
		return nil, errors.Wrap(err, "error unmarshalling audiences from JSON")
	}

	llog.Debug("successfully unmarshalled audiences from JSON")

	return audiences, nil
}

func (o *Options) Validate() error {
	if o == nil {
		return errors.New("options cannot be nil")
	}

	if o.NodeName == "" {
		return errors.New("node name cannot be empty")
	}

	if o.CacheBackend == nil {
		return errors.New("cache backend cannot be nil")
	}

	if o.NATSBackend == nil {
		return errors.New("NATS backend cannot be nil")
	}

	if o.ShutdownCtx == nil {
		return errors.New("shutdown context cannot be nil")
	}

	return nil
}
