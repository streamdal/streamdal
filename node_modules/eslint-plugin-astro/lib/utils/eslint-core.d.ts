import type { RuleListener, RuleContext, RuleModule } from "../types";
import type * as ESTree from "estree";
import type { AST as AstroAST } from "astro-eslint-parser";
export declare function defineWrapperListener(coreRule: RuleModule, context: RuleContext, proxyOptions: {
    createListenerProxy?: (listener: RuleListener) => RuleListener;
}): RuleListener;
export declare function getProxyNode(node: {
    type: string;
}, properties: any): any;
export declare function buildProxyListener(base: RuleListener, convertNode: (node: AstroAST.AstroNode | (ESTree.Node & {
    parent: AstroAST.AstroNode | ESTree.Node | null;
})) => any): RuleListener;
export declare function newProxy<T extends object>(target: T, ...propsArray: Partial<T>[]): T;
export declare function getCoreRule(ruleName: string): RuleModule;
