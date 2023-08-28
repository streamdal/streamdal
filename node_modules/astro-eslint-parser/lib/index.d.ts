import * as eslint from 'eslint';
import { TSESTree } from '@typescript-eslint/types';
import { ScopeManager } from '@typescript-eslint/scope-manager';
import { ParseResult } from '@astrojs/compiler';
import { Node, AttributeNode, ParentNode } from '@astrojs/compiler/types';
import { VisitorKeys as VisitorKeys$1 } from '@typescript-eslint/visitor-keys';

type RangeAndLoc = {
    range: TSESTree.Range;
    loc: TSESTree.SourceLocation;
};
declare class Context {
    readonly code: string;
    readonly filePath?: string;
    readonly locs: LinesAndColumns;
    private readonly locsMap;
    private readonly state;
    constructor(code: string, filePath?: string);
    getLocFromIndex(index: number): {
        line: number;
        column: number;
    };
    getIndexFromLoc(loc: {
        line: number;
        column: number;
    }): number;
    /**
     * Get the location information of the given indexes.
     */
    getLocations(start: number, end: number): RangeAndLoc;
    /**
     * Build token
     */
    buildToken(type: TSESTree.Token["type"], range: TSESTree.Range): TSESTree.Token;
    /**
     * get text
     */
    getText(range: TSESTree.Range): string;
    get originalAST(): any;
    set originalAST(originalAST: any);
}
declare class LinesAndColumns {
    private readonly lineStartIndices;
    private readonly code;
    private readonly normalizedLineFeed;
    constructor(origCode: string);
    getLocFromIndex(index: number): {
        line: number;
        column: number;
    };
    getIndexFromLoc(loc: {
        line: number;
        column: number;
    }): number;
    getNormalizedLineFeed(): NormalizedLineFeed;
}
declare class NormalizedLineFeed {
    readonly code: string;
    private readonly offsets;
    get needRemap(): boolean;
    /**
     * Remap index
     */
    readonly remapIndex: (index: number) => number;
    constructor(code: string, offsets: number[]);
}

interface BaseNode {
    loc: TSESTree.SourceLocation;
    range: TSESTree.Range;
    type: string;
}

type JSXNode = JSXAttribute | JSXClosingElement | JSXClosingFragment | JSXElement | JSXEmptyExpression | JSXExpressionContainer | JSXFragment | JSXIdentifier | JSXMemberExpression | JSXNamespacedName | JSXOpeningElement | JSXOpeningFragment | JSXSpreadAttribute | JSXSpreadChild | JSXText;
type JSXChild = JSXElement | JSXFragment | JSXExpression | JSXText | AstroHTMLComment | AstroRawText;
type JSXParentNode = JSXElement | JSXFragment | AstroFragment;
interface JSXElement extends BaseNode {
    type: "JSXElement";
    openingElement: JSXOpeningElement;
    closingElement: JSXClosingElement | null;
    children: JSXChild[];
    parent?: JSXParentNode;
}
interface JSXFragment extends BaseNode {
    type: "JSXFragment";
    openingFragment: JSXOpeningFragment;
    closingFragment: JSXClosingFragment;
    children: JSXChild[];
    parent?: JSXParentNode;
}
interface JSXOpeningElement extends BaseNode {
    type: "JSXOpeningElement";
    typeParameters?: TSESTree.TSTypeParameterInstantiation;
    selfClosing: boolean;
    name: JSXTagNameExpression;
    attributes: (JSXAttribute | JSXSpreadAttribute | AstroShorthandAttribute | AstroTemplateLiteralAttribute)[];
    parent?: JSXElement;
}
interface JSXClosingElement extends BaseNode {
    type: "JSXClosingElement";
    name: JSXTagNameExpression;
    parent?: JSXElement;
}
interface JSXClosingFragment extends BaseNode {
    type: "JSXClosingFragment";
    parent?: JSXFragment;
}
interface JSXOpeningFragment extends BaseNode {
    type: "JSXOpeningFragment";
    parent?: JSXFragment;
}
interface JSXAttribute extends BaseNode {
    type: "JSXAttribute";
    name: JSXIdentifier | JSXNamespacedName;
    value: JSXExpression | TSESTree.Literal | null;
    parent?: JSXOpeningElement;
}
interface JSXSpreadAttribute extends BaseNode {
    type: "JSXSpreadAttribute";
    argument: TSESTree.Expression;
    parent?: JSXOpeningElement;
}
type JSXTagNameExpression = JSXIdentifier | JSXMemberExpression | JSXNamespacedName;
interface JSXIdentifier extends BaseNode {
    type: "JSXIdentifier";
    name: string;
    parent?: JSXAttribute | AstroShorthandAttribute | AstroTemplateLiteralAttribute | JSXMemberExpression | JSXNamespacedName | JSXOpeningElement | JSXClosingElement;
}
interface JSXMemberExpression extends BaseNode {
    type: "JSXMemberExpression";
    object: JSXTagNameExpression;
    property: JSXIdentifier;
    parent?: JSXMemberExpression | JSXOpeningElement | JSXClosingElement;
}
interface JSXNamespacedName extends BaseNode {
    type: "JSXNamespacedName";
    namespace: JSXIdentifier;
    name: JSXIdentifier;
    parent?: JSXAttribute | AstroShorthandAttribute | AstroTemplateLiteralAttribute | JSXMemberExpression | JSXOpeningElement | JSXClosingElement;
}
type JSXExpression = JSXExpressionContainer | JSXSpreadChild;
interface JSXExpressionContainer extends BaseNode {
    type: "JSXExpressionContainer";
    expression: TSESTree.Expression | JSXEmptyExpression;
    parent?: JSXAttribute | AstroShorthandAttribute | AstroTemplateLiteralAttribute | JSXParentNode;
}
interface JSXSpreadChild extends BaseNode {
    type: "JSXSpreadChild";
    expression: TSESTree.Expression;
    parent?: JSXAttribute | JSXParentNode;
}
interface JSXEmptyExpression extends BaseNode {
    type: "JSXEmptyExpression";
    parent?: JSXExpressionContainer;
}
interface JSXText extends BaseNode {
    type: "JSXText";
    value: string;
    raw: string;
    parent?: JSXParentNode;
}

