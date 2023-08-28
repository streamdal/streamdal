import type { RuleModule } from "./types";
declare const _default: {
    configs: {
        base: {
            plugins: string[];
            overrides: ({
                files: string[];
                plugins: string[];
                env: {
                    node: boolean;
                    "astro/astro": boolean;
                    es2020: boolean;
                    browser?: undefined;
                };
                parser: string;
                parserOptions: {
                    parser: string | undefined;
                    extraFileExtensions: string[];
                    sourceType: string;
                };
                rules: {
                    "prettier/prettier"?: undefined;
                };
            } | {
                files: string[];
                env: {
                    browser: boolean;
                    es2020: boolean;
                    node?: undefined;
                    "astro/astro"?: undefined;
                };
                parserOptions: {
                    sourceType: string;
                    parser?: undefined;
                    extraFileExtensions?: undefined;
                };
                rules: {
                    "prettier/prettier": string;
                };
                plugins?: undefined;
                parser?: undefined;
            })[];
        };
        recommended: {
            extends: string[];
            rules: {
                "astro/no-conflict-set-directives": string;
                "astro/no-deprecated-astro-canonicalurl": string;
                "astro/no-deprecated-astro-fetchcontent": string;
                "astro/no-deprecated-astro-resolve": string;
                "astro/no-unused-define-vars-in-style": string;
                "astro/valid-compile": string;
            };
        };
        all: {
            extends: string[];
            rules: {
                "astro/no-conflict-set-directives": string;
                "astro/no-deprecated-astro-canonicalurl": string;
                "astro/no-deprecated-astro-fetchcontent": string;
                "astro/no-deprecated-astro-resolve": string;
                "astro/no-unused-define-vars-in-style": string;
                "astro/valid-compile": string;
            };
        };
    };
    rules: {
        [key: string]: RuleModule;
    };
    processors: {
        ".astro": import("eslint").Linter.Processor<string | import("eslint").Linter.ProcessorFile>;
        astro: import("eslint").Linter.Processor<string | import("eslint").Linter.ProcessorFile>;
    };
    environments: {
        astro: {
            globals: {
                Astro: boolean;
                Fragment: boolean;
            };
        };
    };
};
export = _default;
