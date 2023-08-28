import type { ElementNode } from "@astrojs/compiler/types";
import type { ParseTemplateResult } from "astro-eslint-parser";
import type { Linter } from "eslint";
export declare class ClientScript {
    private readonly id;
    private readonly code;
    private readonly script;
    private readonly parsed;
    private readonly block;
    constructor(code: string, script: ElementNode, parsed: ParseTemplateResult);
    private initBlock;
    private extractDefineVars;
    getProcessorFile(): Linter.ProcessorFile;
    remapMessages(messages: Linter.LintMessage[]): Linter.LintMessage[];
    private isIgnoreMessage;
}
