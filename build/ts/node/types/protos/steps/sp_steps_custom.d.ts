import { MessageType } from "@protobuf-ts/runtime";
/**
 * WIP -- Custom WASM exec?
 *
 * @generated from protobuf message protos.steps.CustomStep
 */
export interface CustomStep {
    /**
     * @generated from protobuf field: string id = 1;
     */
    id: string;
}
declare class CustomStep$Type extends MessageType<CustomStep> {
    constructor();
}
/**
 * @generated MessageType for protobuf message protos.steps.CustomStep
 */
export declare const CustomStep: CustomStep$Type;
export {};
