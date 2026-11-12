import { nowMicros } from "../clock.js";
import { limits } from "../data.js";
import { fail, member, misuse, throwing } from "../errors.js";
import { checkHashId, checkPublicKey, hashText } from "../ids.js";
import { readJson } from "../json/read.js";
import { i64, inputOf, inputReads, list, object, omitted, option, string } from "../json/schema.js";
import { asciiFold, codePointLen, compareBytes, frozenTrim, utf8Len } from "../text.js";
import { socialPath } from "../path.js";
import { checkExtra, checkSafeInt, validate } from "./common.js";
import { checkLabel, foldLabel } from "./label.js";
import { feedLayout, feedLayouts, feedReach, feedReaches, feedSort, feedSorts, feedTarget, feedTargets, isKnown, known, postKind, postKinds, } from "./kinds.js";
/** The filter members in their stored order. */
const FILTER_NAMES = ["when", "from", "to", "near", "radius", "place", "category", "host", "key", "remote", "closed", "ingredients", "sort", "window", "rows"];
const FILTER_WHEN = ["today", "weekend", "week", "month", "past"];
const FILTER_SORTS = ["trending", "upcoming", "nearest"];
const FILTER_WINDOWS = ["24h", "7d", "30d"];
const FILTER_KEY_NAMESPACES = ["mbid", "wikidata", "isrc", "upc", "gtin", "isbn", "imdb", "podcast", "osm", "doi"];
const filterInvalid = (name) => fail("format", `Resource feed filter ${name} is not valid`, `filters.${name}`);
// A member's text over its cap: `length` in code points, `size` in bytes
const filterTooLong = (name, max, code) => fail(code, `Resource feed filter ${name} cannot be longer than ${max} ${code === "length" ? "characters" : "bytes"}`, `filters.${name}`, max);
// A day YYYY-MM-DD of the years 1000 to 9999 that exists in the calendar
function isFilterDay(day) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day);
    if (!m)
        return false;
    const [year, month, date] = [Number(m[1]), Number(m[2]), Number(m[3])];
    const leap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
    return year >= 1000 && days !== undefined && date >= 1 && date <= days;
}
// A coordinate as the builder spells it: an optional -, no leading zero, at most 5 decimals with no
// trailing zero, never a negative zero; within bound
function isFilterDegree(text, bound) {
    if (!/^-?(0|[1-9][0-9]{0,2})(\.[0-9]{0,4}[1-9])?$/.test(text))
        return false;
    const value = Math.abs(Number(text));
    return !(text.startsWith("-") && value === 0) && value <= bound;
}
const isFilterHost = (host) => host.length <= 253 && host.split(".").length >= 2 && host.split(".").every((label) => /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/.test(label));
// No control character and no comma, not empty; its length is checked on its own
const isFilterText = (text) => text !== "" && !/[\p{Cc},]/u.test(text);
// The rules of a stored set, in member order, the first broken one reported
function checkFilters(f) {
    if (f.extra.size > 0)
        fail("unknown_name", "A resources feed's filters hold a member this version does not know", "filters");
    if (FILTER_NAMES.every((name) => f[name] === null))
        fail("blank", "A resources feed's filters must not be empty; leave them out for none", "filters");
    const check = (ok, name) => {
        if (!ok)
            filterInvalid(name);
    };
    if (f.when !== null)
        check(FILTER_WHEN.includes(f.when), "when");
    if (f.from !== null)
        check(isFilterDay(f.from), "from");
    if (f.to !== null)
        check(isFilterDay(f.to), "to");
    if (f.when !== null && (f.from !== null || f.to !== null))
        fail("conflict", "Resource feed filters when and from or to cannot go together", "filters");
    if (f.from !== null && f.to !== null && compareBytes(f.from, f.to) > 0)
        fail("conflict", "Resource feed filter from is after to", "filters.from");
    if (f.near !== null) {
        const parts = f.near.split(",");
        check(parts.length === 2 && isFilterDegree(parts[0], 90) && isFilterDegree(parts[1], 180), "near");
    }
    if (f.radius !== null)
        check(/^[1-9][0-9]{0,2}$/.test(f.radius) && Number(f.radius) <= limits.feedFilterRadiusMaxKm, "radius");
    if (f.place !== null) {
        check(f.place !== "" && frozenTrim(f.place) === f.place && !/\p{Cc}/u.test(f.place), "place");
        if (codePointLen(f.place) > limits.feedFilterPlaceMaxLength)
            filterTooLong("place", limits.feedFilterPlaceMaxLength, "length");
    }
    if (f.near === null && (f.radius !== null || f.place !== null))
        fail("conflict", "Resource feed filters radius and place need near", "filters");
    if (f.category !== null) {
        check(isFilterText(f.category) && frozenTrim(f.category) === f.category && !f.category.startsWith("/"), "category");
        if (utf8Len(f.category) > limits.feedFilterTextMaxBytes)
            filterTooLong("category", limits.feedFilterTextMaxBytes, "size");
    }
    if (f.host !== null)
        check(isFilterHost(f.host), "host");
    if (f.key !== null) {
        const colon = f.key.indexOf(":");
        const value = f.key.slice(colon + 1);
        check(colon > 0 && FILTER_KEY_NAMESPACES.includes(f.key.slice(0, colon)) && isFilterText(value) && !value.includes(" "), "key");
        if (utf8Len(value) > limits.feedFilterTextMaxBytes)
            filterTooLong("key", limits.feedFilterTextMaxBytes, "size");
    }
    if (f.remote !== null)
        check(f.remote === "yes" || f.remote === "no", "remote");
    if (f.closed !== null)
        check(f.closed === "yes", "closed");
    if (f.ingredients !== null) {
        const items = f.ingredients.split(",");
        // At most 64 code points is at most 256 bytes: an ingredient has no byte cap of its own
        for (const item of items) {
            check(isFilterText(item) && frozenTrim(item) === item && !/[A-Z]/.test(item), "ingredients");
            const max = limits.feedFilterIngredientMaxLength;
            if (codePointLen(item) > max)
                fail("length", `Resource feed filter ingredients cannot be longer than ${max} characters each`, "filters.ingredients", max);
        }
        if (items.length > limits.feedFilterIngredientsMaxCount)
            fail("count", `A resources feed cannot filter by more than ${limits.feedFilterIngredientsMaxCount} ingredients`, "filters.ingredients", limits.feedFilterIngredientsMaxCount);
        for (let i = 1; i < items.length; i++)
            if (compareBytes(items[i - 1], items[i]) >= 0)
                fail("format", "Resource feed filter ingredients must be stored deduplicated and sorted by code point", "filters.ingredients");
    }
    if (f.sort !== null) {
        check(FILTER_SORTS.includes(f.sort), "sort");
        if (f.sort === "nearest" && f.near === null)
            fail("conflict", "Resource feed filter sort nearest needs near", "filters.sort");
    }
    if (f.window !== null) {
        check(FILTER_WINDOWS.includes(f.window), "window");
        if (f.sort !== "trending")
            fail("conflict", "Resource feed filter window needs sort trending", "filters.window");
    }
    if (f.rows !== null)
        check(f.rows === "links", "rows");
}
// The id input of the filters: the members that define the feed as one JSON object in their stored
// order, each value a JSON string; place left out
const filtersIdOf = (f) => `{${FILTER_NAMES.filter((name) => name !== "place" && f[name] !== null)
    .map((name) => `"${name}":${JSON.stringify(f[name])}`)
    .join(",")}}`;
