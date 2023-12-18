import type { BinaryWriteOptions } from "@protobuf-ts/runtime";
import type { IBinaryWriter } from "@protobuf-ts/runtime";
import type { BinaryReadOptions } from "@protobuf-ts/runtime";
import type { IBinaryReader } from "@protobuf-ts/runtime";
import type { PartialMessage } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
/**
 * WIP
 *
 * @generated from protobuf message protos.steps.EncodeStep
 */
export interface EncodeStep {
    /**
     * @generated from protobuf field: string id = 1;
     */
    id: string;
}
declare class EncodeStep$Type extends MessageType<EncodeStep> {
    constructor();
    create(value?: PartialMessage<EncodeStep>): EncodeStep;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: EncodeStep): EncodeStep;
    internalBinaryWrite(message: EncodeStep, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.steps.EncodeStep
 */
export declare const EncodeStep: EncodeStep$Type;
export {};
