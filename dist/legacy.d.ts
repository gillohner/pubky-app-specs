/** The 0.x namespace, and where the 0.x tree kept everything, public only. */
export declare const LEGACY_NAMESPACE = "pubky.app";
export declare const LEGACY_ROOT = "/pub/pubky.app/";
/**
 * The key one object has under both epochs of a tree, from its owner-relative path:
 * `{key}`, or `{needsDeref}` for a legacy media reference that its 0.x File object
 * completes through `legacyMediaKey`, or null for a path that is no object.
 */
export declare function stableKey(ownerRelativePath: string): {
    key: string;
} | {
    needsDeref: string;
} | null;
/**
 * Completes a legacy media key from the `src` of a 0.x File object
 * (`pubky://<pk>/pub/pubky.app/blobs/<hash>`): `files/<hash>`, or null when the src is no
 * legacy blob reference.
 *
 * The 0.x reader accepted a src on a URL parser's terms, so this reads one the same way for
 * the one scheme it can carry: surrounding controls and spaces dropped, tabs and newlines
 * removed anywhere, the scheme in any case, userinfo and a port ignored, the path
 * percent-encoded and its dot segments resolved.
 */
export declare function legacyMediaKey(v0FileSrc: string): string | null;
//# sourceMappingURL=legacy.d.ts.map