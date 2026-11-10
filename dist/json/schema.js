// How each type is read from stored text, written back, and passed to and from a caller.
//
// Reading follows the reference: a member is read where it stands in the text, so the first
// thing wrong in document order is the error, in the reference's words. A caller's value is
// another matter: it comes from typed code, so a wrong shape there is a TypeError.
import { fail, fieldOf, member, misuse, nameOf, throwing } from "../errors.js";
import { checkWellFormed, debugQuote } from "../text.js";
import { JsonError, readJson } from "./read.js";
import { writeFloat, writeJson, writeMembers, writeString } from "./write.js";
/** Refuses the value ahead as the wrong type, naming what it is. Reads it to name it. */
function invalidType(r, expected) {
    const b = r.peekToken();
    if (b === undefined)
        r.fail("EOF while parsing a value");
    let met;
    if (b === 0x5b)
        met = "sequence";
    else if (b === 0x7b)
        met = "map";
    else {
        const value = r.value();
        if (value === null)
            met = "null";
        else if (typeof value === "boolean")
            met = `boolean \`${value}\``;
        else if (typeof value === "string")
            met = `string ${debugQuote(value)}`;
        else if (typeof value === "bigint")
            met = `integer \`${value}\``;
        else
            met = `floating point \`${writeFloat(value)}\``;
    }
    return r.fail(`invalid type: ${met}, expected ${expected}`);
}
export const string = {
    read(r) {
        if (r.peekToken() !== 0x22)
            invalidType(r, "a string");
        r.pos++;
        return r.string();
    },
    write: writeString,
    plain: (value) => value,
    parse(js, at) {
        if (typeof js !== "string")
            misuse(at, "a string");
        return checkWellFormed(js);
    },
};
const I64_MAX = 0x7fffffffffffffffn;
/** A signed 64-bit integer: a bigint inside, so no digit is lost before it is checked. */
export const i64 = {
    read(r) {
        const b = r.peekToken();
        if (b === undefined)
            r.fail("EOF while parsing a value");
        if (b !== 0x2d && !(b >= 0x30 && b <= 0x39))
            invalidType(r, "i64");
        if (b === 0x2d)
            r.pos++;
        const n = r.number(b !== 0x2d);
        if (typeof n === "number")
            r.fail(`invalid type: floating point \`${writeFloat(n)}\`, expected i64`);
        if (n > I64_MAX)
            r.fail(`invalid value: integer \`${n}\`, expected i64`);
        return n;
    },
    write: (value) => value.toString(),
    // Every stored integer is checked to fit a double before it gets here
    plain: (value) => Number(value),
    parse(js, at) {
        if (typeof js !== "number" || !Number.isFinite(js))
            misuse(at, "an integer (a timestamp is microseconds since the epoch)");
        // A fraction is a number as the type asks, so it is refused as the stored text would be
        if (!Number.isInteger(js))
            fail("json", `invalid type: floating point \`${writeFloat(js)}\`, expected i64`, at);
        return BigInt(js);
    },
};
export function option(inner) {
    return {
        read(r) {
            if (r.peekToken() !== 0x6e)
                return inner.read(r);
            r.pos++;
            r.ident("ull");
            return null;
        },
        write: (value) => (value === null ? "null" : inner.write(value)),
        plain: (value) => (value === null ? null : inner.plain(value)),
        parse: (js, at) => (js === null || js === undefined ? null : inner.parse(js, at)),
        absent: () => null,
    };
}
/** An optional member that is left out of the text when null. */
export const omitted = (inner) => ({ ...option(inner), skipNull: true });
/** A member that reads as `make()` when absent. */
export const defaulted = (inner, make) => ({ ...inner, absent: make });
export function list(inner) {
    return {
        read(r) {
            if (r.peekToken() !== 0x5b)
                invalidType(r, "a sequence");
            const items = [];
            r.array(() => void items.push(inner.read(r)));
            return items;
        },
        write: (items) => `[${items.map((item) => inner.write(item)).join(",")}]`,
        plain: (items) => items.map((item) => inner.plain(item)),
        parse(js, at) {
            return arrayOf(js, at).map((item, index) => inner.parse(item, `${at}[${index}]`));
        },
    };
}
// A caller holds the unknown members as text it carries along and cannot respell: a number
// read into a JS value and written back would lose the difference between `1` and `1.0`
function unknownOf(js, at, known) {
    if (js === undefined)
        return new Map();
    const where = `${at}.$unknown`;
    const refuse = () => misuse(where, "the text it was read with");
    if (typeof js !== "string")
        refuse();
    checkWellFormed(js);
    let members;
    try {
        members = readJson(js);
    }
    catch (e) {
        if (e instanceof JsonError)
            refuse();
        throw e;
    }
    if (!(members instanceof Map))
        refuse();
    for (const key of known)
        if (members.has(key))
            misuse(where, `without the known member ${key}`);
    return members;
}
/** An object that keeps the members it does not know, under `extra`. */
export function object(name, fields) {
    const names = Object.keys(fields);
    // A Map, so no key reaches a prototype
    const codecs = new Map(Object.entries(fields));
    const absent = (codec, missing) => (codec.absent ? codec.absent() : missing());
    return {
        read(r) {
            if (r.peekToken() !== 0x7b)
                invalidType(r, `struct ${name}`);
            const out = {};
            const extra = new Map();
            r.object((key) => {
                const codec = codecs.get(key);
                if (!codec)
                    return () => void extra.set(key, r.value());
                // A known key seen twice is refused as it is read, before its colon
                if (Object.hasOwn(out, key))
                    r.fail(`duplicate field \`${key}\``);
                return () => void (out[key] = codec.read(r));
            });
            for (const [key, codec] of codecs) {
                if (!Object.hasOwn(out, key))
                    out[key] = absent(codec, () => r.fail(`missing field \`${key}\``));
            }
            out.extra = extra;
            return out;
        },
        write(value) {
            const known = [];
            for (const [key, codec] of codecs) {
                const member = value[key];
                if (!(codec.skipNull && member === null))
                    known.push(`${writeString(key)}:${codec.write(member)}`);
            }
            return `{${[...known, ...writeMembers(value.extra)].join(",")}}`;
        },
        plain(value) {
            const out = {};
            for (const [key, codec] of codecs)
                out[key] = codec.plain(value[key]);
            if (value.extra.size > 0)
                out.$unknown = writeJson(value.extra);
            return out;
        },
        parse(js, at) {
            if (typeof js !== "object" || js === null || Array.isArray(js))
                misuse(at, "an object");
            const given = js;
            for (const key of Object.keys(given)) {
                if (key !== "$unknown" && !codecs.has(key)) {
                    misuse(fieldOf(at, key), "a member of the stored object: pass the .object a builder or decodeObject returned (members this version does not know travel in its $unknown)");
                }
            }
            const out = {};
            for (const [key, codec] of codecs) {
                const member = given[key];
                out[key] = member === undefined ? absent(codec, () => misuse(`${at}.${key}`, "given")) : codec.parse(member, `${at}.${key}`);
            }
            out.extra = unknownOf(given.$unknown, at, names);
            return out;
        },
    };
}
/** A caller's array, as the snapshot of `../input.ts` made it: dense and bounded. */
export function arrayOf(js, at) {
    if (!Array.isArray(js))
        misuse(at, "an array");
    return js;
}
/** A caller's root: absent and null are the public one; another string is refused as the reference refuses it. */
export function rootOf(js, at) {
    if (js === undefined || js === null)
        return "public";
    const name = string.parse(js, at);
    return nameOf(name, at, ["public", "private"]);
}
/** The members of a caller's input object, none of them outside `allowed`. */
export function inputOf(js, at, allowed, each = throwing) {
    if (typeof js !== "object" || js === null || Array.isArray(js))
        misuse(at, "an object");
    const given = js;
    for (const key of Object.keys(given))
        if (!allowed.includes(key))
            each(() => misuse(fieldOf(at, key), `one of ${allowed.join(", ")}`));
    return given;
}
const isAbsent = (js) => js === null || js === undefined;
/**
 * How a builder reads a caller's members under `each`: a member whose shape is refused reads
 * as `fallback`, so the rules after it still run. An absent optional member reads as null.
 */
export function inputReads(each) {
    return {
        str: (js, at, fallback = "") => member(each, () => string.parse(js, at), fallback),
        opt: (js, at, fallback = null) => member(each, () => (isAbsent(js) ? null : string.parse(js, at)), fallback),
        // An item that is no object refuses the whole list, which then reads as null
        items: (js, at, item) => member(each, () => (isAbsent(js) ? null : arrayOf(js, at).map((entry, index) => item(entry, `${at}[${index}]`))), null),
    };
}
//# sourceMappingURL=schema.js.map