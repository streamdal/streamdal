import type { RuleContext, RuleListener } from "../types";
export type PluginRuleModule = {
    meta?: {
        docs?: {
            url?: string;
        };
        messages?: never;
        schema?: never;
        type?: never;
        fixable?: never;
        deprecated?: boolean;
    };
    create: (context: RuleContext) => RuleListener;
};
type PluginConfig = {
    plugins?: string | string[];
    parserOptions?: unknown;
    rules?: Record<string, string | unknown[]>;
};
export type PluginJsxA11y = {
    rules?: Record<string, PluginRuleModule | undefined>;
    configs?: Record<string, PluginConfig | undefined>;
};
export declare function getPluginJsxA11y(): PluginJsxA11y | null;
export {};
