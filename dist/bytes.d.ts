/**
 * A plain `Uint8Array` over the memory of a view of single bytes, or null; a detached one is
 * null. Shared memory is copied, so another thread cannot change the bytes between two reads.
 */
export declare function viewBytes(value: unknown): Uint8Array<ArrayBuffer> | null;
/** `viewBytes`, and an `ArrayBuffer` as the bytes it holds. */
export declare function plainBytes(value: unknown): Uint8Array<ArrayBuffer> | null;
//# sourceMappingURL=bytes.d.ts.map