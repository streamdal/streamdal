import { ClientScript } from "./client-script";
import type { ElementNode } from "@astrojs/compiler/types";
import type { ParseTemplateResult } from "astro-eslint-parser";
export declare class Shared {
    readonly clientScripts: ClientScript[];
    addClientScript(code: string, node: ElementNode, parsed: ParseTemplateResult): ClientScript;
}
export declare function beginShared(filename: string): Shared;
export declare function terminateShared(filename: string): Shared | null;
export declare function getShared(filename: string): Shared | null;
