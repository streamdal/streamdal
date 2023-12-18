"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Create = void 0;
const plugin_framework_1 = require("@protobuf-ts/plugin-framework");
const ts = require("typescript");
/**
 * Generates a "create()" method for an `IMessageType`
 */
class Create {
    constructor(registry, imports, interpreter, options) {
        this.registry = registry;
        this.imports = imports;
        this.interpreter = interpreter;
        this.options = options;
    }
    // create(value?: PartialMessage<ScalarValuesMessage>): ScalarValuesMessage {
    make(source, descriptor) {
        // create(value?: PartialMessage<ScalarValuesMessage>): ScalarValuesMessage {
        let methodDeclaration = this.makeMethod(source, descriptor, 
        // const message = { boolField: false, ... };
        this.makeMessageVariable(source, descriptor), 
        // Object.defineProperty(message, MESSAGE_TYPE, {enumerable: false, value: this});
        this.makeDefineMessageTypeSymbolProperty(source), 
        // if (value !== undefined)
        //     reflectionMergePartial<ScalarValuesMessage>(message, value, this);
        this.makeMergeIf(source, descriptor), 
        // return message;
        ts.createReturn(ts.createIdentifier("message")));
        return [methodDeclaration];
    }
    makeMethod(source, descriptor, ...bodyStatements) {
        const MessageInterface = this.imports.type(source, descriptor), PartialMessage = this.imports.name(source, 'PartialMessage', this.options.runtimeImportPath, true);
        return ts.createMethod(undefined, undefined, undefined, ts.createIdentifier("create"), undefined, undefined, [
            ts.createParameter(undefined, undefined, undefined, ts.createIdentifier("value"), ts.createToken(ts.SyntaxKind.QuestionToken), ts.createTypeReferenceNode(PartialMessage, [
                ts.createTypeReferenceNode((MessageInterface), undefined)
            ]), undefined)
        ], ts.createTypeReferenceNode(MessageInterface, undefined), ts.createBlock(bodyStatements, true));
    }
    makeMessageVariable(source, descriptor) {
        let messageType = this.interpreter.getMessageType(descriptor);
        let defaultMessage = messageType.create();
        return ts.createVariableStatement(undefined, ts.createVariableDeclarationList([ts.createVariableDeclaration(ts.createIdentifier("message"), undefined, plugin_framework_1.typescriptLiteralFromValue(defaultMessage))], ts.NodeFlags.Const));
    }
    makeDefineMessageTypeSymbolProperty(source) {
        const MESSAGE_TYPE = this.imports.name(source, 'MESSAGE_TYPE', this.options.runtimeImportPath);
        return ts.createExpressionStatement(ts.createCall(ts.createPropertyAccess(ts.createPropertyAccess(ts.createIdentifier("globalThis"), ts.createIdentifier("Object")), ts.createIdentifier("defineProperty")), undefined, [
            ts.createIdentifier("message"),
            ts.createIdentifier(MESSAGE_TYPE),
            ts.createObjectLiteral([
                ts.createPropertyAssignment(ts.createIdentifier("enumerable"), ts.createFalse()),
                ts.createPropertyAssignment(ts.createIdentifier("value"), ts.createThis())
            ], false)
        ]));
    }
    makeMergeIf(source, descriptor) {
        const MessageInterface = this.imports.type(source, descriptor);
        return ts.createIf(ts.createBinary(ts.createIdentifier("value"), ts.createToken(ts.SyntaxKind.ExclamationEqualsEqualsToken), ts.createIdentifier("undefined")), ts.createExpressionStatement(ts.createCall(ts.createIdentifier(this.imports.name(source, 'reflectionMergePartial', this.options.runtimeImportPath)), [ts.createTypeReferenceNode(MessageInterface, undefined)], [
            ts.createThis(),
            ts.createIdentifier("message"),
            ts.createIdentifier("value"),
        ])), undefined);
    }
}
exports.Create = Create;
