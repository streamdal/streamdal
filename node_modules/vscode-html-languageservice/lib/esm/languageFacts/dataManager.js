/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { HTMLDataProvider } from './dataProvider';
import { htmlData } from './data/webCustomData';
import * as arrays from '../utils/arrays';
export class HTMLDataManager {
    constructor(options) {
        this.dataProviders = [];
        this.setDataProviders(options.useDefaultDataProvider !== false, options.customDataProviders || []);
    }
    setDataProviders(builtIn, providers) {
        this.dataProviders = [];
        if (builtIn) {
            this.dataProviders.push(new HTMLDataProvider('html5', htmlData));
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
