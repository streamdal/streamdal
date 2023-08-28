/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./dataProvider", "./data/webCustomData", "../utils/arrays"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HTMLDataManager = void 0;
    const dataProvider_1 = require("./dataProvider");
    const webCustomData_1 = require("./data/webCustomData");
    const arrays = require("../utils/arrays");
    class HTMLDataManager {
        constructor(options) {
            this.dataProviders = [];
            this.setDataProviders(options.useDefaultDataProvider !== false, options.customDataProviders || []);
        }
        setDataProviders(builtIn, providers) {
            this.dataProviders = [];
            if (builtIn) {
                this.dataProviders.push(new dataProvider_1.HTMLDataProvider('html5', webCustomData_1.htmlData));
            }
            this.dataProviders.push(...providers);
        }
        getDataProviders() {
            return this.dataProviders;
        }
        isVoidElement(e, voidElements) {
            return !!e && arrays.binarySearch(voidElements, e.toLowerCase(), (s1, s2) => s1.localeCompare(s2)) >= 0;
        }
        getVoidElements(languageOrProviders) {
            const dataProviders = Array.isArray(languageOrProviders) ? languageOrProviders : this.getDataProviders().filter(p => p.isApplicable(languageOrProviders));
            const voidTags = [];
            dataProviders.forEach((provider) => {
                provider.provideTags().filter(tag => tag.void).forEach(tag => voidTags.push(tag.name));
            });
            return voidTags.sort();
        }
    }
    exports.HTMLDataManager = HTMLDataManager;
});
