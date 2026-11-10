import type { Json, JsonObject } from "./read.js";
/** Only the quote, the backslash and the C0 controls are escaped. */
export declare function writeString(s: string): string;
/**
 * A double as the reference spells it: the shortest digits that read back to it, as a plain
 * decimal with at least one fraction digit from 1e-5 up to 1e16, in exponent form outside.
 */
export declare function writeFloat(f: number): string;
/** A value with every object's members sorted, as an unknown member of an object is kept. */
export declare function writeJson(value: Json): string;
/** The members of an object, sorted by the bytes of their keys. */
export declare function writeMembers(members: JsonObject): string[];
//# sourceMappingURL=write.d.ts.map