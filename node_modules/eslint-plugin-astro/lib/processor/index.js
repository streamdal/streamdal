"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processor = void 0;
const astro_eslint_parser_1 = require("astro-eslint-parser");
const shared_1 = require("../shared");
exports.processor = {
    preprocess(code, filename) {
        if (filename) {
            const shared = (0, shared_1.beginShared)(filename);
            let parsed;
            try {
                parsed = (0, astro_eslint_parser_1.parseTemplate)(code);
            }
            catch (_a) {
                return [code];
            }
            parsed.walk(parsed.result.ast, (node) => {
                if (node.type === "element" &&
                    node.name === "script" &&
                    node.children.length) {
                    shared.addClientScript(code, node, parsed);
                }
            });
            return [code, ...shared.clientScripts.map((cs) => cs.getProcessorFile())];
        }
        return [code];
    },
    postprocess([messages, ...blockMessages], filename) {
        const shared = (0, shared_1.terminateShared)(filename);
        if (shared) {
            return messages.concat(...blockMessages.map((m, i) => shared.clientScripts[i].remapMessages(m)));
        }
        return messages;
    },
    supportsAutofix: true,
};
