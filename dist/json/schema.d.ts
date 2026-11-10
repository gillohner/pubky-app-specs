import { type Each } from "../errors.js";
import { type JsonObject, type Reader } from "./read.js";
export interface Codec<T> {
    read(r: Reader): T;
    write(value: T): string;
    /** The value as a caller holds it: plain data, integers as numbers. */
    plain(value: T): unknown;
    /** A caller's value, checked for its shape. `at` names it in the error. */
    parse(js: unknown, at: string): T;
    /** What an absent member reads as, when not an error. */
    absent?: () => T;
    /** Not written when null. */
    skipNull?: true;
}
export declare const string: Codec<string>;
/** A signed 64-bit integer: a bigint inside, so no digit is lost before it is checked. */
export declare const i64: Codec<bigint>;
export declare function option<T>(inner: Codec<T>): Codec<T | null>;
/** An optional member that is left out of the text when null. */
export declare const omitted: <T>(inner: Codec<T>) => Codec<T | null>;
/** A member that reads as `make()` when absent. */
export declare const defaulted: <T>(inner: Codec<T>, make: () => T) => Codec<T>;
export declare function list<T>(inner: Codec<T>): Codec<T[]>;
/** The members an object carries beyond the ones its type names, kept by value. */
export type Extra = {
    extra: JsonObject;
};
/** A codec per known member of `T`: a member left out or misspelled does not compile. */
type Fields<T extends Extra> = {
    [K in Exclude<keyof T, "extra">]-?: Codec<T[K]>;
};
/** An object that keeps the members it does not know, under `extra`. */
export declare function object<T extends Extra>(name: string, fields: Fields<T>): Codec<T>;
/** A caller's array, as the snapshot of `../input.ts` made it: dense and bounded. */
export declare function arrayOf(js: unknown, at: string): unknown[];
/** A caller's root: absent and null are the public one; another string is refused as the reference refuses it. */
export declare function rootOf(js: unknown, at: string): "public" | "private";
/** The members of a caller's input object, none of them outside `allowed`. */
export declare function inputOf(js: unknown, at: string, allowed: readonly string[], each?: Each): Record<string, unknown>;
/**
 * How a builder reads a caller's members under `each`: a member whose shape is refused reads
 * as `fallback`, so the rules after it still run. An absent optional member reads as null.
 */
export declare function inputReads(each: Each): {
    str: (js: unknown, at: string, fallback?: string) => string;
    opt: (js: unknown, at: string, fallback?: string | null) => string | null;
    items: <T>(js: unknown, at: string, item: (js: unknown, at: string) => T) => T[] | null;
};
export {};
//# sourceMappingURL=schema.d.ts.map