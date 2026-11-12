import { type Each } from "../errors.js";
import { type Extra } from "../json/schema.js";
import { type OwnerPath } from "../path.js";
import { type Model } from "./common.js";
import { type FeedLayout, type FeedReach, type FeedSort, type FeedTarget, type PostKind } from "./kinds.js";
export interface FeedConfig extends Extra {
    /** The tag labels a post must carry: at most 5, folded, deduplicated and sorted by code point; null for no tag filter. */
    tags: string[] | null;
    /** The domain labels a post's links must carry, with the rules of `tags`; null for no domain filter. */
    domain_tags: string[] | null;
    /** Whose posts the feed shows, one of `feedReaches`. A name this version does not know is refused on read. */
    reach: FeedReach;
    /** How the client lays the feed out, one of `feedLayouts`. A name this version does not know is refused on read. */
    layout: FeedLayout;
    /** The order of the posts, one of `feedSorts`. A name this version does not know is refused on read. */
    sort: FeedSort;
    /** The one post kind shown, one of `postKinds`, or a newer writer's name kept as written; on a `resources` feed up to 10 schema.org type names, comma-separated, deduplicated and sorted by code point (`MusicAlbum,MusicRecording`). Null for every kind. */
    content: PostKind | null;
    /** What the feed lists, one of `feedTargets`; null for posts, the default, which a writer never stores. `resources` takes a `content` of schema.org types only and no `domain_tags`. A name this version does not know is refused on read. */
    target: FeedTarget | null;
    /** A resources feed's search filters (`FeedFilters`); null for none, and always on a post feed. */
    filters: FeedFilters | null;
}
/**
 * The search filters of a resources feed, every value a string and null for not set. The values
 * are the app's `/search` vocabulary, not the index's, with stricter rules: the README maps each
 * one to Pinakes `GET /v1/search`. A member this version does not know is
 * refused, as an unknown reach is: each one changes what the feed lists. `place` names the point
 * and stays outside the id.
 */
export interface FeedFilters extends Extra {
    /** A calendar window of start times from now, in the viewer's time zone: `today`, `weekend`, `week` (to the end of Sunday), `month` or `past` (up to now). Not with `from` or `to`. */
    when: string | null;
    /** The first day of a window of days, `YYYY-MM-DD`, from its start in the viewer's time zone. */
    from: string | null;
    /** The last day of a window of days, `YYYY-MM-DD`, to its end (the whole day included); not before `from`. */
    to: string | null;
    /** Around a point, `lat,lon` in degrees with at most 5 decimals and no trailing zero (`47.37,8.54`). */
    near: string | null;
    /** The distance around `near` in whole kilometres, 1 to 200; 10 km without. */
    radius: string | null;
    /** The name of the place `near` is, as shown: trimmed, at most 120 code points. Outside the id, so a new name renames the feed. */
    place: string | null;
    /** One category as the index spells it (`amenity/cafe`), trimmed, at most 256 bytes. */
    category: string | null;
    /** Services, any of them: the links' hosts in lower case, comma-separated, at most 10, deduplicated and sorted by code point (`open.spotify.com,www.deezer.com`). One host is a list of one. */
    host: string | null;
    /** One identifier the resources carry, `<namespace>:<value>` (`isbn:9780140328721`), the value at most 256 bytes. */
    key: string | null;
    /** Job postings that may (`yes`) or may not (`no`) be done remotely. */
    remote: string | null;
    /** `yes`: also job postings past their closing date. */
    closed: string | null;
    /** Recipes with every one of these ingredients: comma-separated, at most 3 of at most 64 code points each, lower case, deduplicated and sorted by code point. */
    ingredients: string | null;
    /** An order in place of the feed's own `sort`, which stays in the id: `trending`, `upcoming` (by start, soonest first, from now on unless `when`, `from` or `to` set the window) or `nearest` (with `near`). */
    sort: string | null;
    /** The window `trending` counts references in: `24h`, `7d` or `30d`; `7d` without. Only with `sort` `trending`. */
    window: string | null;
    /** `links`: every link as a row, where the feed otherwise lists one row per thing. */
    rows: string | null;
    /** Schema.org types the feed leaves out, each with its subtypes: comma-separated type names, at most 50, deduplicated and sorted by code point (`Article,Event`). A resource with no type yet is not listed either. */
    exclude_types: string | null;
}
export interface Feed extends Extra {
    /** The filter, which is the whole identity of the feed: its id hashes these members. */
    feed: FeedConfig;
    /** The display name, trimmed by the builder: 1 to 100 code points, not blank. Outside the id. */
    name: string;
    /** 1 to 50 of a-z, 0-9 and `-`: a name for the client's icon set, not an emoji. */
    icon: string | null;
    /** Microseconds since the epoch. */
    created_at: bigint;
}
export declare const feed: Model<Feed>;
/** The id of a feed object, so an edited feed finds its new path with its unknown members kept. */
/** Both addresses of the feed `id`: where its owner keeps it, and its published copy. */
export declare function feedPaths(id: string): {
    private: OwnerPath;
    public: OwnerPath;
};
export declare function feedId(value: Feed): string;
/** A feed at its private path. The builder folds and sorts the filter, trims the name and stores no `target` for posts. */
export declare function buildFeed(owner: string | null, input: unknown, each?: Each): {
    id: string;
    path: OwnerPath;
    value: Feed;
    body: string;
};
//# sourceMappingURL=feed.d.ts.map