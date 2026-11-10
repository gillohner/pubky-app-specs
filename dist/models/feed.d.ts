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
    /** The one post kind shown, one of `postKinds`, or a newer writer's name kept as written; on a `resources` feed the one resource family shown, one of `resourceFamilies`. Null for every kind. */
    content: PostKind | null;
    /** What the feed lists, one of `feedTargets`; null for posts, the default, which a writer never stores. `resources` takes a `content` of `resourceFamilies` only and no `domain_tags`. A name this version does not know is refused on read. */
    target: FeedTarget | null;
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