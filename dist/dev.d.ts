/** Notes what the latest decode at `url` carried beyond the known members. */
export declare function rememberUnknown(url: string, object: unknown): void;
/** Warns when `object`, written for what was read at `url`, carries fewer of those members. */
export declare function warnIfUnknownDropped(url: string, object: unknown, call: string): void;
/** Warns when the `created_at` of `object` reads as milliseconds, what `Date.now()` gives. */
export declare function warnIfMilliseconds(object: unknown, call: string): void;
//# sourceMappingURL=dev.d.ts.map