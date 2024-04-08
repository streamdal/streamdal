import type { BinaryWriteOptions } from "@protobuf-ts/runtime";
import type { IBinaryWriter } from "@protobuf-ts/runtime";
import type { BinaryReadOptions } from "@protobuf-ts/runtime";
import type { IBinaryReader } from "@protobuf-ts/runtime";
import type { PartialMessage } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
/**
 * @generated from protobuf message protos.steps.CustomStep
 */
export interface CustomStep {
    /**
     * @generated from protobuf field: map<string, string> args = 1;
     */
    args: {
        [key: string]: string;
    };
}
declare class CustomStep$Type extends MessageType<CustomStep> {
    constructor();
    create(value?: PartialMessage<CustomStep>): CustomStep;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: CustomStep): CustomStep;
    private binaryReadMap1;
    internalBinaryWrite(message: CustomStep, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.steps.CustomStep
 */
export declare const CustomStep: CustomStep$Type;
export {};
