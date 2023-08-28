"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.remark = void 0;
const tslib_1 = require("tslib");
const node_path_1 = tslib_1.__importDefault(require("node:path"));
const eslint_mdx_1 = require("eslint-mdx");
exports.remark = {
    meta: {
        type: 'layout',
        docs: {
            description: 'Linter integration with remark plugins',
            category: 'Stylistic Issues',
            recommended: true,
        },
        fixable: 'code',
    },
    create(context) {
        const filename = context.getFilename();
        const extname = node_path_1.default.extname(filename);
        const sourceCode = context.getSourceCode();
        const options = context.parserOptions;
        const isMdx = [
            ...eslint_mdx_1.DEFAULT_EXTENSIONS,
            ...(options.extensions || []),
        ].includes(extname);
        const isMarkdown = [
            ...eslint_mdx_1.MARKDOWN_EXTENSIONS,
            ...(options.markdownExtensions || []),
        ].includes(extname);
        return {
            Program(node) {
                if (!isMdx && !isMarkdown) {
                    return;
                }
                const ignoreRemarkConfig = Boolean(options.ignoreRemarkConfig);
                const physicalFilename = (0, eslint_mdx_1.getPhysicalFilename)(filename);
                const sourceText = sourceCode.getText(node);
                const { messages, content: fixedText } = (0, eslint_mdx_1.performSyncWork)({
                    fileOptions: {
                        path: physicalFilename,
                        value: sourceText,
                        cwd: context.getCwd(),
                    },
                    physicalFilename,
                    isMdx,
                    process: true,
                    ignoreRemarkConfig,
                });
                let fixed = 0;
                for (const { source, reason, ruleId, fatal, line, column, position: { start, end }, } of messages) {
                    const severity = fatal ? 2 : fatal == null ? 0 : 1;
                    if (!severity) {
                        continue;
                    }
                    const message = {
                        reason,
                        source,
                        ruleId,
                        severity,
                    };
                    context.report({
                        message: JSON.stringify(message),
                        loc: {
                            line,
                            column: column - 1,
                            start: Object.assign(Object.assign({}, start), { column: start.column - 1 }),
                            end: Object.assign(Object.assign({}, end), { column: end.column - 1 }),
                        },
                        node,
                        fix: fixedText === sourceText
                            ? null
                            : () => fixed++
                                ? null
                                : {
                                    range: [0, sourceText.length],
                                    text: fixedText,
                                },
                    });
                }
            },
        };
    },
};
//# sourceMappingURL=remark.js.map