import { type Model } from "./models/common.js";
import { type ObjectKind, type Root } from "./path.js";
/** The model of a kind known only at run time, its value type erased at this one place. */
export declare const modelOf: (kind: Exclude<ObjectKind, "file">) => Model<unknown>;
type Bytes = Uint8Array<ArrayBuffer>;
/** Refuses a URI that names another kind than `kind`: the URL alone says what is stored there. */
export declare function checkNames(uri: string, kind: ObjectKind): void;
/**
 * The object stored at `at`, its kind and its value; for media the value is the bytes. Without
 * a URI the bytes are read by the rules that need no id and no author.
 */
export declare function read(at: string | {
    kind: ObjectKind;
    root: Root;
}, bytes: Uint8Array): {
    kind: ObjectKind;
    value: unknown;
};
/**
 * The bytes of a caller's object, checked as `read` checks them at `at`. Without a URI the
 * object is checked by the rules that need no id and no author.
 */
export declare function write(at: string | {
    kind: ObjectKind;
    root: Root;
}, js: unknown): Bytes;
export {};
//# sourceMappingURL=objects.d.ts.map