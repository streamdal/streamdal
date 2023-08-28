type GlobResult = Record<string, () => Promise<any>>;
type CollectionToEntryMap = Record<string, GlobResult>;
export declare function createCollectionToGlobResultMap({ globResult, contentDir, }: {
    globResult: GlobResult;
    contentDir: string;
}): CollectionToEntryMap;
export declare function createGetCollection({ collectionToEntryMap, collectionToRenderEntryMap, }: {
    collectionToEntryMap: CollectionToEntryMap;
    collectionToRenderEntryMap: CollectionToEntryMap;
}): (collection: string, filter?: ((entry: any) => unknown) | undefined) => Promise<any[]>;
export declare function createGetEntryBySlug({ getCollection, collectionToRenderEntryMap, }: {
    getCollection: ReturnType<typeof createGetCollection>;
    collectionToRenderEntryMap: CollectionToEntryMap;
}): (collection: string, slug: string) => Promise<{
    id: any;
    slug: any;
    body: any;
    collection: any;
    data: any;
    render(): Promise<{
        Content: import("../runtime/server/index.js").AstroComponentFactory;
        headings: any;
        remarkPluginFrontmatter: any;
    }>;
} | undefined>;
export {};
