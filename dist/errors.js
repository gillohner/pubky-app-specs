const BRAND = Symbol.for("pubky-social-specs.ValidationError");
/** What the reference prefixes every refusal of its rules with. */
export const PREFIX = "Validation Error: ";
/**
 * A value the data model refuses. The message is the reference text, "Validation Error: "
 * included, where the reference has a rule for the value; a value only JavaScript can hold (a
 * lone surrogate, an integer past 2^53) and a function with no reference twin get the
 * package's own words after the same prefix. `reason` is the text without the prefix; `code` says which kind of rule, for a
 * program to act on. `field` names the member or argument refused (`content`,
 * `attachments[0].uri`, `owner`), absent when the refusal is about the object as a whole.
 * `limit` is the bound a `size`, `length` or `count` refusal broke. `instanceof` holds across
 * two copies of the package in one program.
 *
 * @example
 * ```ts
 * import { buildUser, ValidationError } from "pubky-social-specs";
 * const owner = "8kkppkmiubfq4pxn6f73nqrhhhgkb5xyfprntc9si3np9ydbotto";
 * try {
 *   buildUser(owner, { name: "Al" });
 * } catch (e) {
 *   if (e instanceof ValidationError) console.log(e.code, e.field, e.limit); // length name 3
 * }
 * ```
 */
export class ValidationError extends Error {
    /** `"ValidationError"`, as a stack trace and a log print it. */
    name = "ValidationError";
    /** Which kind of rule refused: a member of the closed `ErrorCode` set, stable across releases. */
    code;
    /** The reference text without the `Validation Error: ` prefix the `message` carries. */
    reason;
    /** The member or argument refused, as the input spells it: `content`, `attachments[0].uri`, `owner`. Absent when the whole object is refused. */
    field;
    /** The bound a `size` (bytes), `length` (code points) or `count` (items) refusal broke: the value in `limits`. */
    limit;
    [BRAND] = true;
    constructor(code, reason, field, limit, options) {
        super(PREFIX + reason, options);
        this.code = code;
        this.reason = reason;
        if (field !== undefined)
            this.field = field;
        if (limit !== undefined)
            this.limit = limit;
    }
    static [Symbol.hasInstance](value) {
        // Own, so a polluted prototype does not make every object one
        return typeof value === "object" && value !== null && Object.hasOwn(value, BRAND);
    }
}
Object.freeze(ValidationError);
Object.freeze(ValidationError.prototype);
export function fail(code, reason, field, limit) {
    throw new ValidationError(code, reason, field, limit);
}
/**
 * A caller's value of the wrong shape: a bug in the caller, not a rule of the data model.
 * `field` names the argument or member, as the message does.
 *
 * @example
 * ```ts
 * import { buildPost, ArgumentError } from "pubky-social-specs";
 * try {
 *   buildPost("8kkppkmiubfq4pxn6f73nqrhhhgkb5xyfprntc9si3np9ydbotto", { content: 1 } as never);
 * } catch (e) {
 *   if (e instanceof ArgumentError) console.log(e.field); // input.content
 * }
 * ```
 */
export class ArgumentError extends TypeError {
    /** `"ArgumentError"`, as a stack trace and a log print it. */
    name = "ArgumentError";
    /** The argument or member of the wrong shape, as the message names it: `input.attachments[0].uri`. */
    field;
    constructor(field, message) {
        super(message);
        this.field = field;
    }
}
Object.freeze(ArgumentError);
Object.freeze(ArgumentError.prototype);
export function misuse(what, expected) {
    throw new ArgumentError(what, `pubky-social-specs: ${what} must be ${expected}`);
}
/** Refuses `name` in serde's words for an enum of `names`, which is how the reference refuses one. */
export function unknownName(name, at, names) {
    const quoted = names.map((n) => `\`${n}\``);
    const expected = quoted.length === 2 ? `${quoted[0]} or ${quoted[1]}` : `one of ${quoted.join(", ")}`;
    return fail("unknown_name", `unknown variant \`${name}\`, expected ${expected}`, at);
}
/** A name a caller passes as an argument: one of `names`, another string refused, anything else a TypeError. */
export function nameOf(js, at, names) {
    if (typeof js !== "string")
        misuse(at, "a string");
    if (!names.includes(js))
        unknownName(js, at, names);
    return js;
}
export const throwing = (rule) => rule();
/** The field of a caller's key under `at`: dotted as JS spells it, quoted when the key is no identifier. */
export const fieldOf = (at, key) => (/^[A-Za-z_$][\w$]*$/.test(key) ? `${at}.${key}` : `${at}[${JSON.stringify(key)}]`);
/** A member parsed under `each`: what `parse` gives, or `fallback` when a collecting `each` kept its refusal. */
export function member(each, parse, fallback) {
    let out = fallback;
    each(() => {
        out = parse();
    });
    return out;
}
//# sourceMappingURL=errors.js.map