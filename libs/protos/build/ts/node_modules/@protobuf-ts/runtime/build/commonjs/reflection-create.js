"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reflectionCreate = void 0;
const reflection_scalar_default_1 = require("./reflection-scalar-default");
const message_type_contract_1 = require("./message-type-contract");
/**
 * Creates an instance of the generic message, using the field
 * information.
 */
function reflectionCreate(type) {
    const msg = {};
    Object.defineProperty(msg, message_type_contract_1.MESSAGE_TYPE, { enumerable: false, value: type });
    for (let field of type.fields) {
        let name = field.localName;
        if (field.opt)
            continue;
        if (field.oneof)
            msg[field.oneof] = { oneofKind: undefined };
        else if (field.repeat)
            msg[name] = [];
        else
            switch (field.kind) {
                case "scalar":
                    msg[name] = reflection_scalar_default_1.reflectionScalarDefault(field.T, field.L);
                    break;
                case "enum":
                    // we require 0 to be default value for all enums
                    msg[name] = 0;
                    break;
                case "map":
                    msg[name] = {};
                    break;
            }
    }
    return msg;
}
exports.reflectionCreate = reflectionCreate;
