import { type Each } from "../errors.js";
import { type JsonObject } from "../json/read.js";
import type { Codec } from "../json/schema.js";
/** Reads one whole document as `codec`, a refusal of the reader becoming the package's error. */
export declare function parse<T>(codec: Codec<T>, input: Uint8Array | string, context?: string, field?: string): T;
/** An integer past 2^53 would come back changed from any JS caller that reads and rewrites it. */
export declare function checkSafeInt(value: bigint, field: string, where?: string): void;
/** The members no version knows: what a JS caller reads back has to be what was stored. `at` is the object they belong to. */
export declare function checkExtra(extra: JsonObject, at?: string): void;
/** A stored object: its codec, its cap and its rules. */
export interface Model<T> {
    codec: Codec<T>;
    maxBytes: number;
    /**
     * The rules beyond the shape. `id` is what the path names, null for a value not yet stored.
     * Each rule runs through `each`, in the reference's order.
     */
    check(value: T, id: string | null, publicRoot: boolean, each: Each): void;
}
/** The cap on the written form first, then the rules, so no in-memory path skips the cap. */
export declare function validate<T>(model: Model<T>, value: T, id: string | null, publicRoot: boolean, each?: Each): string;
/**
 * Accepts the stored bytes as written or refuses them; a reader never rewrites. The cap holds
 * the bytes as stored, so defaults the reader fills in are not counted against it.
 */
export declare function readStored<T>(model: Model<T>, bytes: Uint8Array, id: string | null, publicRoot: boolean): T;
//# sourceMappingURL=common.d.ts.map