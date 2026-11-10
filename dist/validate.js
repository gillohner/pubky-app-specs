// Validation for forms: every issue of an input at once, through the builders' own path, so
// nothing here is a second copy of a rule. Each validator also implements Standard Schema
// (`~standard`), which react-hook-form, TanStack Form, tRPC and Hono take as they are.
import { ArgumentError, member, ValidationError } from "./errors.js";
import { snapshot } from "./input.js";
import { inputOf, string } from "./json/schema.js";
import * as feeds from "./models/feed.js";
import * as graph from "./models/graph.js";
import * as posts from "./models/post.js";
import * as users from "./models/user.js";
/** `links[0].title` or `input.links[0].title` as `["links", 0, "title"]`, and `input["x.y"]` as `["x.y"]`. */
function pathOf(field) {
    if (field === undefined)
        return [];
    const bare = field === "input" || field.startsWith("input.") || field.startsWith("input[") ? field.slice("input".length) : field;
    return [...bare.matchAll(/\[("(?:[^"\\]|\\.)*")\]|\[(\d+)\]|([^.[\]]+)/g)].map((m) => (m[1] !== undefined ? JSON.parse(m[1]) : m[2] !== undefined ? Number(m[2]) : m[3]));
}
// Structural, so a literal key `links.0.url` is not the member links[0].url
const key = (path) => JSON.stringify(path);
// More than a form shows; an input with more stops there, so a hostile one costs no more
const MAX_ISSUES = 100;
class Enough extends Error {
}
/**
 * Runs `build` collecting every refusal. A member whose shape was refused is built from a
 * stand-in so the other rules still run; what the rules then say about that member is dropped,
 * since the stand-in, not the caller, said it.
 */
function collect(input, build) {
    const shapes = [];
    const rules = [];
    // A post's references run twice, the second time with the ownership rule, so a refusal can repeat
    const said = new Set();
    const each = (rule) => {
        try {
            rule();
        }
        catch (e) {
            if (e instanceof ArgumentError)
                shapes.push({ path: pathOf(e.field), code: "invalid_type", message: e.message });
            else if (e instanceof ValidationError) {
                const issue = `${e.field}\n${e.reason}`;
                if (!said.has(issue))
                    rules.push({ path: pathOf(e.field), code: e.code, message: e.reason, ...(e.limit === undefined ? {} : { limit: e.limit }) });
                said.add(issue);
            }
            else
                throw e;
            if (shapes.length + rules.length >= MAX_ISSUES)
                throw new Enough();
        }
    };
    let value;
    try {
        // The input as a whole of the wrong shape leaves nothing to check further
        each(() => {
            value = snapshot(input, "input");
            build(value, each);
        });
    }
    catch (e) {
        if (!(e instanceof Enough))
            throw e;
    }
    const stood = new Set(shapes.map((issue) => key(issue.path)));
    const issues = [...shapes, ...rules.filter((issue) => !stood.has(key(issue.path)))];
    return issues.length === 0 ? { success: true, value: plain(value) } : { success: false, issues };
}
// The copy that was checked, with ordinary prototypes again, for the caller to keep
const plain = (value) => Array.isArray(value)
    ? value.map(plain)
    : typeof value === "object" && value !== null && !ArrayBuffer.isView(value)
        ? Object.fromEntries(Object.entries(value).map(([k, v]) => [k, plain(v)]))
        : value;
/**
 * Every issue of a profile input, as `buildUser` would refuse it.
 *
 * @example
 * ```ts
 * import { validateUser } from "pubky-social-specs";
 * const result = validateUser({ name: "", bio: "Hi" });
 * if (!result.success) for (const issue of result.issues) console.log(issue.path.join("."), issue.message);
 * ```
 */
export function validateUser(input) {
    return collect(input, (value, each) => void users.buildUser(null, value, each));
}
/**
 * Every issue of a post input, as `buildPost` would refuse it, without minting an id. With
 * `owner`, the rule that a private draft references only its owner's private objects runs too.
 *
 * @example
 * ```ts
 * import { validatePost } from "pubky-social-specs";
 * const owner = "8kkppkmiubfq4pxn6f73nqrhhhgkb5xyfprntc9si3np9ydbotto";
 * const result = validatePost({ kind: "article", title: "", body: "..." }, owner);
 * console.log(result.success ? "ok" : result.issues.map((i) => i.message));
 * ```
 */
export function validatePost(input, owner) {
    return collect(input, (value, each) => void posts.buildPost(owner ?? null, value, each, posts.unminted));
}
/**
 * Every issue of a feed input, as `buildFeed` would refuse it.
 *
 * @example
 * ```ts
 * import { validateFeed } from "pubky-social-specs";
 * const result = validateFeed({ name: "Rust", icon: "crab!", reach: "all", layout: "columns", sort: "recent" });
 * console.log(result.success);
 * ```
 */
export function validateFeed(input) {
    return collect(input, (value, each) => void feeds.buildFeed(null, value, each));
}
/**
 * Every issue of a tag, `{ uri, label }`, as `buildTag` would refuse it.
 *
 * @example
 * ```ts
 * import { validateTag } from "pubky-social-specs";
 * console.log(validateTag({ uri: "https://example.com", label: "no spaces" }));
 * ```
 */
export function validateTag(input) {
    return collect(input, (value, each) => {
        const given = inputOf(value, "input", ["uri", "label"], each);
        const uri = member(each, () => string.parse(given.uri, "input.uri"), null);
        const label = member(each, () => string.parse(given.label, "input.label"), null);
        if (uri !== null && label !== null)
            graph.buildTag(null, uri, label, each);
    });
}
/** A validator as a Standard Schema: what a form library takes. */
function schema(validate) {
    return {
        "~standard": {
            version: 1,
            vendor: "pubky-social-specs",
            validate: (input) => {
                const result = validate(input);
                return result.success ? { value: result.value } : { issues: result.issues };
            },
        },
    };
}
/**
 * `validateUser` as a Standard Schema.
 *
 * @example
 * ```ts
 * import { userSchema } from "pubky-social-specs";
 * const checked = userSchema["~standard"].validate({ name: "Alice" });
 * console.log(checked.issues === undefined);
 * ```
 */
export const userSchema = /* @__PURE__ */ schema(validateUser);
/**
 * `validatePost` as a Standard Schema, without an owner.
 *
 * @example
 * ```ts
 * import { postSchema } from "pubky-social-specs";
 * const checked = postSchema["~standard"].validate({ content: "" });
 * if (checked.issues) console.log(checked.issues[0]?.message);
 * ```
 */
export const postSchema = /* @__PURE__ */ schema((input) => validatePost(input));
/**
 * `validateFeed` as a Standard Schema.
 *
 * @example
 * ```ts
 * import { feedSchema } from "pubky-social-specs";
 * console.log(feedSchema["~standard"].vendor);
 * ```
 */
export const feedSchema = /* @__PURE__ */ schema(validateFeed);
/**
 * `validateTag` as a Standard Schema.
 *
 * @example
 * ```ts
 * import { tagSchema } from "pubky-social-specs";
 * console.log(tagSchema["~standard"].validate({ uri: "https://example.com", label: "rust" }));
 * ```
 */
export const tagSchema = /* @__PURE__ */ schema(validateTag);
//# sourceMappingURL=validate.js.map