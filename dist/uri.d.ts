import { type Located, type ObjectKind, type Root } from "./path.js";
export type Parsed = {
    owner: string;
} & Located;
/** Classifies a URI. Throws only when it is not a canonical pubky URI with a known root. */
export declare function parse(uri: string): Parsed;
/** Where an object of `kind` lives under `owner`. The owner key is checked, the id is spelled as given. */
export declare function build(owner: string, kind: ObjectKind, id: string): `pubky://${string}`;
/** `build`, and only for an id the parser reads back as that object: no other path comes out. */
export declare function buildChecked(owner: string, kind: ObjectKind, id: string): `pubky://${string}`;
/** The LIST prefix of a tree. Not a URI: the trailing slash is deliberate. */
export declare function listPrefix(owner: string, tree: Root | "legacy"): `pubky://${string}`;
//# sourceMappingURL=uri.d.ts.map