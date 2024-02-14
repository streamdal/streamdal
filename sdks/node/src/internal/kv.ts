import { KVAction } from "@streamdal/protos/protos/shared/sp_shared";
import { KVCommand } from "@streamdal/protos/protos/sp_command";
import { KVInstruction } from "@streamdal/protos/protos/sp_kv";
import {
  KVStatus,
  KVStep,
  KVStepResponse,
} from "@streamdal/protos/protos/steps/sp_steps_kv";

import { internal } from "./register.js";
import { writeResponse } from "./wasm.js";

export const kvInstruction = (instruction: KVInstruction) => {
  switch (instruction.action) {
    case KVAction.KV_ACTION_DELETE_ALL: {
      internal.kv.clear();
      break;
    }
    case KVAction.KV_ACTION_DELETE: {
      instruction.object?.key && internal.kv.delete(instruction.object.key);
      break;
    }
    case KVAction.KV_ACTION_EXISTS: {
      return instruction.object?.key && internal.kv.has(instruction.object.key);
    }
    case KVAction.KV_ACTION_GET: {
      return instruction.object?.key && internal.kv.get(instruction.object.key);
    }
    case KVAction.KV_ACTION_UPDATE:
    case KVAction.KV_ACTION_CREATE: {
      instruction.object?.key &&
        internal.kv.set(instruction.object.key, instruction.object.value);
      break;
    }
  }
};

export const kvCommand = (command: KVCommand) => {
  for (const instruction of command.instructions) {
    kvInstruction(instruction);
  }
};

export const kvExists = (
  exports: any,
  keyPointer: number,
  keyLength: number
): bigint => {
  const kvStep = KVStep.fromBinary(
    new Uint8Array(exports.memory.buffer, keyPointer, keyLength)
  );
  const resultBytes = KVStepResponse.toBinary(
    KVStepResponse.create({
      status: internal.kv.has(kvStep.key)
        ? KVStatus.KV_STATUS_SUCCESS
        : KVStatus.KV_STATUS_FAILURE,
    })
  );

  const resultPointer = exports.alloc(resultBytes.length);
  const mem = new Uint8Array(
    exports.memory.buffer,
    resultPointer,
    resultBytes.length
  );
  mem.set(resultBytes);
  const response = writeResponse(resultPointer, resultBytes.length);

  return response;
};
