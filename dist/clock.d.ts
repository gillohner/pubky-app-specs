/** Microseconds since the epoch. */
export declare const nowMicros: () => bigint;
/** A clock in microseconds and a guard as given, so an answer depends on its request alone. */
export declare function pin(now: (() => bigint) | null, last?: bigint): void;
/** Strictly increasing: a burst runs a microsecond ahead per mint, a corrected clock is followed. */
export declare function mintFrom(now: bigint): bigint;
//# sourceMappingURL=clock.d.ts.map