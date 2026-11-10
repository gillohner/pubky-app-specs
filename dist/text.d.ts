export declare const utf8: (s: string) => Uint8Array<ArrayBuffer>;
/** The text of `bytes`, or null when they are not UTF-8. A leading BOM is text like any other. */
export declare function utf8Text(bytes: Uint8Array): string | null;
/**
 * `s` without the leading and trailing characters `strip` accepts. A loop and not
 * `/^x+|x+$/`: that pattern retries from every character of a long inner run, which is
 * quadratic on text a caller controls.
 */
export declare function trimWhere(s: string, strip: (unit: number) => boolean): string;
/** Not `String.prototype.trim`, whose set follows the engine's Unicode version. */
export declare const frozenTrim: (s: string) => string;
export declare const hasFrozenWhitespace: (s: string) => boolean;
/** An ASCII control (U+0000 to U+001F, U+007F) or a frozen whitespace anywhere. */
export declare const hasControlOrWhitespace: (s: string) => boolean;
export declare const trimmedOrNull: (s: string | null) => string | null;
/** A to Z only: `toLowerCase` folds far more and differently per engine version. */
export declare const asciiFold: (s: string) => string;
export declare function codePointLen(s: string): number;
/** Counted, not encoded: this runs on every object for its size cap. */
export declare function utf8Len(s: string): number;
/** By UTF-8 bytes, which is code point order and not the engine's UTF-16 order. */
export declare function compareBytes(a: string, b: string): number;
/** `s`, when it is well-formed: a Rust string cannot hold a lone surrogate, so no rule of the model has an answer for one. */
export declare function checkWellFormed(s: string, field?: string): string;
/** Text as the reference quotes it inside a type error: Rust's `{:?}` of a string. */
export declare function debugQuote(s: string): string;
//# sourceMappingURL=text.d.ts.map