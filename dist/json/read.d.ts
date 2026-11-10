/** A refusal of the reader. The message is the parser's own, with no position. */
export declare class JsonError extends Error {
}
/** An integer keeps its digits as a bigint; a number is a double the text spelled as one. */
export type Json = null | boolean | string | number | bigint | Json[] | JsonObject;
export type JsonObject = Map<string, Json>;
export declare class Reader {
    pos: number;
    readonly bytes: Uint8Array;
    private depth;
    constructor(input: Uint8Array | string);
    fail(message: string): never;
    private peek;
    /** The next byte that is not a space, tab, line feed or carriage return, left unread. */
    peekToken(): number | undefined;
    /** Nothing but whitespace may follow the one value of a document. */
    end(): void;
    ident(rest: string): void;
    /** Any value. `null`, `true` and `false` are read whole, so `nul` is an error here. */
    value(): Json;
    private open;
    private close;
    private next;
    private key;
    private colon;
    private readonly stack;
    private items;
    private members;
    /** An array, `element` reading each item. */
    array(element: () => void): void;
    /**
     * An object. `member` is given each key as it is read, before its colon, as the parser
     * judges a key; it returns what reads the value.
     */
    object(member: (key: string) => () => void): void;
    private hex;
    private byteOrEof;
    /** The text of a string whose opening quote is read. */
    string(): string;
    private unicodeEscape;
    /** A number whose sign is read: a bigint for an integer in 64 bits, else a double. */
    number(positive: boolean): bigint | number;
    /** The digits of a number, refused where the parser refuses them: the integer when the token is one that fits 64 bits, else null. */
    private scanNumber;
    /** Reads a run of digits; false when there was none. */
    private digits;
}
/** One document: a value and nothing after it. */
export declare function readJson(text: string): Json;
/**
 * Whether JSON text this package wrote nests deeper than the reader takes: a caller's `$unknown`
 * is read on its own, so only the whole document shows how deep it sits.
 */
export declare function nestsTooDeep(text: string): boolean;
//# sourceMappingURL=read.d.ts.map