type AstroNode = AstroProgram | AstroFragment | AstroHTMLComment | AstroDoctype | AstroShorthandAttribute | AstroTemplateLiteralAttribute | AstroRawText;
type AstroChild = JSXElement | JSXFragment | JSXExpression | JSXText | AstroHTMLComment | AstroRawText;
type AstroParentNode = JSXElement | JSXFragment | AstroFragment;
/** Node of Astro program root */
interface AstroProgram extends Omit<TSESTree.Program, "type" | "body"> {
    type: "Program";
    body: (TSESTree.Program["body"][number] | AstroFragment)[];
    sourceType: "script" | "module";
    comments: TSESTree.Comment[];
    tokens: TSESTree.Token[];
    parent?: undefined;
}
/** Node of Astro fragment */
interface AstroFragment extends BaseNode {
    type: "AstroFragment";
    children: (AstroChild | AstroDoctype)[];
    parent?: AstroParentNode;
}
/** Node of Astro html comment */
interface AstroHTMLComment extends BaseNode {
    type: "AstroHTMLComment";
    value: string;
    parent?: AstroParentNode;
}
/** Node of Astro doctype */
interface AstroDoctype extends BaseNode {
    type: "AstroDoctype";
    parent?: AstroFragment;
}
/** Node of Astro shorthand attribute */
interface AstroShorthandAttribute extends Omit<JSXAttribute, "type"> {
    type: "AstroShorthandAttribute";
    value: JSXExpressionContainer;
}
/** Node of Astro template-literal attribute */
interface AstroTemplateLiteralAttribute extends Omit<JSXAttribute, "type"> {
    type: "AstroTemplateLiteralAttribute";
    value: JSXExpressionContainer & {
        expression: TSESTree.TemplateLiteral;
    };
}
/** Node of Astro raw text */
interface AstroRawText extends Omit<JSXText, "type"> {
    type: "AstroRawText";
    parent?: JSXElement;
}

type Comment = TSESTree.Comment;
type Token = TSESTree.Token;
type SourceLocation = TSESTree.SourceLocation;
type Range = TSESTree.Range;
type Position = TSESTree.Position;

