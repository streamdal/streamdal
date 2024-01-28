import { WireType } from "@protobuf-ts/runtime";
import { UnknownFieldHandler } from "@protobuf-ts/runtime";
import { reflectionMergePartial } from "@protobuf-ts/runtime";
import { MESSAGE_TYPE } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
import { SetPipelinesRequest } from "./sp_external.js";
import { TailResponse } from "./sp_common.js";
import { TailRequest } from "./sp_common.js";
import { NewAudienceRequest } from "./sp_internal.js";
import { DeleteAudienceRequest } from "./sp_external.js";
import { KVRequest } from "./sp_kv.js";
import { MetricsRequest } from "./sp_internal.js";
import { ResumePipelineRequest } from "./sp_external.js";
import { PausePipelineRequest } from "./sp_external.js";
import { DetachPipelineRequest } from "./sp_external.js";
import { AttachPipelineRequest } from "./sp_external.js";
import { UpdatePipelineRequest } from "./sp_external.js";
import { DeletePipelineRequest } from "./sp_external.js";
import { CreatePipelineRequest } from "./sp_external.js";
import { DeregisterRequest } from "./sp_internal.js";
import { RegisterRequest } from "./sp_internal.js";
// @generated message type with reflection information, may provide speed optimized methods
class BusEvent$Type extends MessageType {
    constructor() {
        super("protos.BusEvent", [
            { no: 1, name: "source", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 100, name: "register_request", kind: "message", oneof: "event", T: () => RegisterRequest },
            { no: 101, name: "deregister_request", kind: "message", oneof: "event", T: () => DeregisterRequest },
            { no: 102, name: "create_pipeline_request", kind: "message", oneof: "event", T: () => CreatePipelineRequest },
            { no: 103, name: "delete_pipeline_request", kind: "message", oneof: "event", T: () => DeletePipelineRequest },
            { no: 104, name: "update_pipeline_request", kind: "message", oneof: "event", T: () => UpdatePipelineRequest },
            { no: 105, name: "attach_pipeline_request", kind: "message", oneof: "event", T: () => AttachPipelineRequest },
            { no: 106, name: "detach_pipeline_request", kind: "message", oneof: "event", T: () => DetachPipelineRequest },
            { no: 107, name: "pause_pipeline_request", kind: "message", oneof: "event", T: () => PausePipelineRequest },
            { no: 108, name: "resume_pipeline_request", kind: "message", oneof: "event", T: () => ResumePipelineRequest },
            { no: 109, name: "metrics_request", kind: "message", oneof: "event", T: () => MetricsRequest },
            { no: 110, name: "kv_request", kind: "message", oneof: "event", T: () => KVRequest },
            { no: 111, name: "delete_audience_request", kind: "message", oneof: "event", T: () => DeleteAudienceRequest },
            { no: 112, name: "new_audience_request", kind: "message", oneof: "event", T: () => NewAudienceRequest },
            { no: 113, name: "tail_request", kind: "message", oneof: "event", T: () => TailRequest },
            { no: 114, name: "tail_response", kind: "message", oneof: "event", T: () => TailResponse },
            { no: 115, name: "set_pipelines_request", kind: "message", oneof: "event", T: () => SetPipelinesRequest },
            { no: 1000, name: "_metadata", kind: "map", K: 9 /*ScalarType.STRING*/, V: { kind: "scalar", T: 9 /*ScalarType.STRING*/ } }
        ]);
    }
    create(value) {
        const message = { source: "", event: { oneofKind: undefined }, Metadata: {} };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        let message = target !== null && target !== void 0 ? target : this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* string source */ 1:
                    message.source = reader.string();
                    break;
                case /* protos.RegisterRequest register_request */ 100:
                    message.event = {
                        oneofKind: "registerRequest",
                        registerRequest: RegisterRequest.internalBinaryRead(reader, reader.uint32(), options, message.event.registerRequest)
                    };
                    break;
                case /* protos.DeregisterRequest deregister_request */ 101:
                    message.event = {
                        oneofKind: "deregisterRequest",
                        deregisterRequest: DeregisterRequest.internalBinaryRead(reader, reader.uint32(), options, message.event.deregisterRequest)
                    };
                    break;
                case /* protos.CreatePipelineRequest create_pipeline_request */ 102:
                    message.event = {
                        oneofKind: "createPipelineRequest",
                        createPipelineRequest: CreatePipelineRequest.internalBinaryRead(reader, reader.uint32(), options, message.event.createPipelineRequest)
                    };
                    break;
                case /* protos.DeletePipelineRequest delete_pipeline_request */ 103:
                    message.event = {
                        oneofKind: "deletePipelineRequest",
                        deletePipelineRequest: DeletePipelineRequest.internalBinaryRead(reader, reader.uint32(), options, message.event.deletePipelineRequest)
                    };
                    break;
                case /* protos.UpdatePipelineRequest update_pipeline_request */ 104:
                    message.event = {
                        oneofKind: "updatePipelineRequest",
                        updatePipelineRequest: UpdatePipelineRequest.internalBinaryRead(reader, reader.uint32(), options, message.event.updatePipelineRequest)
                    };
                    break;
                case /* protos.AttachPipelineRequest attach_pipeline_request = 105 [deprecated = true];*/ 105:
                    message.event = {
                        oneofKind: "attachPipelineRequest",
                        attachPipelineRequest: AttachPipelineRequest.internalBinaryRead(reader, reader.uint32(), options, message.event.attachPipelineRequest)
                    };
                    break;
                case /* protos.DetachPipelineRequest detach_pipeline_request = 106 [deprecated = true];*/ 106:
                    message.event = {
                        oneofKind: "detachPipelineRequest",
                        detachPipelineRequest: DetachPipelineRequest.internalBinaryRead(reader, reader.uint32(), options, message.event.detachPipelineRequest)
                    };
                    break;
                case /* protos.PausePipelineRequest pause_pipeline_request */ 107:
                    message.event = {
                        oneofKind: "pausePipelineRequest",
                        pausePipelineRequest: PausePipelineRequest.internalBinaryRead(reader, reader.uint32(), options, message.event.pausePipelineRequest)
                    };
                    break;
                case /* protos.ResumePipelineRequest resume_pipeline_request */ 108:
                    message.event = {
                        oneofKind: "resumePipelineRequest",
                        resumePipelineRequest: ResumePipelineRequest.internalBinaryRead(reader, reader.uint32(), options, message.event.resumePipelineRequest)
                    };
                    break;
                case /* protos.MetricsRequest metrics_request */ 109:
                    message.event = {
                        oneofKind: "metricsRequest",
                        metricsRequest: MetricsRequest.internalBinaryRead(reader, reader.uint32(), options, message.event.metricsRequest)
                    };
                    break;
                case /* protos.KVRequest kv_request */ 110:
                    message.event = {
                        oneofKind: "kvRequest",
                        kvRequest: KVRequest.internalBinaryRead(reader, reader.uint32(), options, message.event.kvRequest)
                    };
                    break;
                case /* protos.DeleteAudienceRequest delete_audience_request */ 111:
                    message.event = {
                        oneofKind: "deleteAudienceRequest",
                        deleteAudienceRequest: DeleteAudienceRequest.internalBinaryRead(reader, reader.uint32(), options, message.event.deleteAudienceRequest)
                    };
                    break;
                case /* protos.NewAudienceRequest new_audience_request */ 112:
                    message.event = {
                        oneofKind: "newAudienceRequest",
                        newAudienceRequest: NewAudienceRequest.internalBinaryRead(reader, reader.uint32(), options, message.event.newAudienceRequest)
                    };
                    break;
                case /* protos.TailRequest tail_request */ 113:
                    message.event = {
                        oneofKind: "tailRequest",
                        tailRequest: TailRequest.internalBinaryRead(reader, reader.uint32(), options, message.event.tailRequest)
                    };
                    break;
                case /* protos.TailResponse tail_response */ 114:
                    message.event = {
                        oneofKind: "tailResponse",
                        tailResponse: TailResponse.internalBinaryRead(reader, reader.uint32(), options, message.event.tailResponse)
                    };
                    break;
                case /* protos.SetPipelinesRequest set_pipelines_request */ 115:
                    message.event = {
                        oneofKind: "setPipelinesRequest",
                        setPipelinesRequest: SetPipelinesRequest.internalBinaryRead(reader, reader.uint32(), options, message.event.setPipelinesRequest)
                    };
                    break;
                case /* map<string, string> _metadata */ 1000:
                    this.binaryReadMap1000(message.Metadata, reader, options);
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    binaryReadMap1000(map, reader, options) {
        let len = reader.uint32(), end = reader.pos + len, key, val;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case 1:
                    key = reader.string();
                    break;
                case 2:
                    val = reader.string();
                    break;
                default: throw new globalThis.Error("unknown map entry field for field protos.BusEvent._metadata");
            }
        }
        map[key !== null && key !== void 0 ? key : ""] = val !== null && val !== void 0 ? val : "";
    }
    internalBinaryWrite(message, writer, options) {
        /* string source = 1; */
        if (message.source !== "")
            writer.tag(1, WireType.LengthDelimited).string(message.source);
        /* protos.RegisterRequest register_request = 100; */
        if (message.event.oneofKind === "registerRequest")
            RegisterRequest.internalBinaryWrite(message.event.registerRequest, writer.tag(100, WireType.LengthDelimited).fork(), options).join();
        /* protos.DeregisterRequest deregister_request = 101; */
        if (message.event.oneofKind === "deregisterRequest")
            DeregisterRequest.internalBinaryWrite(message.event.deregisterRequest, writer.tag(101, WireType.LengthDelimited).fork(), options).join();
        /* protos.CreatePipelineRequest create_pipeline_request = 102; */
        if (message.event.oneofKind === "createPipelineRequest")
            CreatePipelineRequest.internalBinaryWrite(message.event.createPipelineRequest, writer.tag(102, WireType.LengthDelimited).fork(), options).join();
        /* protos.DeletePipelineRequest delete_pipeline_request = 103; */
        if (message.event.oneofKind === "deletePipelineRequest")
            DeletePipelineRequest.internalBinaryWrite(message.event.deletePipelineRequest, writer.tag(103, WireType.LengthDelimited).fork(), options).join();
        /* protos.UpdatePipelineRequest update_pipeline_request = 104; */
        if (message.event.oneofKind === "updatePipelineRequest")
            UpdatePipelineRequest.internalBinaryWrite(message.event.updatePipelineRequest, writer.tag(104, WireType.LengthDelimited).fork(), options).join();
        /* protos.AttachPipelineRequest attach_pipeline_request = 105 [deprecated = true]; */
        if (message.event.oneofKind === "attachPipelineRequest")
            AttachPipelineRequest.internalBinaryWrite(message.event.attachPipelineRequest, writer.tag(105, WireType.LengthDelimited).fork(), options).join();
        /* protos.DetachPipelineRequest detach_pipeline_request = 106 [deprecated = true]; */
        if (message.event.oneofKind === "detachPipelineRequest")
            DetachPipelineRequest.internalBinaryWrite(message.event.detachPipelineRequest, writer.tag(106, WireType.LengthDelimited).fork(), options).join();
        /* protos.PausePipelineRequest pause_pipeline_request = 107; */
        if (message.event.oneofKind === "pausePipelineRequest")
            PausePipelineRequest.internalBinaryWrite(message.event.pausePipelineRequest, writer.tag(107, WireType.LengthDelimited).fork(), options).join();
        /* protos.ResumePipelineRequest resume_pipeline_request = 108; */
        if (message.event.oneofKind === "resumePipelineRequest")
            ResumePipelineRequest.internalBinaryWrite(message.event.resumePipelineRequest, writer.tag(108, WireType.LengthDelimited).fork(), options).join();
        /* protos.MetricsRequest metrics_request = 109; */
        if (message.event.oneofKind === "metricsRequest")
            MetricsRequest.internalBinaryWrite(message.event.metricsRequest, writer.tag(109, WireType.LengthDelimited).fork(), options).join();
        /* protos.KVRequest kv_request = 110; */
        if (message.event.oneofKind === "kvRequest")
            KVRequest.internalBinaryWrite(message.event.kvRequest, writer.tag(110, WireType.LengthDelimited).fork(), options).join();
        /* protos.DeleteAudienceRequest delete_audience_request = 111; */
        if (message.event.oneofKind === "deleteAudienceRequest")
            DeleteAudienceRequest.internalBinaryWrite(message.event.deleteAudienceRequest, writer.tag(111, WireType.LengthDelimited).fork(), options).join();
        /* protos.NewAudienceRequest new_audience_request = 112; */
        if (message.event.oneofKind === "newAudienceRequest")
            NewAudienceRequest.internalBinaryWrite(message.event.newAudienceRequest, writer.tag(112, WireType.LengthDelimited).fork(), options).join();
        /* protos.TailRequest tail_request = 113; */
        if (message.event.oneofKind === "tailRequest")
            TailRequest.internalBinaryWrite(message.event.tailRequest, writer.tag(113, WireType.LengthDelimited).fork(), options).join();
        /* protos.TailResponse tail_response = 114; */
        if (message.event.oneofKind === "tailResponse")
            TailResponse.internalBinaryWrite(message.event.tailResponse, writer.tag(114, WireType.LengthDelimited).fork(), options).join();
        /* protos.SetPipelinesRequest set_pipelines_request = 115; */
        if (message.event.oneofKind === "setPipelinesRequest")
            SetPipelinesRequest.internalBinaryWrite(message.event.setPipelinesRequest, writer.tag(115, WireType.LengthDelimited).fork(), options).join();
        /* map<string, string> _metadata = 1000; */
        for (let k of Object.keys(message.Metadata))
            writer.tag(1000, WireType.LengthDelimited).fork().tag(1, WireType.LengthDelimited).string(k).tag(2, WireType.LengthDelimited).string(message.Metadata[k]).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.BusEvent
 */
export const BusEvent = new BusEvent$Type();
