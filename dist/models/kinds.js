// The closed name sets. A stored name this version does not know is kept as it was read, so a
// reader survives a newer writer and writes its name back; a builder takes only the names it
// knows.
import { fail } from "../errors.js";
import { string } from "../json/schema.js";
/**
 * The post kinds this version knows: `note` (the default), `article` and `collection`, whose content is an envelope, and `image`, `video`, `link` and `file`, hints for how to show the text.
 *
 * @example
 * ```ts
 * import { postKinds } from "pubky-social-specs";
 * console.log(postKinds.includes("article"));
 * ```
 */
export const postKinds = Object.freeze(["note", "article", "image", "video", "link", "file", "collection"]);
/**
 * Whose posts a feed shows: `following` and `followers` of the owner, mutual `friends`, `all`, the owner's `wot` (web of trust) and `me`.
 *
 * @example
 * ```ts
 * import { feedReaches } from "pubky-social-specs";
 * for (const reach of feedReaches) console.log(reach);
 * ```
 */
export const feedReaches = Object.freeze(["following", "followers", "friends", "all", "wot", "me"]);
/**
 * How a client lays a feed out: `columns`, `wide`, `visual` (media first), `list` and `cards`.
 *
 * @example
 * ```ts
 * import { feedLayouts } from "pubky-social-specs";
 * console.log(feedLayouts.join(", "));
 * ```
 */
export const feedLayouts = Object.freeze(["columns", "wide", "visual", "list", "cards"]);
/**
 * The orders of a feed: `recent` and `popularity`.
 *
 * @example
 * ```ts
 * import { feedSorts } from "pubky-social-specs";
 * console.log(feedSorts.join(", "));
 * ```
 */
export const feedSorts = Object.freeze(["recent", "popularity"]);
/**
 * What a feed lists: `posts`, the default, stored as no member, and `resources`, the external links people tag.
 *
 * @example
 * ```ts
 * import { feedTargets } from "pubky-social-specs";
 * console.log(feedTargets.join(", "));
 * ```
 */
export const feedTargets = Object.freeze(["posts", "resources"]);
/**
 * The kinds of external resource a feed of `resources` may list instead of every kind, in its `content`: `music`, `video`, `podcast`, `place`, `event`, `book`, `article` and `software`.
 *
 * @example
 * ```ts
 * import { resourceFamilies } from "pubky-social-specs";
 * console.log(resourceFamilies.includes("music"));
 * ```
 */
export const resourceFamilies = Object.freeze(["music", "video", "podcast", "place", "event", "book", "article", "software"]);
/**
 * How a creator would show a collection: `grid`, `list` and `visual`. A reader may choose its own.
 *
 * @example
 * ```ts
 * import { collectionLayouts } from "pubky-social-specs";
 * console.log(collectionLayouts.join(", "));
 * ```
 */
export const collectionLayouts = Object.freeze(["grid", "list", "visual"]);
/**
 * The schema.org types each resource family stands for: a resource is of the family when its type is one of these or a subtype of one.
 *
 * @example
 * ```ts
 * import { resourceFamilyRootTypes } from "pubky-social-specs";
 * console.log(resourceFamilyRootTypes.music.join(","));
 * ```
 */
export const resourceFamilyRootTypes = Object.freeze({
    music: Object.freeze(["MusicRecording", "MusicPlaylist", "MusicGroup"]),
    video: Object.freeze(["VideoObject", "Movie", "TVSeries"]),
    podcast: Object.freeze(["PodcastSeries", "PodcastEpisode"]),
    place: Object.freeze(["Place"]),
    event: Object.freeze(["Event"]),
    book: Object.freeze(["Book"]),
    article: Object.freeze(["Article"]),
    software: Object.freeze(["SoftwareApplication", "SoftwareSourceCode"]),
});
// A name is read and written as a string; the model's rules decide whether one this version
// does not know is valid where it stands
export const postKind = string;
export const feedReach = string;
export const feedLayout = string;
export const feedSort = string;
export const feedTarget = string;
export const collectionLayout = string;
/** Whether `name` is one of `names`, not one a newer writer used. */
export const isKnown = (names, name) => names.includes(name);
/** A name a builder was given at `input.{field}`: one of `names`, or a refusal naming `what`. */
export function known(names, what, name, field) {
    return isKnown(names, name) ? name : fail("unknown_name", `Invalid ${what}: ${name}`, field);
}
//# sourceMappingURL=kinds.js.map