declare const _default: {
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
export = _default;
