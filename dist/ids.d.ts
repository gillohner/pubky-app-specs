export declare const ZBASE32 = "ybndrfg8ejkmcpqxot1uwisza345h769";
export declare const timestampIdFault: (id: string) => string | null;
export declare const hashIdFault: (id: string) => string | null;
export declare const isPublicKey: (key: string) => boolean;
export declare const checkHashId: (value: string, field?: string) => void;
export declare const checkPublicKey: (value: string, field?: string) => void;
/** The microseconds a canonical TimestampId spells. No time bound: that is the object's rule. */
export declare function timestampIdMicros(id: string, field?: string): bigint;
export declare function timestampId(micros: bigint): string;
/** The one content-addressed id: the first half of a blake3 digest. */
export declare const hashId: (data: Uint8Array) => string;
export declare const hashText: (text: string) => string;
/** A media id fed a chunk at a time, for bytes too large to hold twice or to hash in one go. */
export declare function createMediaHasher(): {
    update(chunk: Uint8Array): void;
    id(): string;
};
//# sourceMappingURL=ids.d.ts.map