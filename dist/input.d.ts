/**
 * A caller's value as plain data: arrays dense, with a hole read as absent; objects as records
 * with no prototype holding their own enumerable members; bytes as a plain `Uint8Array` over
 * the memory the intrinsic getters report. A shared object is copied once and stays shared.
 * Primitives and functions pass as they are; the rules refuse what is not data.
 */
export declare function snapshot(value: unknown, at: string): unknown;
//# sourceMappingURL=input.d.ts.map