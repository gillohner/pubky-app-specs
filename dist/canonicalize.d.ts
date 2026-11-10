/** The full form `pubky://<pk>[/<path>]` of either spelling, or null. */
export declare function canonicalPubky(raw: string): string | null;
/**
 * The stored form of a web reference is the trimmed raw string: no host folding and no
 * normalization, since an id hashes the exact text. Its host, past any userinfo and before any
 * port, must not be empty.
 */
export declare function canonicalWeb(raw: string): string | null;
/** Any other scheme: the scheme folds, the rest is opaque. */
export declare function canonicalExternal(raw: string): string | null;
/** Dispatch on the untrimmed string, so a pasted leading space defeats it on purpose. */
export declare function canonicalUniversal(raw: string): string | null;
type Schemes = "pubky" | "pubky or web" | "web" | "";
/**
 * The one reference gate: the canonical form under `schemes` and the cap, then for a pubky
 * value the root rule, the ownership rule and the versionless rule. Returns the canonical
 * form, or the fragment of the refusal that follows the field name.
 */
export declare function reference(uri: string, schemes: Schemes, max: number, publicRoot: boolean, owner: string | null): {
    canonical: string;
} | {
    refusal: string;
};
/** A stored reference is the fixed point of its canonical spelling. */
export declare function checkReference(field: string, uri: string, schemes: Schemes, max: number, publicRoot: boolean, owner: string | null): void;
export {};
//# sourceMappingURL=canonicalize.d.ts.map