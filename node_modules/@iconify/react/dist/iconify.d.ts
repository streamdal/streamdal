import { IconifyIcon } from '@iconify/types';
import { IconifyJSON } from '@iconify/types';
import { IconifyTransformations } from '@iconify/types';
import { default as React_2 } from 'react';
import type { RefAttributes } from 'react';
import type { SVGProps } from 'react';

/**
 * Add custom config for provider
 */
export declare function addAPIProvider(provider: string, customConfig: PartialIconifyAPIConfig): boolean;

/**
 * Add icon set
 */
export declare function addCollection(data: IconifyJSON, provider?: string): boolean;

/**
 * Add one icon
 */
export declare function addIcon(name: string, data: IconifyIcon): boolean;

/**
 * Internal API
 */
export declare const _api: IconifyAPIInternalFunctions;

declare type BrowserStorageType = 'local' | 'session';

/**
 * Get SVG attributes and content from icon + customisations
 *
 * Does not generate style to make it compatible with frameworks that use objects for style, such as React.
 * Instead, it generates 'inline' value. If true, rendering engine should add verticalAlign: -0.125em to icon.
 *
 * Customisations should be normalised by platform specific parser.
 * Result should be converted to <svg> by platform specific parser.
 * Use replaceIDs to generate unique IDs for body.
 */
export declare function buildIcon(icon: IconifyIcon, customisations?: IconifyIconCustomisations_2): IconifyIconBuildResult;

/**
 * Calculate second dimension when only 1 dimension is set
 */
export declare function calculateSize(size: string, ratio: number, precision?: number): string;

export declare function calculateSize(size: number, ratio: number, precision?: number): number;

export declare function calculateSize(size: string | number, ratio: number, precision?: number): string | number;

/**
 * Disable cache
 */
export declare function disableCache(storage: IconifyBrowserCacheType): void;

/**
 * Enable cache
 */
export declare function enableCache(storage: IconifyBrowserCacheType): void;

/**
 * Signature for getAPIConfig
 */
export declare type GetAPIConfig = (provider: string) => IconifyAPIConfig | undefined;

/**
 * Get full icon
 */
export declare function getIcon(name: string): Required<IconifyIcon> | null;

/**
 * Block icon
 *
 * @param props - Component properties
 */
export declare const Icon: (props: IconProps) => React_2.ReactElement<IconProps, string | React_2.JSXElementConstructor<any>>;

/**
 * Check if icon exists
 */
export declare function iconExists(name: string): boolean;

/**
 * API config
 */
export declare interface IconifyAPIConfig extends RedundancyConfig {
    path: string;
    maxURL: number;
}

export declare interface IconifyAPICustomQueryParams {
    type: 'custom';
    provider?: string;
    uri: string;
}

/**
 * Iconify API functions
 */
export declare interface IconifyAPIFunctions {
    /**
     * Load icons
     */
    loadIcons: (icons: (IconifyIconName | string)[], callback?: IconifyIconLoaderCallback) => IconifyIconLoaderAbort;
    /**
     * Load one icon, using Promise syntax
     */
    loadIcon: (icon: IconifyIconName | string) => Promise<Required<IconifyIcon>>;
    /**
     * Add API provider
     */
    addAPIProvider: (provider: string, customConfig: PartialIconifyAPIConfig) => boolean;
}

/**
 * Params for sendQuery()
 */
declare interface IconifyAPIIconsQueryParams {
    type: 'icons';
    provider: string;
    prefix: string;
    icons: string[];
}

/**
 * Exposed internal functions
 *
 * Used by plug-ins, such as Icon Finder
 *
 * Important: any changes published in a release must be backwards compatible.
 */
export declare interface IconifyAPIInternalFunctions {
    /**
     * Get API config, used by custom modules
     */
    getAPIConfig: GetAPIConfig;
    /**
     * Set custom API module
     */
    setAPIModule: (provider: string, item: IconifyAPIModule) => void;
    /**
     * Send API query
     */
    sendAPIQuery: (target: string | PartialIconifyAPIConfig, query: IconifyAPIQueryParams, callback: QueryDoneCallback) => QueryAbortCallback;
    /**
     * Set and get fetch()
     */
    setFetch: (item: typeof fetch) => void;
    getFetch: () => typeof fetch | undefined;
    /**
     * List all API providers (from config)
     */
    listAPIProviders: () => string[];
}

/**
 * API modules
 */
export declare interface IconifyAPIModule {
    prepare: IconifyAPIPrepareIconsQuery;
    send: IconifyAPISendQuery;
}

/**
 * Functions to implement in module
 */
export declare type IconifyAPIPrepareIconsQuery = (provider: string, prefix: string, icons: string[]) => IconifyAPIIconsQueryParams[];

export declare type IconifyAPIQueryParams = IconifyAPIIconsQueryParams | IconifyAPICustomQueryParams;

export declare type IconifyAPISendQuery = (host: string, params: IconifyAPIQueryParams, callback: QueryModuleResponse) => void;

/**
 * Interface for exported functions
 */
export declare interface IconifyBrowserCacheFunctions {
    enableCache: (storage: IconifyBrowserCacheType) => void;
    disableCache: (storage: IconifyBrowserCacheType) => void;
}

/**
 * Cache types
 */
export declare type IconifyBrowserCacheType = BrowserStorageType | 'all';

/**
 * Interface for exported builder functions
 */
export declare interface IconifyBuilderFunctions {
    replaceIDs?: (body: string, prefix?: string | (() => string)) => string;
    calculateSize: (size: string | number, ratio: number, precision?: number) => string | number;
    buildIcon: (icon: IconifyIcon, customisations?: IconifyIconCustomisations_2) => IconifyIconBuildResult;
}

