// The grammar of a path inside an owner's tree: what each canonical path names, and the one
// place a path is assembled. No URI parsing here, so the canonicalizers can build on it.
import { limits } from "./data.js";
import { hashIdFault, isPublicKey, timestampIdFault } from "./ids.js";
import { MEDIA_EXTENSIONS } from "./mime.js";
import { hasControlOrWhitespace } from "./text.js";
export const OBJECT_KINDS = Object.freeze(["user", "post", "follow", "mute", "bookmark", "tag", "file", "feed"]);
export const isObjectKind = (kind) => OBJECT_KINDS.includes(kind);
const isTimestampId = (id) => timestampIdFault(id) === null;
const isHashId = (id) => hashIdFault(id) === null;
const isEpoch = (segment) => /^v[0-9]+$/.test(segment);
/** The stem of a `.json` leaf, or null for any other leaf. */
export const jsonStem = (leaf) => (leaf.endsWith(".json") ? leaf.slice(0, -5) : null);
export function isSlug(slug) {
    return slug.length <= limits.postSlugMaxLength && /^[a-z0-9-]+$/.test(slug);
}
/** The id of a media filename: one rightmost extension stripped, only when it is a known one. */
export function mediaStem(filename) {
    const dot = filename.lastIndexOf(".");
    return dot >= 0 && MEDIA_EXTENSIONS.has(filename.slice(dot + 1)) ? filename.slice(0, dot) : null;
}
// 187 bytes of target are 250 characters of unpadded base64url
const BOOKMARK_ID_MAX = Math.ceil((limits.bookmarkTargetUriMaxBytes * 4) / 3);
/**
 * The form only: the round trip that recovers the target runs when the object is read. A leaf
 * starting with `_` is reserved in every directory, as the parser reads it.
 */
export function isBookmarkId(name) {
    if (name.startsWith("~"))
        return isHashId(name.slice(1));
    return !name.startsWith("_") && name.length <= BOOKMARK_ID_MAX && name.length % 4 !== 1 && /^[A-Za-z0-9_-]+$/.test(name);
}
/** The `{editId}[-{slug}].json` leaf of a post version, or null for any other leaf. */
export function versionOf(leaf) {
    const stem = jsonStem(leaf);
    if (stem === null)
        return null;
    const dash = stem.indexOf("-");
    const editId = dash < 0 ? stem : stem.slice(0, dash);
    if ((dash >= 0 && !isSlug(stem.slice(dash + 1))) || !isTimestampId(editId))
        return null;
    return dash < 0 ? { editId } : { editId, slug: stem.slice(dash + 1) };
}
// No time bound here: what a path names must not depend on the clock
function dispatch(root, rest) {
    const [segment, a, b] = rest;
    const unknown = { kind: "unknown" };
    if (rest.length === 1)
        return root === "public" && segment === "profile.json" ? { kind: "user" } : unknown;
    if (segment === "posts" && rest.length <= 3 && a !== undefined && isTimestampId(a)) {
        if (b === undefined)
            return { kind: "post", id: a };
        const version = versionOf(b);
        return version === null ? unknown : { kind: "post", id: a, ...version };
    }
    if (rest.length !== 2 || a === undefined)
        return unknown;
    if (segment === "files") {
        const stem = mediaStem(a);
        return stem !== null && isHashId(stem) ? { kind: "file", id: stem } : unknown;
    }
    const id = jsonStem(a);
    if (id === null)
        return unknown;
    if (segment === "feeds")
        return isHashId(id) ? { kind: "feed", id } : unknown;
    if (root === "public") {
        if (segment === "tags")
            return isHashId(id) ? { kind: "tag", id } : unknown;
        if (segment === "follows")
            return isPublicKey(id) ? { kind: "follow", id } : unknown;
    }
    else {
        if (segment === "mutes")
            return isPublicKey(id) ? { kind: "mute", id } : unknown;
        if (segment === "bookmarks")
            return isBookmarkId(id) ? { kind: "bookmark", id } : unknown;
    }
    return unknown;
}
/** What a canonical path names, or null for a root that is neither `pub` nor `priv`. */
export function parsePath(path) {
    if (path === null)
        return { root: "public", path: "", kind: "user" };
    const segments = path.split("/");
    const root = segments[0] === "pub" ? "public" : segments[0] === "priv" ? "private" : null;
    if (root === null)
        return null;
    const [, namespace, epoch] = segments;
    let resource;
    if (namespace === undefined)
        resource = { kind: "unknown" };
    else if (namespace !== "social") {
        // A namespace should carry an epoch as its second segment; named only when it has that shape
        const versioned = epoch !== undefined && isEpoch(epoch);
        resource = versioned ? { kind: "foreign", namespace, version: epoch, rest: segments.slice(3) } : { kind: "foreign", namespace, rest: segments.slice(2) };
    }
    else if (epoch === "v1")
        resource = dispatch(root, segments.slice(3));
    else if (epoch !== undefined && isEpoch(epoch))
        resource = { kind: "unsupportedVersion", version: epoch };
    else
        resource = { kind: "unknown" };
    return { root, path: `/${path}`, ...resource };
}
export const SEGMENT = { private: "priv", public: "pub" };
/** `/{root}/social/v1/{leaf}`, the one place a path is assembled. */
export function socialPath(root, leaf) {
    return `/${SEGMENT[root]}/social/v1/${leaf}`;
}
/** An owner-relative path under `pub` or `priv`, every segment canonical; a root alone is none. */
export function isOwnerPath(path) {
    const segments = path.slice(1).split("/");
    return path.startsWith("/") && segments.length >= 2 && segments.every(isCanonicalSegment) && parsePath(path.slice(1)) !== null;
}
export function isCanonicalSegment(segment) {
    return segment !== "" && segment !== "." && segment !== ".." && !/[/%?#]/.test(segment) && !hasControlOrWhitespace(segment);
}
/** Whether a path split off by `splitPubky` is under the private root. */
export const isPrivatePath = (path) => path === "priv" || path?.startsWith("priv/") === true;
/** A full `pubky://` URI split after its owner: the path without its leading `/`, null for none. */
export function splitPubky(uri) {
    if (!uri.startsWith("pubky://"))
        return null;
    const rest = uri.slice("pubky://".length);
    const slash = rest.indexOf("/");
    return slash < 0 ? { owner: rest, path: null } : { owner: rest.slice(0, slash), path: rest.slice(slash + 1) };
}
//# sourceMappingURL=path.js.map