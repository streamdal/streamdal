import type { BinaryWriteOptions } from "@protobuf-ts/runtime";
import type { IBinaryWriter } from "@protobuf-ts/runtime";
import type { BinaryReadOptions } from "@protobuf-ts/runtime";
import type { IBinaryReader } from "@protobuf-ts/runtime";
import type { PartialMessage } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
/**
 * WIP
 *
 * @generated from protobuf message protos.steps.DecodeStep
 */
export interface DecodeStep {
    /**
     * @generated from protobuf field: string id = 1;
     */
    id: string;
}
declare class DecodeStep$Type extends MessageType<DecodeStep> {
    constructor();
    create(value?: PartialMessage<DecodeStep>): DecodeStep;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: DecodeStep): DecodeStep;
    internalBinaryWrite(message: DecodeStep, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.steps.DecodeStep
 */
export declare const DecodeStep: DecodeStep$Type;
export {};
