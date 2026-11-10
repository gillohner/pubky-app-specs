/** A storage root: `"public"` (`/pub/`, world-readable) or `"private"` (`/priv/`, read by the owner and the apps they grant it). */
export type Root = "public" | "private";
/** An owner-relative path: what the SDK's storage calls and every plan take. */
export type OwnerPath = `/pub/${string}` | `/priv/${string}`;
export declare const OBJECT_KINDS: readonly ["user", "post", "follow", "mute", "bookmark", "tag", "file", "feed"];
/** A kind of stored object: what a URL names and what `decodeObject`, `buildUri` and `deletionPaths` take. */
export type ObjectKind = (typeof OBJECT_KINDS)[number];
export declare const isObjectKind: (kind: string) => kind is ObjectKind;
type Resource = {
    kind: "user";
} | {
    kind: "post";
    id: string;
    editId?: string;
    slug?: string;
} | {
    kind: "follow" | "mute" | "bookmark" | "tag" | "file" | "feed";
    id: string;
} | {
    kind: "foreign";
    namespace: string;
    version?: string;
    rest: string[];
} | {
    kind: "unsupportedVersion";
    version: string;
} | {
    kind: "unknown";
};
export type Located = {
    root: Root;
    path: OwnerPath | "";
} & Resource;
/** The stem of a `.json` leaf, or null for any other leaf. */
export declare const jsonStem: (leaf: string) => string | null;
export declare function isSlug(slug: string): boolean;
/** The id of a media filename: one rightmost extension stripped, only when it is a known one. */
export declare function mediaStem(filename: string): string | null;
/**
 * The form only: the round trip that recovers the target runs when the object is read. A leaf
 * starting with `_` is reserved in every directory, as the parser reads it.
 */
export declare function isBookmarkId(name: string): boolean;
/** The `{editId}[-{slug}].json` leaf of a post version, or null for any other leaf. */
export declare function versionOf(leaf: string): {
    editId: string;
    slug?: string;
} | null;
/** What a canonical path names, or null for a root that is neither `pub` nor `priv`. */
export declare function parsePath(path: string | null): Located | null;
export declare const SEGMENT: {
    readonly private: "priv";
    readonly public: "pub";
};
/** `/{root}/social/v1/{leaf}`, the one place a path is assembled. */
export declare function socialPath(root: Root, leaf: string): OwnerPath;
/** An owner-relative path under `pub` or `priv`, every segment canonical; a root alone is none. */
export declare function isOwnerPath(path: string): boolean;
export declare function isCanonicalSegment(segment: string): boolean;
/** Whether a path split off by `splitPubky` is under the private root. */
export declare const isPrivatePath: (path: string | null) => boolean;
/** A full `pubky://` URI split after its owner: the path without its leading `/`, null for none. */
export declare function splitPubky(uri: string): {
    owner: string;
    path: string | null;
} | null;
export {};
//# sourceMappingURL=path.d.ts.map