type index_AstroChild = AstroChild;
type index_AstroDoctype = AstroDoctype;
type index_AstroFragment = AstroFragment;
type index_AstroHTMLComment = AstroHTMLComment;
type index_AstroNode = AstroNode;
type index_AstroParentNode = AstroParentNode;
type index_AstroProgram = AstroProgram;
type index_AstroRawText = AstroRawText;
type index_AstroShorthandAttribute = AstroShorthandAttribute;
type index_AstroTemplateLiteralAttribute = AstroTemplateLiteralAttribute;
type index_Comment = Comment;
type index_JSXAttribute = JSXAttribute;
type index_JSXChild = JSXChild;
type index_JSXClosingElement = JSXClosingElement;
type index_JSXClosingFragment = JSXClosingFragment;
type index_JSXElement = JSXElement;
type index_JSXEmptyExpression = JSXEmptyExpression;
type index_JSXExpression = JSXExpression;
type index_JSXExpressionContainer = JSXExpressionContainer;
type index_JSXFragment = JSXFragment;
type index_JSXIdentifier = JSXIdentifier;
type index_JSXMemberExpression = JSXMemberExpression;
type index_JSXNamespacedName = JSXNamespacedName;
type index_JSXNode = JSXNode;
type index_JSXOpeningElement = JSXOpeningElement;
type index_JSXOpeningFragment = JSXOpeningFragment;
type index_JSXParentNode = JSXParentNode;
type index_JSXSpreadAttribute = JSXSpreadAttribute;
type index_JSXSpreadChild = JSXSpreadChild;
type index_JSXTagNameExpression = JSXTagNameExpression;
type index_JSXText = JSXText;
type index_Position = Position;
type index_Range = Range;
type index_SourceLocation = SourceLocation;
type index_Token = Token;
declare namespace index {
  export {
    index_AstroChild as AstroChild,
    index_AstroDoctype as AstroDoctype,
    index_AstroFragment as AstroFragment,
    index_AstroHTMLComment as AstroHTMLComment,
    index_AstroNode as AstroNode,
    index_AstroParentNode as AstroParentNode,
    index_AstroProgram as AstroProgram,
    index_AstroRawText as AstroRawText,
    index_AstroShorthandAttribute as AstroShorthandAttribute,
    index_AstroTemplateLiteralAttribute as AstroTemplateLiteralAttribute,
    index_Comment as Comment,
    index_JSXAttribute as JSXAttribute,
    index_JSXChild as JSXChild,
    index_JSXClosingElement as JSXClosingElement,
    index_JSXClosingFragment as JSXClosingFragment,
    index_JSXElement as JSXElement,
    index_JSXEmptyExpression as JSXEmptyExpression,
    index_JSXExpression as JSXExpression,
    index_JSXExpressionContainer as JSXExpressionContainer,
    index_JSXFragment as JSXFragment,
    index_JSXIdentifier as JSXIdentifier,
    index_JSXMemberExpression as JSXMemberExpression,
    index_JSXNamespacedName as JSXNamespacedName,
    index_JSXNode as JSXNode,
    index_JSXOpeningElement as JSXOpeningElement,
    index_JSXOpeningFragment as JSXOpeningFragment,
    index_JSXParentNode as JSXParentNode,
    index_JSXSpreadAttribute as JSXSpreadAttribute,
    index_JSXSpreadChild as JSXSpreadChild,
    index_JSXTagNameExpression as JSXTagNameExpression,
    index_JSXText as JSXText,
    index_Position as Position,
    index_Range as Range,
    index_SourceLocation as SourceLocation,
    index_Token as Token,
  };
}

/**
 * Parse source code
 */
declare function parseForESLint$1(code: string, options?: any): {
    ast: AstroProgram;
    services: Record<string, any> & {
        isAstro: true;
        getAstroAst: () => ParseResult["ast"];
        getAstroResult: () => ParseResult;
    };
    visitorKeys: {
        [type: string]: string[];
    };
    scopeManager: ScopeManager;
};

interface ParseTemplateResult {
    result: ParseResult;
    getEndOffset: (node: Node) => number;
    calcAttributeValueStartOffset: (node: AttributeNode) => number;
    calcAttributeEndOffset: (node: AttributeNode) => number;
    walk: (parent: ParentNode, enter: (n: Node | AttributeNode, parents: ParentNode[]) => void, leave?: (n: Node | AttributeNode, parents: ParentNode[]) => void) => void;
    getLocFromIndex: (index: number) => {
        line: number;
        column: number;
    };
    getIndexFromLoc: (loc: {
        line: number;
        column: number;
    }) => number;
}
/**
 * Parse the astro component template.
 */
declare function parseTemplate(code: string): ParseTemplateResult;

interface Visitor<N> {
    visitorKeys?: VisitorKeys$1;
    enterNode(node: N, parent: N | null): void;
    leaveNode(node: N, parent: N | null): void;
}
declare function traverseNodes(node: AstroNode, visitor: Visitor<AstroNode | TSESTree.Node>): void;
declare function traverseNodes(node: TSESTree.Node, visitor: Visitor<TSESTree.Node>): void;

/**
 * Astro parse errors.
 */
declare class ParseError extends SyntaxError {
    index: number;
    lineNumber: number;
    column: number;
    originalAST: any;
    /**
     * Initialize this ParseError instance.
     */
    constructor(message: string, offset: number | {
        line: number;
        column: number;
    }, ctx: Context);
}

declare const name = "astro-eslint-parser";
/**
 * Parse source code
 */
declare function parseForESLint(code: string, options?: any): ReturnType<typeof parseForESLint$1>;
declare const VisitorKeys: eslint.SourceCode.VisitorKeys;

export { index as AST, ParseError, ParseTemplateResult, VisitorKeys, name, parseForESLint, parseTemplate, traverseNodes };
