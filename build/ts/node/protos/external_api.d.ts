import { ServiceType } from "@protobuf-ts/runtime-rpc";
import { MessageType } from "@protobuf-ts/runtime";
/**
 * protolint:disable INDENT
 *
 * @generated from protobuf message protos.GetServicesRequest
 */
export interface GetServicesRequest {
}
/**
 * @generated from protobuf message protos.GetServicesResponse
 */
export interface GetServicesResponse {
}
/**
 * @generated from protobuf message protos.GetServiceRequest
 */
export interface GetServiceRequest {
}
/**
 * @generated from protobuf message protos.GetServiceResponse
 */
export interface GetServiceResponse {
}
/**
 * @generated from protobuf message protos.GetPipelinesRequest
 */
export interface GetPipelinesRequest {
}
/**
 * @generated from protobuf message protos.GetPipelinesResponse
 */
export interface GetPipelinesResponse {
}
/**
 * @generated from protobuf message protos.GetPipelineRequest
 */
export interface GetPipelineRequest {
}
/**
 * @generated from protobuf message protos.GetPipelineResponse
 */
export interface GetPipelineResponse {
}
/**
 * @generated from protobuf message protos.SetPipelineRequest
 */
export interface SetPipelineRequest {
}
/**
 * @generated from protobuf message protos.SetPipelineResponse
 */
export interface SetPipelineResponse {
}
/**
 * @generated from protobuf message protos.DeletePipelineRequest
 */
export interface DeletePipelineRequest {
}
/**
 * @generated from protobuf message protos.DeletePipelineResponse
 */
export interface DeletePipelineResponse {
}
/**
 * @generated from protobuf message protos.GetStepsRequest
 */
export interface GetStepsRequest {
}
/**
 * @generated from protobuf message protos.GetStepsResponse
 */
export interface GetStepsResponse {
}
/**
 * @generated from protobuf message protos.CreateStepRequest
 */
export interface CreateStepRequest {
}
/**
 * @generated from protobuf message protos.CreateStepResponse
 */
export interface CreateStepResponse {
}
/**
 * @generated from protobuf message protos.UpdateStepRequest
 */
export interface UpdateStepRequest {
}
/**
 * @generated from protobuf message protos.UpdateStepResponse
 */
export interface UpdateStepResponse {
}
/**
 * @generated from protobuf message protos.DeleteStepRequest
 */
export interface DeleteStepRequest {
}
/**
 * @generated from protobuf message protos.DeleteStepResponse
 */
export interface DeleteStepResponse {
}
/**
 * @generated from protobuf message protos.TestRequest
 */
export interface TestRequest {
    /**
     * @generated from protobuf field: string input = 1;
     */
    input: string;
}
/**
 * @generated from protobuf message protos.TestResponse
 */
export interface TestResponse {
    /**
     * @generated from protobuf field: string output = 2;
     */
    output: string;
}
declare class GetServicesRequest$Type extends MessageType<GetServicesRequest> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.GetServicesRequest
 */
export declare const GetServicesRequest: GetServicesRequest$Type;
declare class GetServicesResponse$Type extends MessageType<GetServicesResponse> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.GetServicesResponse
 */
export declare const GetServicesResponse: GetServicesResponse$Type;
declare class GetServiceRequest$Type extends MessageType<GetServiceRequest> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.GetServiceRequest
 */
export declare const GetServiceRequest: GetServiceRequest$Type;
declare class GetServiceResponse$Type extends MessageType<GetServiceResponse> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.GetServiceResponse
 */
export declare const GetServiceResponse: GetServiceResponse$Type;
declare class GetPipelinesRequest$Type extends MessageType<GetPipelinesRequest> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.GetPipelinesRequest
 */
export declare const GetPipelinesRequest: GetPipelinesRequest$Type;
declare class GetPipelinesResponse$Type extends MessageType<GetPipelinesResponse> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.GetPipelinesResponse
 */
export declare const GetPipelinesResponse: GetPipelinesResponse$Type;
declare class GetPipelineRequest$Type extends MessageType<GetPipelineRequest> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.GetPipelineRequest
 */
export declare const GetPipelineRequest: GetPipelineRequest$Type;
declare class GetPipelineResponse$Type extends MessageType<GetPipelineResponse> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.GetPipelineResponse
 */
export declare const GetPipelineResponse: GetPipelineResponse$Type;
declare class SetPipelineRequest$Type extends MessageType<SetPipelineRequest> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.SetPipelineRequest
 */
export declare const SetPipelineRequest: SetPipelineRequest$Type;
declare class SetPipelineResponse$Type extends MessageType<SetPipelineResponse> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.SetPipelineResponse
 */
export declare const SetPipelineResponse: SetPipelineResponse$Type;
declare class DeletePipelineRequest$Type extends MessageType<DeletePipelineRequest> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.DeletePipelineRequest
 */
export declare const DeletePipelineRequest: DeletePipelineRequest$Type;
declare class DeletePipelineResponse$Type extends MessageType<DeletePipelineResponse> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.DeletePipelineResponse
 */
export declare const DeletePipelineResponse: DeletePipelineResponse$Type;
declare class GetStepsRequest$Type extends MessageType<GetStepsRequest> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.GetStepsRequest
 */
export declare const GetStepsRequest: GetStepsRequest$Type;
declare class GetStepsResponse$Type extends MessageType<GetStepsResponse> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.GetStepsResponse
 */
export declare const GetStepsResponse: GetStepsResponse$Type;
declare class CreateStepRequest$Type extends MessageType<CreateStepRequest> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.CreateStepRequest
 */
export declare const CreateStepRequest: CreateStepRequest$Type;
declare class CreateStepResponse$Type extends MessageType<CreateStepResponse> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.CreateStepResponse
 */
export declare const CreateStepResponse: CreateStepResponse$Type;
declare class UpdateStepRequest$Type extends MessageType<UpdateStepRequest> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.UpdateStepRequest
 */
export declare const UpdateStepRequest: UpdateStepRequest$Type;
declare class UpdateStepResponse$Type extends MessageType<UpdateStepResponse> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.UpdateStepResponse
 */
export declare const UpdateStepResponse: UpdateStepResponse$Type;
declare class DeleteStepRequest$Type extends MessageType<DeleteStepRequest> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.DeleteStepRequest
 */
export declare const DeleteStepRequest: DeleteStepRequest$Type;
declare class DeleteStepResponse$Type extends MessageType<DeleteStepResponse> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.DeleteStepResponse
 */
export declare const DeleteStepResponse: DeleteStepResponse$Type;
declare class TestRequest$Type extends MessageType<TestRequest> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.TestRequest
 */
export declare const TestRequest: TestRequest$Type;
declare class TestResponse$Type extends MessageType<TestResponse> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.TestResponse
 */
export declare const TestResponse: TestResponse$Type;
/**
 * @generated ServiceType for protobuf service protos.External
 */
export declare const External: ServiceType;
export {};
