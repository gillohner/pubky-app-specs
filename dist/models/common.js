// What every stored object shares: the size cap, the rules on members no version knows, and
// how a builder reads a caller's members.
import { fail, throwing, ValidationError } from "../errors.js";
import { JsonError, nestsTooDeep, Reader } from "../json/read.js";
import { compareBytes, utf8Len } from "../text.js";
const MAX_SAFE = 9007199254740991n;
/** Reads one whole document as `codec`, a refusal of the reader becoming the package's error. */
export function parse(codec, input, context = "", field) {
    const reader = new Reader(input);
    try {
        const value = codec.read(reader);
        reader.end();
        return value;
    }
    catch (e) {
        if (e instanceof JsonError)
            throw new ValidationError("json", `${context}${e.message}`, field, undefined, { cause: e });
        throw e;
    }
}
/** An integer past 2^53 would come back changed from any JS caller that reads and rewrites it. */
export function checkSafeInt(value, field, where = "") {
    if (value > MAX_SAFE || value < -MAX_SAFE)
        fail("unsafe_integer", `integer ${value} outside the JSON-safe range${where}`, field);
}
function checkSafeNumbers(value, field, where) {
    if (typeof value === "bigint")
        checkSafeInt(value, field, where);
    else if (Array.isArray(value))
        for (let i = 0; i < value.length; i++)
            checkSafeNumbers(value[i], field, where);
    // Sorted, so the member refused first is the one the reference names
    else if (value instanceof Map)
        for (const key of value.size < 2 ? value.keys() : [...value.keys()].sort(compareBytes))
            checkSafeNumbers(value.get(key), field, where);
}
/** The members no version knows: what a JS caller reads back has to be what was stored. `at` is the object they belong to. */
export function checkExtra(extra, at = "") {
    for (const key of [...extra.keys()].sort(compareBytes))
        checkSafeNumbers(extra.get(key), `${at}$unknown.${key}`, ` (in extra member ${key})`);
}
function checkSize(bytes, max) {
    if (bytes > max)
        fail("size", `object exceeds ${max} bytes`, undefined, max);
}
/** The cap on the written form first, then the rules, so no in-memory path skips the cap. */
export function validate(model, value, id, publicRoot, each = throwing) {
    const body = model.codec.write(value);
    // What decodeObject would refuse is never written; the reference refuses it as it reads it
    if (nestsTooDeep(body))
        fail("json", "recursion limit exceeded");
    each(() => checkSize(utf8Len(body), model.maxBytes));
    model.check(value, id, publicRoot, each);
    return body;
}
/**
 * Accepts the stored bytes as written or refuses them; a reader never rewrites. The cap holds
 * the bytes as stored, so defaults the reader fills in are not counted against it.
 */
export function readStored(model, bytes, id, publicRoot) {
    checkSize(bytes.length, model.maxBytes);
    const value = parse(model.codec, bytes);
    model.check(value, id, publicRoot, throwing);
    return value;
}
//# sourceMappingURL=common.js.map