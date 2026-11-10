// Follows, mutes, tags and bookmarks: one small object each, named by what it points at.
import * as base64url from "../base64url.js";
import { checkReference, reference } from "../canonicalize.js";
import { nowMicros } from "../clock.js";
import { limits } from "../data.js";
import { fail, throwing } from "../errors.js";
import { checkPublicKey, hashText } from "../ids.js";
import { i64, object, omitted, string } from "../json/schema.js";
import { utf8, utf8Len, utf8Text } from "../text.js";
import { socialPath } from "../path.js";
import { checkExtra, checkSafeInt, validate } from "./common.js";
import { checkLabel, foldLabel } from "./label.js";
function edge(name) {
    return {
        codec: object(name, { created_at: i64 }),
        maxBytes: limits.objectMaxBytes,
        check(value, id, _publicRoot, each) {
            if (id !== null)
                each(() => checkPublicKey(id));
            each(() => checkExtra(value.extra));
            each(() => checkSafeInt(value.created_at, "created_at"));
        },
    };
}
export const follow = edge("PubkySocialFollow");
export const mute = edge("PubkySocialMute");
function buildEdge(model, root, segment, owner, target) {
    checkPublicKey(owner);
    const value = { created_at: nowMicros(), extra: new Map() };
    const body = validate(model, value, target, root === "public");
    return { id: target, path: socialPath(root, `${segment}/${target}.json`), value, body };
}
export const buildFollow = (owner, followee) => buildEdge(follow, "public", "follows", owner, followee);
export const buildMute = (owner, mutee) => buildEdge(mute, "private", "mutes", owner, mutee);
const tagId = (value) => hashText(`${value.uri}:${value.label}`);
export const tag = {
    codec: object("PubkySocialTag", { uri: string, label: string, created_at: i64 }),
    maxBytes: limits.objectMaxBytes,
    check(value, id, _publicRoot, each) {
        if (id !== null)
            each(() => {
                const expected = tagId(value);
                if (expected !== id)
                    fail("id", `Invalid ID: expected ${expected}, found ${id}`, "id");
            });
        each(() => checkExtra(value.extra));
        each(() => {
            if (value.label !== foldLabel(value.label))
                fail("format", `Tag '${value.label}' must be stored folded (trimmed, ASCII lowercase)`, "label");
            checkLabel(value.label);
        });
        // A tag is public, so a private target fails the root rule under any root
        each(() => checkReference("uri", value.uri, "", limits.referenceUriMaxLength, true, null));
        each(() => checkSafeInt(value.created_at, "created_at"));
    },
};
export function buildTag(owner, uri, label, each = throwing) {
    if (owner !== null)
        checkPublicKey(owner);
    const value = { uri, label: foldLabel(label), created_at: nowMicros(), extra: new Map() };
    const id = tagId(value);
    return { id, path: socialPath("public", `tags/${id}.json`), value, body: validate(tag, value, id, true, each) };
}
const TARGET = "bookmark target";
const PRIMARY_MAX = limits.bookmarkTargetUriMaxBytes;
function canonicalTarget(target) {
    const result = reference(target, "", limits.referenceUriMaxLength, true, null);
    return "canonical" in result ? result.canonical : fail("reference", `${TARGET} ${result.refusal}`, "target");
}
const checkTarget = (target) => checkReference(TARGET, target, "", limits.referenceUriMaxLength, true, null);
/** The id carries the target; one too long for a path segment goes by its hash. */
const bookmarkId = (canonical) => (utf8Len(canonical) <= PRIMARY_MAX ? base64url.encode(utf8(canonical)) : `~${hashText(canonical)}`);
function checkStoredTarget(target) {
    checkTarget(target);
    if (utf8Len(target) <= PRIMARY_MAX)
        fail("conflict", `a target of ${utf8Len(target)} bytes belongs in the primary bookmark form`, "target");
}
/** The target a stored bookmark names. The content is needed only for the `~` form. */
export function targetOf(id, content) {
    if (id.startsWith("~")) {
        if (content.target === null)
            fail("conflict", "an overflow bookmark requires target in the content", "target");
        checkStoredTarget(content.target);
        if (id.slice(1) !== hashText(content.target))
            fail("id", `bookmark filename does not hash its target: ${content.target}`, "id");
        return content.target;
    }
    if (content.target !== null)
        fail("conflict", "a primary bookmark carries its target in the filename, not in the content", "target");
    const bytes = base64url.decode(id);
    if (bytes === null)
        fail("format", `bookmark filename is not canonical base64url: ${id}`, "id");
    const target = utf8Text(bytes);
    if (target === null)
        fail("format", `bookmark filename is not UTF-8: ${id}`, "id");
    checkTarget(target);
    // Without the bound one target has a primary spelling and an overflow one
    if (bytes.length > PRIMARY_MAX)
        fail("conflict", `a target over ${PRIMARY_MAX} bytes belongs in the overflow bookmark form`, "target");
    return target;
}
export const bookmark = {
    codec: object("PubkySocialBookmark", { created_at: i64, target: omitted(string) }),
    maxBytes: limits.objectMaxBytes,
    check(value, id, _publicRoot, each) {
        each(() => checkExtra(value.extra));
        each(() => checkSafeInt(value.created_at, "created_at"));
        each(() => {
            if (id !== null)
                targetOf(id, value);
            else if (value.target !== null)
                checkStoredTarget(value.target);
        });
    },
};
export function buildBookmark(owner, target) {
    checkPublicKey(owner);
    const canonical = canonicalTarget(target);
    const id = bookmarkId(canonical);
    const value = { created_at: nowMicros(), target: id.startsWith("~") ? canonical : null, extra: new Map() };
    return { id, path: socialPath("private", `bookmarks/${id}.json`), value, body: validate(bookmark, value, id, false) };
}
//# sourceMappingURL=graph.js.map