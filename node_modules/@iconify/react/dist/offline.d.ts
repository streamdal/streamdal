import type { IconifyIcon } from '@iconify/types';
import type { IconifyJSON } from '@iconify/types';
import { IconifyTransformations } from '@iconify/types';
import { default as React_2 } from 'react';
import type { RefAttributes } from 'react';
import type { SVGProps } from 'react';

/**
 * Add collection to storage, allowing to call icons by name
 *
 * @param data Icon set
 * @param prefix Optional prefix to add to icon names, true (default) if prefix from icon set should be used.
 */
export declare function addCollection(data: IconifyJSON, prefix?: string | boolean): void;

/**
 * Add icon to storage, allowing to call it by name
 *
 * @param name
 * @param data
 */
export declare function addIcon(name: string, data: IconifyIcon): void;

/**
 * Block icon
 *
 * @param props - Component properties
 */
export declare const Icon: (props: IconProps) => React_2.ReactElement<IconProps, string | React_2.JSXElementConstructor<any>>;

/**
 * React component properties: generic element for Icon component, SVG for generated component
 */
declare type IconifyElementProps = SVGProps<SVGSVGElement>;

export { IconifyIcon }

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
 * Callback for when icon has been loaded (only triggered for icons loaded from API)
 */
declare type IconifyIconOnLoad = (name: string) => void;

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
 * Icon render mode
 *
 * 'style' = 'bg' or 'mask', depending on icon content
 * 'bg' = <span> with style using `background`
 * 'mask' = <span> with style using `mask`
 * 'svg' = <svg>
 */
export declare type IconifyRenderMode = 'style' | 'bg' | 'mask' | 'svg';

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

declare interface ReactRefProp {
    ref?: IconRef;
}

export { }
