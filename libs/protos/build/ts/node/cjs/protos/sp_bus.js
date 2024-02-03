"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusEvent = void 0;
const runtime_1 = require("@protobuf-ts/runtime");
const runtime_2 = require("@protobuf-ts/runtime");
const runtime_3 = require("@protobuf-ts/runtime");
const runtime_4 = require("@protobuf-ts/runtime");
const runtime_5 = require("@protobuf-ts/runtime");
const sp_external_1 = require("./sp_external");
const sp_common_1 = require("./sp_common");
const sp_common_2 = require("./sp_common");
const sp_internal_1 = require("./sp_internal");
const sp_external_2 = require("./sp_external");
const sp_kv_1 = require("./sp_kv");
const sp_internal_2 = require("./sp_internal");
const sp_external_3 = require("./sp_external");
const sp_external_4 = require("./sp_external");
const sp_external_5 = require("./sp_external");
const sp_external_6 = require("./sp_external");
const sp_external_7 = require("./sp_external");
const sp_internal_3 = require("./sp_internal");
const sp_internal_4 = require("./sp_internal");
// @generated message type with reflection information, may provide speed optimized methods
class BusEvent$Type extends runtime_5.MessageType {
    constructor() {
        super("protos.BusEvent", [
            { no: 1, name: "source", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 100, name: "register_request", kind: "message", oneof: "event", T: () => sp_internal_4.RegisterRequest },
            { no: 101, name: "deregister_request", kind: "message", oneof: "event", T: () => sp_internal_3.DeregisterRequest },
            { no: 102, name: "create_pipeline_request", kind: "message", oneof: "event", T: () => sp_external_7.CreatePipelineRequest },
            { no: 103, name: "delete_pipeline_request", kind: "message", oneof: "event", T: () => sp_external_6.DeletePipelineRequest },
            { no: 104, name: "update_pipeline_request", kind: "message", oneof: "event", T: () => sp_external_5.UpdatePipelineRequest },
            { no: 107, name: "pause_pipeline_request", kind: "message", oneof: "event", T: () => sp_external_4.PausePipelineRequest },
            { no: 108, name: "resume_pipeline_request", kind: "message", oneof: "event", T: () => sp_external_3.ResumePipelineRequest },
            { no: 109, name: "metrics_request", kind: "message", oneof: "event", T: () => sp_internal_2.MetricsRequest },
            { no: 110, name: "kv_request", kind: "message", oneof: "event", T: () => sp_kv_1.KVRequest },
            { no: 111, name: "delete_audience_request", kind: "message", oneof: "event", T: () => sp_external_2.DeleteAudienceRequest },
            { no: 112, name: "new_audience_request", kind: "message", oneof: "event", T: () => sp_internal_1.NewAudienceRequest },
            { no: 113, name: "tail_request", kind: "message", oneof: "event", T: () => sp_common_2.TailRequest },
            { no: 114, name: "tail_response", kind: "message", oneof: "event", T: () => sp_common_1.TailResponse },
            { no: 115, name: "set_pipelines_request", kind: "message", oneof: "event", T: () => sp_external_1.SetPipelinesRequest },
            { no: 1000, name: "_metadata", kind: "map", K: 9 /*ScalarType.STRING*/, V: { kind: "scalar", T: 9 /*ScalarType.STRING*/ } }
        ]);
    }
    create(value) {
        const message = { source: "", event: { oneofKind: undefined }, Metadata: {} };
        globalThis.Object.defineProperty(message, runtime_4.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            (0, runtime_3.reflectionMergePartial)(this, message, value);
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
                        registerRequest: sp_internal_4.RegisterRequest.internalBinaryRead(reader, reader.uint32(), options, message.event.registerRequest)
                    };
                    break;
                case /* protos.DeregisterRequest deregister_request */ 101:
                    message.event = {
                        oneofKind: "deregisterRequest",
                        deregisterRequest: sp_internal_3.DeregisterRequest.internalBinaryRead(reader, reader.uint32(), options, message.event.deregisterRequest)
                    };
                    break;
                case /* protos.CreatePipelineRequest create_pipeline_request */ 102:
                    message.event = {
                        oneofKind: "createPipelineRequest",
                        createPipelineRequest: sp_external_7.CreatePipelineRequest.internalBinaryRead(reader, reader.uint32(), options, message.event.createPipelineRequest)
                    };
                    break;
                case /* protos.DeletePipelineRequest delete_pipeline_request */ 103:
                    message.event = {
                        oneofKind: "deletePipelineRequest",
                        deletePipelineRequest: sp_external_6.DeletePipelineRequest.internalBinaryRead(reader, reader.uint32(), options, message.event.deletePipelineRequest)
                    };
                    break;
                case /* protos.UpdatePipelineRequest update_pipeline_request */ 104:
                    message.event = {
                        oneofKind: "updatePipelineRequest",
                        updatePipelineRequest: sp_external_5.UpdatePipelineRequest.internalBinaryRead(reader, reader.uint32(), options, message.event.updatePipelineRequest)
                    };
                    break;
                case /* protos.PausePipelineRequest pause_pipeline_request */ 107:
                    message.event = {
                        oneofKind: "pausePipelineRequest",
                        pausePipelineRequest: sp_external_4.PausePipelineRequest.internalBinaryRead(reader, reader.uint32(), options, message.event.pausePipelineRequest)
                    };
                    break;
                case /* protos.ResumePipelineRequest resume_pipeline_request */ 108:
                    message.event = {
                        oneofKind: "resumePipelineRequest",
                        resumePipelineRequest: sp_external_3.ResumePipelineRequest.internalBinaryRead(reader, reader.uint32(), options, message.event.resumePipelineRequest)
                    };
                    break;
                case /* protos.MetricsRequest metrics_request */ 109:
                    message.event = {
                        oneofKind: "metricsRequest",
                        metricsRequest: sp_internal_2.MetricsRequest.internalBinaryRead(reader, reader.uint32(), options, message.event.metricsRequest)
                    };
                    break;
                case /* protos.KVRequest kv_request */ 110:
                    message.event = {
                        oneofKind: "kvRequest",
                        kvRequest: sp_kv_1.KVRequest.internalBinaryRead(reader, reader.uint32(), options, message.event.kvRequest)
                    };
                    break;
                case /* protos.DeleteAudienceRequest delete_audience_request */ 111:
                    message.event = {
                        oneofKind: "deleteAudienceRequest",
                        deleteAudienceRequest: sp_external_2.DeleteAudienceRequest.internalBinaryRead(reader, reader.uint32(), options, message.event.deleteAudienceRequest)
                    };
                    break;
                case /* protos.NewAudienceRequest new_audience_request */ 112:
                    message.event = {
                        oneofKind: "newAudienceRequest",
                        newAudienceRequest: sp_internal_1.NewAudienceRequest.internalBinaryRead(reader, reader.uint32(), options, message.event.newAudienceRequest)
                    };
                    break;
                case /* protos.TailRequest tail_request */ 113:
                    message.event = {
                        oneofKind: "tailRequest",
                        tailRequest: sp_common_2.TailRequest.internalBinaryRead(reader, reader.uint32(), options, message.event.tailRequest)
                    };
                    break;
                case /* protos.TailResponse tail_response */ 114:
                    message.event = {
                        oneofKind: "tailResponse",
                        tailResponse: sp_common_1.TailResponse.internalBinaryRead(reader, reader.uint32(), options, message.event.tailResponse)
                    };
                    break;
                case /* protos.SetPipelinesRequest set_pipelines_request */ 115:
                    message.event = {
                        oneofKind: "setPipelinesRequest",
                        setPipelinesRequest: sp_external_1.SetPipelinesRequest.internalBinaryRead(reader, reader.uint32(), options, message.event.setPipelinesRequest)
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
                        (u === true ? runtime_2.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
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
            writer.tag(1, runtime_1.WireType.LengthDelimited).string(message.source);
        /* protos.RegisterRequest register_request = 100; */
        if (message.event.oneofKind === "registerRequest")
            sp_internal_4.RegisterRequest.internalBinaryWrite(message.event.registerRequest, writer.tag(100, runtime_1.WireType.LengthDelimited).fork(), options).join();
        /* protos.DeregisterRequest deregister_request = 101; */
        if (message.event.oneofKind === "deregisterRequest")
            sp_internal_3.DeregisterRequest.internalBinaryWrite(message.event.deregisterRequest, writer.tag(101, runtime_1.WireType.LengthDelimited).fork(), options).join();
        /* protos.CreatePipelineRequest create_pipeline_request = 102; */
        if (message.event.oneofKind === "createPipelineRequest")
            sp_external_7.CreatePipelineRequest.internalBinaryWrite(message.event.createPipelineRequest, writer.tag(102, runtime_1.WireType.LengthDelimited).fork(), options).join();
        /* protos.DeletePipelineRequest delete_pipeline_request = 103; */
        if (message.event.oneofKind === "deletePipelineRequest")
            sp_external_6.DeletePipelineRequest.internalBinaryWrite(message.event.deletePipelineRequest, writer.tag(103, runtime_1.WireType.LengthDelimited).fork(), options).join();
        /* protos.UpdatePipelineRequest update_pipeline_request = 104; */
        if (message.event.oneofKind === "updatePipelineRequest")
            sp_external_5.UpdatePipelineRequest.internalBinaryWrite(message.event.updatePipelineRequest, writer.tag(104, runtime_1.WireType.LengthDelimited).fork(), options).join();
        /* protos.PausePipelineRequest pause_pipeline_request = 107; */
        if (message.event.oneofKind === "pausePipelineRequest")
            sp_external_4.PausePipelineRequest.internalBinaryWrite(message.event.pausePipelineRequest, writer.tag(107, runtime_1.WireType.LengthDelimited).fork(), options).join();
        /* protos.ResumePipelineRequest resume_pipeline_request = 108; */
        if (message.event.oneofKind === "resumePipelineRequest")
            sp_external_3.ResumePipelineRequest.internalBinaryWrite(message.event.resumePipelineRequest, writer.tag(108, runtime_1.WireType.LengthDelimited).fork(), options).join();
        /* protos.MetricsRequest metrics_request = 109; */
        if (message.event.oneofKind === "metricsRequest")
            sp_internal_2.MetricsRequest.internalBinaryWrite(message.event.metricsRequest, writer.tag(109, runtime_1.WireType.LengthDelimited).fork(), options).join();
        /* protos.KVRequest kv_request = 110; */
        if (message.event.oneofKind === "kvRequest")
            sp_kv_1.KVRequest.internalBinaryWrite(message.event.kvRequest, writer.tag(110, runtime_1.WireType.LengthDelimited).fork(), options).join();
        /* protos.DeleteAudienceRequest delete_audience_request = 111; */
        if (message.event.oneofKind === "deleteAudienceRequest")
            sp_external_2.DeleteAudienceRequest.internalBinaryWrite(message.event.deleteAudienceRequest, writer.tag(111, runtime_1.WireType.LengthDelimited).fork(), options).join();
        /* protos.NewAudienceRequest new_audience_request = 112; */
        if (message.event.oneofKind === "newAudienceRequest")
            sp_internal_1.NewAudienceRequest.internalBinaryWrite(message.event.newAudienceRequest, writer.tag(112, runtime_1.WireType.LengthDelimited).fork(), options).join();
        /* protos.TailRequest tail_request = 113; */
        if (message.event.oneofKind === "tailRequest")
            sp_common_2.TailRequest.internalBinaryWrite(message.event.tailRequest, writer.tag(113, runtime_1.WireType.LengthDelimited).fork(), options).join();
        /* protos.TailResponse tail_response = 114; */
        if (message.event.oneofKind === "tailResponse")
            sp_common_1.TailResponse.internalBinaryWrite(message.event.tailResponse, writer.tag(114, runtime_1.WireType.LengthDelimited).fork(), options).join();
        /* protos.SetPipelinesRequest set_pipelines_request = 115; */
        if (message.event.oneofKind === "setPipelinesRequest")
            sp_external_1.SetPipelinesRequest.internalBinaryWrite(message.event.setPipelinesRequest, writer.tag(115, runtime_1.WireType.LengthDelimited).fork(), options).join();
        /* map<string, string> _metadata = 1000; */
        for (let k of Object.keys(message.Metadata))
            writer.tag(1000, runtime_1.WireType.LengthDelimited).fork().tag(1, runtime_1.WireType.LengthDelimited).string(k).tag(2, runtime_1.WireType.LengthDelimited).string(message.Metadata[k]).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_2.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message protos.BusEvent
 */
exports.BusEvent = new BusEvent$Type();
