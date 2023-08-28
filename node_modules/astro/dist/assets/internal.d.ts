import type { StaticBuildOptions } from '../core/build/types.js';
import { type ImageService } from './services/service.js';
import type { GetImageResult, ImageMetadata, ImageTransform } from './types.js';
export declare function isESMImportedImage(src: ImageMetadata | string): src is ImageMetadata;
export declare function getConfiguredImageService(): Promise<ImageService>;
/**
 * Get an optimized image and the necessary attributes to render it.
 *
 * **Example**
 * ```astro
 * ---
 * import { getImage } from 'astro:assets';
 * import originalImage from '../assets/image.png';
 *
 * const optimizedImage = await getImage({src: originalImage, width: 1280 });
 * ---
 * <img src={optimizedImage.src} {...optimizedImage.attributes} />
 * ```
 *
 * This is functionally equivalent to using the `<Image />` component, as the component calls this function internally.
 */
export declare function getImage(options: ImageTransform): Promise<GetImageResult>;
export declare function getStaticImageList(): Iterable<[
    string,
    {
        path: string;
        options: ImageTransform;
    }
]>;
interface GenerationData {
    weight: {
        before: number;
        after: number;
    };
}
export declare function generateImage(buildOpts: StaticBuildOptions, options: ImageTransform, filepath: string): Promise<GenerationData | undefined>;
export {};
