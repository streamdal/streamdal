import { KVAction } from "@streamdal/protos/protos/shared/sp_shared";
import { KVCommand } from "@streamdal/protos/protos/sp_command";
import { KVInstruction } from "@streamdal/protos/protos/sp_kv";

import { internal } from "./register.js";

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
  memory: WebAssembly.Memory,
  pointer: number,
  length: number
): boolean => {
  const bytes = new Uint8Array(memory.buffer, pointer, length);
  const key = new TextDecoder().decode(bytes);
  return internal.kv.has(key);
};