function checkTagList(tags, field) {
    if (tags === null)
        return;
    if (tags.length === 0)
        fail("blank", `Feed config ${field} cannot be an empty list, omit it for no filter`, field);
    if (tags.length > limits.feedTagsMaxCount)
        fail("count", `Feed config cannot have more than ${limits.feedTagsMaxCount} ${field}`, field, limits.feedTagsMaxCount);
    for (const tag of tags) {
        if (tag !== foldLabel(tag))
            fail("format", `Tag '${tag}' must be stored folded (trimmed, ASCII lowercase)`, field);
        checkLabel(tag, field);
    }
    for (let i = 1; i < tags.length; i++) {
        if (compareBytes(tags[i - 1], tags[i]) >= 0) {
            fail("format", `Feed config ${field} must be stored deduplicated and sorted by code point`, field);
        }
    }
}
// Spelled as a schema.org type name: an ASCII capital letter or digit, then ASCII letters and
// digits. Only the spelling: which types exist is the index's business
const isResourceTypeName = (name) => /^[A-Z0-9][A-Za-z0-9]*$/.test(name);
// Past the cap a name is refused without quoting it: it can be as long as the object
const checkResourceTypeLength = (name) => {
    if (codePointLen(name) > limits.feedResourceTypeMaxLength)
        fail("length", `Feed resource type names cannot be longer than ${limits.feedResourceTypeMaxLength} characters`, "content", limits.feedResourceTypeMaxLength);
};
// A stored type list is what the builder writes: names, within the caps, strictly increasing
function checkResourceTypes(content) {
    const types = content.split(",");
    for (const name of types) {
        checkResourceTypeLength(name);
        if (!isResourceTypeName(name))
            fail("format", `Feed resource type '${name}' is not a schema.org type name`, "content");
    }
    if (types.length > limits.feedResourceTypesMaxCount)
        fail("count", `A resources feed cannot list more than ${limits.feedResourceTypesMaxCount} types`, "content", limits.feedResourceTypesMaxCount);
    for (let i = 1; i < types.length; i++) {
        if (compareBytes(types[i - 1], types[i]) >= 0)
            fail("format", "Feed resource types must be stored deduplicated and sorted by code point", "content");
    }
}
// A caller's list, comma-separated with no spaces, as the builder stores it: deduplicated and sorted
function resourceTypes(list) {
    const types = new Set();
    for (const name of list.split(",")) {
        checkResourceTypeLength(name);
        if (!isResourceTypeName(name))
            fail("format", `Invalid resource type: ${name}`, "content");
        types.add(name);
    }
    if (types.size > limits.feedResourceTypesMaxCount)
        fail("count", `A resources feed cannot list more than ${limits.feedResourceTypesMaxCount} types`, "content", limits.feedResourceTypesMaxCount);
    return [...types].sort(compareBytes).join(",");
}
function checkIcon(icon) {
    if (icon === null)
        return;
    const length = codePointLen(icon);
    if (length < 1 || length > limits.feedIconMaxLength)
        fail("length", `Feed icon '${icon}' must be 1 to ${limits.feedIconMaxLength} characters`, "icon", limits.feedIconMaxLength);
    for (const c of icon)
        if (!/^[a-z0-9-]$/.test(c))
            fail("format", `Feed icon '${icon}' contains invalid character: ${c}`, "icon");
}
// The id is the filter alone, so name and icon change without moving the feed. A target other
// than posts goes in front of the six segments: every older preimage starts with a reach, and
// no reach is a target's name, so no older feed shares an id with a new one
function idOf(value) {
    const f = value.feed;
    const joined = (tags) => tags?.join(",") ?? "";
    const filter = `${f.reach}:${f.layout}:${f.sort}:${f.content ?? ""}:${joined(f.tags)}:${joined(f.domain_tags)}`;
    // A resources feed's filters are a seventh segment: no segment of a valid one holds a ':'
    const filters = f.target === "resources" && f.filters !== null ? `:${filtersIdOf(f.filters)}` : "";
    return hashText(f.target === null || f.target === "posts" ? filter : `${f.target}:${filter}${filters}`);
}
const filtersCodec = object("PubkySocialFeedFilters", {
    when: omitted(string),
    from: omitted(string),
    to: omitted(string),
    near: omitted(string),
    radius: omitted(string),
    place: omitted(string),
    category: omitted(string),
    host: omitted(string),
    key: omitted(string),
    remote: omitted(string),
    closed: omitted(string),
    ingredients: omitted(string),
    sort: omitted(string),
    window: omitted(string),
    rows: omitted(string),
});
const config = object("PubkySocialFeedConfig", {
    tags: option(list(string)),
    domain_tags: omitted(list(string)),
    reach: feedReach,
    layout: feedLayout,
    sort: feedSort,
    content: option(postKind),
    target: omitted(feedTarget),
    filters: omitted(filtersCodec),
});
export const feed = {
    codec: object("PubkySocialFeed", { feed: config, name: string, icon: omitted(string), created_at: i64 }),
    maxBytes: limits.objectMaxBytes,
    check(value, id, _publicRoot, each) {
        const f = value.feed;
        // reach, layout, sort and target define the feed; an unknown post kind only means no filter, while a
        // resources feed's content is a list of schema.org type names
        each(() => {
            if (!isKnown(feedReaches, f.reach))
                fail("unknown_name", "feed reach is unknown", "reach");
        });
        each(() => {
            if (!isKnown(feedLayouts, f.layout))
                fail("unknown_name", "feed layout is unknown", "layout");
        });
        each(() => {
            if (!isKnown(feedSorts, f.sort))
                fail("unknown_name", "feed sort is unknown", "sort");
        });
        each(() => {
            if (f.target !== null && !isKnown(feedTargets, f.target))
                fail("unknown_name", "feed target is unknown", "target");
        });
        each(() => checkExtra(f.extra, "feed."));
        each(() => checkTagList(f.tags, "tags"));
        each(() => checkTagList(f.domain_tags, "domain_tags"));
        // An external resource has a schema.org type, not a post kind, and its links carry no domain tags
        each(() => {
            if (f.target === "resources" && f.content !== null)
                checkResourceTypes(f.content);
        });
        each(() => {
            if (f.target === "resources" && f.domain_tags !== null)
                fail("conflict", "A resources feed cannot filter by domain_tags", "domain_tags");
        });
        // Search filters are a resources feed's: a post feed has the post kind and tags only
        each(() => {
            if (f.filters === null)
                return;
            if (f.target !== "resources")
                fail("conflict", "Only a resources feed has filters", "filters");
            checkExtra(f.filters.extra, "feed.filters.");
            checkFilters(f.filters);
        });
        each(() => checkExtra(value.extra));
        each(() => {
            if (frozenTrim(value.name) === "")
                fail("blank", "Feed name cannot be empty", "name");
            if (codePointLen(value.name) > limits.feedNameMaxLength)
                fail("length", `Feed name exceeds maximum length of ${limits.feedNameMaxLength} characters`, "name", limits.feedNameMaxLength);
        });
        each(() => checkIcon(value.icon));
        each(() => checkSafeInt(value.created_at, "created_at"));
        if (id !== null)
            each(() => {
                checkHashId(id, "id");
                const expected = idOf(value);
                if (expected !== id)
                    fail("id", `Invalid ID: expected ${expected}, found ${id}`, "id");
            });
    },
};
/** The id of a feed object, so an edited feed finds its new path with its unknown members kept. */
/** Both addresses of the feed `id`: where its owner keeps it, and its published copy. */
export function feedPaths(id) {
    checkHashId(id, "id");
    return { private: socialPath("private", `feeds/${id}.json`), public: socialPath("public", `feeds/${id}.json`) };
}
export function feedId(value) {
    validate(feed, value, null, false);
    return idOf(value);
}
// A caller's filters as stored: every given member a string, the ingredients deduplicated and sorted,
// and null when none is set. A member this version does not know is kept, for the feed's rules to refuse
function filtersInput(js) {
    if (js === null || js === undefined)
        return null;
    if (typeof js !== "object" || Array.isArray(js))
        misuse("input.filters", "an object");
    const given = js;
    const out = { extra: new Map() };
    for (const name of FILTER_NAMES)
        out[name] = given[name] === undefined || given[name] === null ? null : string.parse(given[name], `input.filters.${name}`);
    for (const key of Object.keys(given)) {
        if (FILTER_NAMES.includes(key) || given[key] === undefined)
            continue;
        let text;
        try {
            text = JSON.stringify(given[key]);
        }
        catch {
            text = undefined;
        }
        if (text === undefined)
            misuse(`input.filters.${key}`, "a JSON value");
        out.extra.set(key, readJson(text));
    }
    if (out.ingredients !== null)
        out.ingredients = [...new Set(out.ingredients.split(","))].sort(compareBytes).join(",");
    return FILTER_NAMES.every((name) => out[name] === null) && out.extra.size === 0 ? null : out;
}
function filter(tags, field) {
    if (tags === null)
        return null;
    if (tags.length === 0)
        fail("blank", `${field} must not be an empty list; leave it out for no filter`, field);
    if (tags.some((tag) => foldLabel(tag) === ""))
        fail("blank", `${field} must not contain a blank label`, field);
    return [...new Set(tags.map(foldLabel))].sort(compareBytes);
}
/** A feed at its private path. The builder folds and sorts the filter, trims the name and stores no `target` for posts. */
export function buildFeed(owner, input, each = throwing) {
    if (owner !== null)
        checkPublicKey(owner);
    const { str, opt, items } = inputReads(each);
    const i = inputOf(input, "input", ["tags", "domain_tags", "reach", "layout", "sort", "content", "target", "filters", "name", "icon"], each);
    const tag = (js, at) => string.parse(js, at);
    const givenTags = items(i.tags, "input.tags", tag);
    const givenDomainTags = items(i.domain_tags, "input.domain_tags", tag);
    const name = str(i.name, "input.name");
    const icon = str(i.icon, "input.icon");
    // Every member's shape before any name is judged: the reference reads the whole input first
    const contentName = opt(i.content, "input.content", "note");
    const reachName = str(i.reach, "input.reach", "all");
    const layoutName = str(i.layout, "input.layout", "columns");
    const sortName = str(i.sort, "input.sort", "recent");
    const targetName = opt(i.target, "input.target", "posts");
    // A resources feed names schema.org types where a post feed names a post kind
    const content = contentName === null ? null : member(each, () => (targetName === "resources" ? resourceTypes(contentName) : known(postKinds, "content kind", contentName, "content")), null);
    const reach = member(each, () => known(feedReaches, "feed reach", reachName, "reach"), "all");
    const layout = member(each, () => known(feedLayouts, "feed layout", layoutName, "layout"), "columns");
    const sort = member(each, () => known(feedSorts, "feed sort", sortName, "sort"), "recent");
    const target = targetName === null ? null : member(each, () => known(feedTargets, "feed target", targetName, "target"), null);
    const filters = member(each, () => filtersInput(i.filters), null);
    const tags = member(each, () => filter(givenTags, "tags"), null);
    const domainTags = member(each, () => filter(givenDomainTags, "domain_tags"), null);
    // The config is checked as the builder makes it, before the feed's own rules run it again:
    // the reference builds the config first, so its refusal is the first one
    each(() => checkTagList(tags, "tags"));
    each(() => checkTagList(domainTags, "domain_tags"));
    const value = {
        feed: { tags, domain_tags: domainTags, reach, layout, sort, content, target: target === "posts" ? null : target, filters, extra: new Map() },
        name: frozenTrim(name),
        icon: asciiFold(frozenTrim(icon)),
        created_at: nowMicros(),
        extra: new Map(),
    };
    const body = validate(feed, value, null, false, each);
    const id = idOf(value);
    return { id, path: socialPath("private", `feeds/${id}.json`), value, body };
}
//# sourceMappingURL=feed.js.map