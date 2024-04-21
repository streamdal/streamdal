package controller

import (
	"context"
	"fmt"
	"strings"

	serverUtil "github.com/streamdal/streamdal/apps/server/util"
	"github.com/streamdal/streamdal/libs/protos/build/go/protos"
	"sigs.k8s.io/controller-runtime/pkg/log"

	"github.com/streamdal/streamdal/apps/operator/util"
)

// There is no create/delete for audience <-> pipeline mappings - there is only
// update. Because of this, this handler needs to determine ALL of the mappings
// that should exist for an audience (and if there are any pre-existing ones -
// retain them).

type MappingJob struct {
	Audience    *protos.Audience
	PipelineIDs []string

	// Indicates how many new mappings will be created and how many mappings
	// will be deleted
	NumCreate int
	NumDelete int
}

// handleMappings will ensure that audience <-> pipeline mappings defined in CR
// match server mappings.
//
// NOTE: This K8S operator will only manage mappings that are "CreatedBy" it.
// If it encounters a mapping that was NOT created by this K8S operator, it will
// skip it.
// This means that if a user manually attached a pipeline to an audience AND
// then defined it in the CR - the CR settings will be ignored until the manual
// mapping is removed from the server (via console or grpc api).
func (r *StreamdalConfigReconciler) handleMappings(
	ctx context.Context, // should already have auth metadata
	rr *ReconcileRequest,
	wantedCfg *protos.Config,
	serverCfg *protos.Config,
) (*HandleStatus, error) {
	llog := log.Log.WithValues("method", "handleMappings", "action", rr.Action)
	llog.Info("Handling mappings for audiences", "numWantedResources", len(wantedCfg.Audiences))

	status := &HandleStatus{
		Resource: ResourceTypeMapping,
		Action:   rr.Action,
	}

	jobs, err := r.generateMappingJobs(wantedCfg.AudienceMappings, serverCfg.AudienceMappings)
	if err != nil {
		return nil, fmt.Errorf("failed to generate mapping jobs: %v", err)

	}

	if len(jobs) == 0 {
		llog.Info("No mapping jobs to process")
		return status, nil

	}

	llog.Info("Generated mapping jobs", "numGenerated", len(jobs))

	// Since there is no "update" or "delete" - we will just roll through our jobs
	// and set the mapping.

	for _, j := range jobs {
		if _, err := rr.Client.SetPipelines(ctx, &protos.SetPipelinesRequest{
			Audience:    j.Audience,
			PipelineIds: j.PipelineIDs,
		}); err != nil {
			return nil, fmt.Errorf("failed to set pipelines for audience '%s': %v", serverUtil.AudienceToStr(j.Audience), err)
		}

		status.NumCreated += j.NumCreate
		status.NumDeleted += j.NumDelete
	}

	return status, nil
}

// generateMappingJobs will generate pipeline jobs by comparing the desired
// state in the CR and what's on the streamdal server.
func (r *StreamdalConfigReconciler) generateMappingJobs(
	wantedConfigs map[string]*protos.PipelineConfigs,
	serverConfigs map[string]*protos.PipelineConfigs,
) ([]*MappingJob, error) {
	llog := log.Log.WithValues("method", "generateMappingJobs")
	jobs := make([]*MappingJob, 0)

	for audStr, wc := range wantedConfigs {
		// Server only has a "set" handler for mappings - no create or delete.
		// This means that if wc does not match what's in the server - it should
		// be set as a job.
		aud := serverUtil.AudienceFromStr(audStr)

		if aud == nil {
			llog.Info("Failed to parse audience", "audienceStr", audStr)
			return nil, fmt.Errorf("failed to parse audience '%s'", audStr)
		}

		wantedPipelineIDs := util.GetPipelineIDs(wc)

		// First check if server has any mappings for this audience - if not,
		// generate job.
		if _, ok := serverConfigs[audStr]; !ok {
			llog.Info("No mapping found on server for audience - generating job",
				"audience", audStr,
				"wantedPipelineIDs", strings.Join(wantedPipelineIDs, ", "),
			)

			jobs = append(jobs, &MappingJob{
				Audience:    aud,
				PipelineIDs: wantedPipelineIDs,
				NumCreate:   len(wantedPipelineIDs),
			})

			continue
		}

		serverPipelineIDs := util.GetPipelineIDs(serverConfigs[audStr])

		// Mapping exists on server - check if it is managed by this operator
		if serverConfigs[audStr].XCreatedBy != CreatedBy {
			llog.Info("Wanted to mark mapping for update but it is NOT managed by this operator",
				"audience", audStr,
				"wantedPipelineIDs", strings.Join(wantedPipelineIDs, ", "),
				"serverPipelineIDs", strings.Join(serverPipelineIDs, ", "),
			)

			continue
		}

		// Mapping owned by us - does server config differ from ours?
		if !util.CompareStringSlices(wantedPipelineIDs, serverPipelineIDs) {
			llog.Info("Wanted audience mapping differs from server mappings - creating job!",
				"audience", audStr,
				"wantedPipelineIDs", strings.Join(wantedPipelineIDs, ", "),
				"serverPipelineIDs", strings.Join(serverPipelineIDs, ", "),
			)

			jobs = append(jobs, &MappingJob{
				Audience:    aud,
				PipelineIDs: wantedPipelineIDs,
			})

			continue
		}
	}

	// The operator should also remove any mappings that aren't defined in the
	// CR (but are managed by this operator) - so we have to walk through the
	// server config and see if there is anything we should remove.
	for serverAudStr, sc := range serverConfigs {
		// If this mapping is NOT managed by this operator - skip it
		if sc.XCreatedBy != CreatedBy {
			llog.Info("Skipping mapping not managed by K8S operator",
				"audience", serverAudStr)

			continue
		}

		// If server mapping is not defined in CR - we should delete it
		if _, ok := wantedConfigs[serverAudStr]; !ok {
			llog.Info("Mapping for audience not defined in CR - removing it",
				"audience", serverAudStr)
		}

		// TODO: Is there anything else to do?
	}

	return jobs, nil
}
