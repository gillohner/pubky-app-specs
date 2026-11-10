import { type Each } from "../errors.js";
import { type Extra } from "../json/schema.js";
import { type Model } from "./common.js";
export interface Edge extends Extra {
    /** Microseconds since the epoch. */
    created_at: bigint;
}
export declare const follow: Model<Edge>;
export declare const mute: Model<Edge>;
export declare const buildFollow: (owner: string, followee: string) => {
    id: string;
    path: import("../path.js").OwnerPath;
    value: Edge;
    body: string;
};
export declare const buildMute: (owner: string, mutee: string) => {
    id: string;
    path: import("../path.js").OwnerPath;
    value: Edge;
    body: string;
};
export interface Tag extends Extra {
    /** What is tagged: a reference of any scheme (a pubky URL, a web URL or another scheme), at most 1024 code points. A post is named versionless. */
    uri: string;
    /** The label as stored: trimmed and ASCII-lowercased, 1 to 20 code points, no whitespace, `,` or `:`. */
    label: string;
    /** Microseconds since the epoch. */
    created_at: bigint;
}
export declare const tag: Model<Tag>;
export declare function buildTag(owner: string | null, uri: string, label: string, each?: Each): {
    id: string;
    path: import("../path.js").OwnerPath;
    value: Tag;
    body: string;
};
export interface Bookmark extends Extra {
    /** Microseconds since the epoch. */
    created_at: bigint;
    /** What is bookmarked, only on the overflow form (`~{hash}`), whose filename cannot spell a target over 187 bytes; null on the primary form, whose filename is the target in base64url. */
    target: string | null;
}
/** The target a stored bookmark names. The content is needed only for the `~` form. */
export declare function targetOf(id: string, content: Bookmark): string;
export declare const bookmark: Model<Bookmark>;
export declare function buildBookmark(owner: string, target: string): {
    id: string;
    path: import("../path.js").OwnerPath;
    value: Bookmark;
    body: string;
};
//# sourceMappingURL=graph.d.ts.map