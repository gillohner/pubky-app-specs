// Reading and writing what is stored at a URI: the path says which object, the object's own
// rules say whether these bytes are one.
import { fail, misuse, nameOf } from "./errors.js";
import { readStored, validate } from "./models/common.js";
import { feed } from "./models/feed.js";
import { checkFile } from "./models/file.js";
import { bookmark, follow, mute, tag } from "./models/graph.js";
import { checkReferences, checkVersion, post } from "./models/post.js";
import { user } from "./models/user.js";
import { utf8 } from "./text.js";
import { isObjectKind, OBJECT_KINDS } from "./path.js";
import { parse } from "./uri.js";
/** The model of each stored kind, typed by its own value: a model of another kind does not compile. */
const models = { user, post, follow, mute, bookmark, tag, feed };
/** The model of a kind known only at run time, its value type erased at this one place. */
export const modelOf = (kind) => models[kind];
// What a path names that is no stored object
function stored(parsed, uri) {
    switch (parsed.kind) {
        case "foreign":
            return fail("path", "a foreign namespace is not a social object");
        case "unsupportedVersion":
            return fail("path", "an unsupported epoch is a skip, not an object");
        case "unknown":
            return fail("path", "the path names no social object");
        case "user":
            // `pubky://<pk>` is a reference to the user; their profile is stored at a path
            if (parsed.path === "")
                fail("path", `a bare owner URL names a user, not a stored object: ${uri}`);
            return { kind: "user", id: "", editId: null };
        case "post":
            if (parsed.editId === undefined)
                fail("path", "a versionless post reference is never a stored object");
            return { kind: "post", id: parsed.id, editId: parsed.editId };
    }
    return { kind: parsed.kind, id: parsed.id, editId: null };
}
function located(uri) {
    const parsed = parse(uri);
    const { kind, id, editId } = stored(parsed, uri);
    // Field by field: spreading the result of stored() made a decode about 10 us slower in V8
    return { kind, id, editId, root: parsed.root, owner: parsed.owner };
}
/** Refuses a URI that names another kind than `kind`: the URL alone says what is stored there. */
export function checkNames(uri, kind) {
    const named = parse(uri).kind;
    if (named !== kind)
        fail("path", `${uri} names ${isObjectKind(named) ? `a ${named}` : "no stored object"}, not a ${kind}`, "uri");
}
/**
 * The object stored at `at`, its kind and its value; for media the value is the bytes. Without
 * a URI the bytes are read by the rules that need no id and no author.
 */
export function read(at, bytes) {
    const { kind, id, editId, root, owner } = typeof at === "string" ? located(at) : { kind: at.kind, id: null, editId: null, root: at.root, owner: null };
    if (kind === "file") {
        checkFile(bytes, id);
        return { kind, value: bytes };
    }
    const publicRoot = root === "public";
    const value = readStored(modelOf(kind), bytes, id, publicRoot);
    if (id !== null && editId !== null)
        checkVersion(id, editId);
    // The URI names the author, so the ownership rule can run here
    if (owner !== null && kind === "post")
        checkReferences(value, publicRoot, owner);
    return { kind, value };
}
/**
 * The bytes of a caller's object, checked as `read` checks them at `at`. Without a URI the
 * object is checked by the rules that need no id and no author.
 */
export function write(at, js) {
    const { kind, id, editId, root, owner } = typeof at === "string" ? located(at) : { kind: at.kind, id: null, editId: null, root: at.root, owner: null };
    const publicRoot = root === "public";
    if (kind === "file") {
        if (!(js instanceof Uint8Array))
            return misuse("object", "the bytes of the media");
        checkFile(js, id);
        return js;
    }
    nameOf(kind, "kind", OBJECT_KINDS);
    if (ArrayBuffer.isView(js))
        misuse("object", `the decoded ${kind}, not its bytes`);
    const model = modelOf(kind);
    const value = model.codec.parse(js, kind);
    const body = validate(model, value, id, publicRoot);
    if (id !== null && editId !== null)
        checkVersion(id, editId);
    if (owner !== null && kind === "post")
        checkReferences(value, publicRoot, owner);
    return utf8(body);
}
//# sourceMappingURL=objects.js.map