/**
 * React component properties: generic element for Icon component, SVG for generated component
 */
declare type IconifyElementProps = SVGProps<SVGSVGElement>;

export { IconifyIcon }

/**
 * Interface for getSVGData() result
 */
export declare interface IconifyIconBuildResult {
    attributes: {
        width?: string;
        height?: string;
        viewBox: string;
    };
    body: string;
}

/**
 * Icon customisations
 */
export declare type IconifyIconCustomisations = IconifyIconCustomisations_2 & {
    rotate?: string | number;
    inline?: boolean;
};

/**
 * Icon customisations
 */
declare interface IconifyIconCustomisations_2 extends IconifyTransformations, IconifyIconSizeCustomisations {
}

/**
 * Function to abort loading (usually just removes callback because loading is already in progress)
 */
export declare type IconifyIconLoaderAbort = () => void;

/**
 * Loader callback
 *
 * Provides list of icons that have been loaded
 */
export declare type IconifyIconLoaderCallback = (loaded: IconifyIconName[], missing: IconifyIconName[], pending: IconifyIconName[], unsubscribe: IconifyIconLoaderAbort) => void;

/**
 * Icon name
 */
export declare interface IconifyIconName {
    readonly provider: string;
    readonly prefix: string;
    readonly name: string;
}

/**
 * Callback for when icon has been loaded (only triggered for icons loaded from API)
 */
export declare type IconifyIconOnLoad = (name: string) => void;

/**
 * Icon properties
 */
export declare interface IconifyIconProps extends IconifyIconCustomisations {
    icon: IconifyIcon | string;
    mode?: IconifyRenderMode;
    color?: string;
    flip?: string;
    id?: string;
    onLoad?: IconifyIconOnLoad;
}

/**
 * Icon size
 */
export declare type IconifyIconSize = null | string | number;

/**
 * Dimensions
 */
declare interface IconifyIconSizeCustomisations {
    width?: IconifyIconSize;
    height?: IconifyIconSize;
}

export { IconifyJSON }

/**
 * Function to load icons
 */
declare type IconifyLoadIcons = (icons: (IconifyIconName | string)[], callback?: IconifyIconLoaderCallback) => IconifyIconLoaderAbort;

/**
 * Icon render mode
 *
 * 'style' = 'bg' or 'mask', depending on icon content
 * 'bg' = <span> with style using `background`
 * 'mask' = <span> with style using `mask`
 * 'svg' = <svg>
 */
export declare type IconifyRenderMode = 'style' | 'bg' | 'mask' | 'svg';

/**
 * Interface for exported storage functions
 */
export declare interface IconifyStorageFunctions {
    /**
     * Check if icon exists
     */
    iconExists: (name: string) => boolean;
    /**
     * Get icon data with all properties
     */
    getIcon: (name: string) => Required<IconifyIcon> | null;
    /**
     * List all available icons
     */
    listIcons: (provider?: string, prefix?: string) => string[];
    /**
     * Add icon to storage
     */
    addIcon: (name: string, data: IconifyIcon) => boolean;
    /**
     * Add icon set to storage
     */
    addCollection: (data: IconifyJSON, provider?: string) => boolean;
}

/**
 * Mix of icon properties and SVGSVGElement properties
 */
export declare type IconProps = IconifyElementProps & IconifyIconProps & ReactRefProp;

declare type IconRef = RefAttributes<SVGSVGElement>;

/**
 * Inline icon (has negative verticalAlign that makes it behave like icon font)
 *
 * @param props - Component properties
 */
export declare const InlineIcon: (props: IconProps) => React_2.ReactElement<IconProps, string | React_2.JSXElementConstructor<any>>;

/**
 * List available icons
 */
export declare function listIcons(provider?: string, prefix?: string): string[];

/**
 * Load one icon using Promise
 */
export declare const loadIcon: (icon: IconifyIconName | string) => Promise<Required<IconifyIcon>>;

/**
 * Load icons
 */
export declare const loadIcons: IconifyLoadIcons;

export declare type PartialIconifyAPIConfig = Partial<IconifyAPIConfig> & Pick<IconifyAPIConfig, 'resources'>;

/**
 * Callback for "abort" pending item.
 */
declare type QueryAbortCallback = () => void;

/**
 * Callback
 *
 * If error is present, something went wrong and data is undefined. If error is undefined, data is set.
 */
declare type QueryDoneCallback = (data?: QueryModuleResponseData, error?: QueryModuleResponseData) => void;

declare type QueryModuleResponse = (status: QueryModuleResponseType, data: QueryModuleResponseData) => void;

/**
 * Response from query module
 */
declare type QueryModuleResponseData = unknown;

/**
 * Response from query module
 */
declare type QueryModuleResponseType = 'success' | 'next' | 'abort';

declare interface ReactRefProp {
    ref?: IconRef;
}

/**
 * Configuration object
 */
declare interface RedundancyConfig {
    resources: RedundancyResource[];
    index: number;
    timeout: number;
    rotate: number;
    random: boolean;
    dataAfterTimeout: boolean;
}

/**
 * Resource to rotate (usually hostname or partial URL)
 */
declare type RedundancyResource = string;

/**
 * IDs usage:
 *
 * id="{id}"
 * xlink:href="#{id}"
 * url(#{id})
 *
 * From SVG animations:
 *
 * begin="0;{id}.end"
 * begin="{id}.end"
 * begin="{id}.click"
 */
/**
 * Replace IDs in SVG output with unique IDs
 */
export declare function replaceIDs(body: string, prefix?: string | ((id: string) => string)): string;

export { }
