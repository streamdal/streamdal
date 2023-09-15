import type { BinaryWriteOptions } from "@protobuf-ts/runtime";
import type { IBinaryWriter } from "@protobuf-ts/runtime";
import type { BinaryReadOptions } from "@protobuf-ts/runtime";
import type { IBinaryReader } from "@protobuf-ts/runtime";
import type { PartialMessage } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
/**
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
