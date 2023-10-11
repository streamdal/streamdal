import type { BinaryWriteOptions } from "@protobuf-ts/runtime";
import type { IBinaryWriter } from "@protobuf-ts/runtime";
import type { BinaryReadOptions } from "@protobuf-ts/runtime";
import type { IBinaryReader } from "@protobuf-ts/runtime";
import type { PartialMessage } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
/**
 * @generated from protobuf message protos.RegistrationStatus
 */
export interface RegistrationStatus {
    /**
     * @generated from protobuf field: protos.RegistrationStatus.Status status = 1;
     */
    status: RegistrationStatus_Status;
}
/**
 * @generated from protobuf enum protos.RegistrationStatus.Status
 */
export declare enum RegistrationStatus_Status {
    /**
     * @generated from protobuf enum value: STATUS_UNSET = 0;
     */
    UNSET = 0,
    /**
     * Submit means the user is not registered yet
     *
     * @generated from protobuf enum value: STATUS_SUBMIT = 1;
     */
    SUBMIT = 1,
    /**
     * Verify means the user is registered but not verified yet
     *
     * @generated from protobuf enum value: STATUS_VERIFY = 2;
     */
    VERIFY = 2,
    /**
     * Done means the user is registered and verified
     *
     * @generated from protobuf enum value: STATUS_DONE = 3;
     */
    DONE = 3
}
/**
 * @generated from protobuf message protos.Registration
 */
export interface Registration {
    /**
     * @generated from protobuf field: string email = 1;
     */
    email: string;
    /**
     * Used for storage on ui-bff backend
     *
     * @generated from protobuf field: int32 _code = 100;
     */
    Code: number;
}
/**
 * @generated from protobuf message protos.Verify
 */
export interface Verify {
    /**
     * @generated from protobuf field: string email = 1;
     */
    email: string;
    /**
     * @generated from protobuf field: string code = 2;
     */
    code: string;
}
declare class RegistrationStatus$Type extends MessageType<RegistrationStatus> {
    constructor();
    create(value?: PartialMessage<RegistrationStatus>): RegistrationStatus;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: RegistrationStatus): RegistrationStatus;
    internalBinaryWrite(message: RegistrationStatus, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.RegistrationStatus
 */
export declare const RegistrationStatus: RegistrationStatus$Type;
declare class Registration$Type extends MessageType<Registration> {
    constructor();
    create(value?: PartialMessage<Registration>): Registration;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: Registration): Registration;
    internalBinaryWrite(message: Registration, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.Registration
 */
export declare const Registration: Registration$Type;
declare class Verify$Type extends MessageType<Verify> {
    constructor();
    create(value?: PartialMessage<Verify>): Verify;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: Verify): Verify;
    internalBinaryWrite(message: Verify, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message protos.Verify
 */
export declare const Verify: Verify$Type;
export {};
