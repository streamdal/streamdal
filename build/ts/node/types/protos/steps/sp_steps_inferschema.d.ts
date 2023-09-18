import type { BinaryWriteOptions } from "@protobuf-ts/runtime";
import type { IBinaryWriter } from "@protobuf-ts/runtime";
import type { BinaryReadOptions } from "@protobuf-ts/runtime";
import type { IBinaryReader } from "@protobuf-ts/runtime";
import type { PartialMessage } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
/**
 * InferSchemaStep is a step that infers the schema of a payload.
 * It is designed to be used directly by the SDK rather than in a pipeline, so that
 * we can support schema inference without the need for pipelines to be created
 *
 * @generated from protobuf message protos.steps.InferSchemaStep
 */
export interface InferSchemaStep {
    /**
     * @generated from protobuf field: bytes current_schema = 1;
     */
    currentSchema: Uint8Array;
}
declare class InferSchemaStep$Type extends MessageType<InferSchemaStep> {
    constructor();
    create(value?: PartialMessage<InferSchemaStep>): InferSchemaStep;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: InferSchemaStep): InferSchemaStep;
    internalBinaryWrite(message: InferSchemaStep, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.steps.InferSchemaStep
 */
export declare const InferSchemaStep: InferSchemaStep$Type;
export {};
