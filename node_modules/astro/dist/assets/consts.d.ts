export declare const VIRTUAL_MODULE_ID = "astro:assets";
export declare const VIRTUAL_SERVICE_ID = "virtual:image-service";
/**
 * Valid formats for optimizations in our base services.
 * Certain formats can be imported (namely SVGs) but not optimized, so they are excluded from this list.
 */
export declare const VALID_INPUT_FORMATS: readonly ["jpeg", "jpg", "png", "tiff", "webp", "gif"];
export declare const VALID_OUTPUT_FORMATS: readonly ["avif", "png", "webp", "jpeg", "jpg"];
