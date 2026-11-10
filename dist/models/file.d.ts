import { type Root } from "../path.js";
/** Media is raw bytes with no JSON form: not empty, under the cap, named by its hash. Hashed only to compare with `id`. */
export declare function checkFile(bytes: Uint8Array, id: string | null): void;
/**
 * Where media goes, from its bytes or from an id hashed elsewhere. The declared type picks
 * the extension and is never stored.
 */
export declare function buildFile(owner: string, source: {
    bytes: Uint8Array;
} | {
    id: string;
}, declaredType: string, root: Root): {
    id: string;
    path: import("../path.js").OwnerPath;
};
//# sourceMappingURL=file.d.ts.map