// Original file: ../../protos/pipeline.proto

import type { PipelineStepCondition as _protos_PipelineStepCondition, PipelineStepCondition__Output as _protos_PipelineStepCondition__Output } from '../protos/PipelineStepCondition';
import type { DetectiveStep as _protos_steps_DetectiveStep, DetectiveStep__Output as _protos_steps_DetectiveStep__Output } from '../protos/steps/DetectiveStep';
import type { TransformStep as _protos_steps_TransformStep, TransformStep__Output as _protos_steps_TransformStep__Output } from '../protos/steps/TransformStep';
import type { EncodeStep as _protos_steps_EncodeStep, EncodeStep__Output as _protos_steps_EncodeStep__Output } from '../protos/steps/EncodeStep';
import type { DecodeStep as _protos_steps_DecodeStep, DecodeStep__Output as _protos_steps_DecodeStep__Output } from '../protos/steps/DecodeStep';
import type { CustomStep as _protos_steps_CustomStep, CustomStep__Output as _protos_steps_CustomStep__Output } from '../protos/steps/CustomStep';

export interface PipelineStep {
  'id'?: (string);
  'name'?: (string);
  'conditions'?: (_protos_PipelineStepCondition)[];
  'detective'?: (_protos_steps_DetectiveStep | null);
  'transform'?: (_protos_steps_TransformStep | null);
  'encode'?: (_protos_steps_EncodeStep | null);
  'decode'?: (_protos_steps_DecodeStep | null);
  'custom'?: (_protos_steps_CustomStep | null);
  '_wasmId'?: (string);
  '_wasmBytes'?: (string);
  '_wasmFunction'?: (string);
  'step'?: "detective"|"transform"|"encode"|"decode"|"custom";
}

export interface PipelineStep__Output {
  'id': (string);
  'name': (string);
  'conditions': (_protos_PipelineStepCondition__Output)[];
  'detective'?: (_protos_steps_DetectiveStep__Output | null);
  'transform'?: (_protos_steps_TransformStep__Output | null);
  'encode'?: (_protos_steps_EncodeStep__Output | null);
  'decode'?: (_protos_steps_DecodeStep__Output | null);
  'custom'?: (_protos_steps_CustomStep__Output | null);
  '_wasmId': (string);
  '_wasmBytes': (string);
  '_wasmFunction': (string);
  'step': "detective"|"transform"|"encode"|"decode"|"custom";
}
