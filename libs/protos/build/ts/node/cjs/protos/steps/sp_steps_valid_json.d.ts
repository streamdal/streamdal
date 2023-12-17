import type { BinaryWriteOptions } from "@protobuf-ts/runtime";
import type { IBinaryWriter } from "@protobuf-ts/runtime";
import type { BinaryReadOptions } from "@protobuf-ts/runtime";
import type { IBinaryReader } from "@protobuf-ts/runtime";
import type { PartialMessage } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
/**
 * @generated from protobuf message protos.steps.ValidJSONStep
 */
export interface ValidJSONStep {
}
declare class ValidJSONStep$Type extends MessageType<ValidJSONStep> {
    constructor();
    create(value?: PartialMessage<ValidJSONStep>): ValidJSONStep;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: ValidJSONStep): ValidJSONStep;
    internalBinaryWrite(message: ValidJSONStep, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.steps.ValidJSONStep
 */
export declare const ValidJSONStep: ValidJSONStep$Type;
export {};
