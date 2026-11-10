import { type Each } from "../errors.js";
import { type Extra } from "../json/schema.js";
import { type OwnerPath, type Root } from "../path.js";
import { type Model } from "./common.js";
import { type CollectionLayout, type PostKind } from "./kinds.js";
export interface Attachment extends Extra {
    /** The media: a canonical `pubky`, `http` or `https` URI of at most 1024 code points, under the post's root rules. */
    uri: string;
    /** Text describing the media for a screen reader: at most 1000 code points; null for none. */
    alt: string | null;
    /** The file name shown, trimmed by the builder: 1 to 255 code points, not blank; null for none. */
    name: string | null;
}
export interface Post extends Extra {
    /** Text for an untyped kind; for an article or a collection, the envelope `decodeContent` reads. */
    content: string;
    /** What the post is, one of `postKinds`; it decides what `content` holds. */
    kind: PostKind;
    /** The post this one replies to: a versionless reference of at most 1024 code points; null for none. */
    parent: string | null;
    /** The post or URI this one quotes: a versionless reference of at most 1024 code points; null for none. */
    embed: string | null;
    /** At most 10 media references; empty for none. A collection carries none: its items are in its envelope. */
    attachments: Attachment[];
    /** A pubky reference to what gates the post (a payment or a membership), at most 1024 code points; null for none. Readers that do not honour it show the post as it is. */
    lock: string | null;
}
export interface ArticleContent extends Extra {
    /** The title, trimmed by the builder: 1 to 100 code points, not blank, no control character but tab, newline and carriage return. */
    title: string;
    /** The text, Markdown by convention: at most 50000 code points, no control character but tab, newline and carriage return. */
    body: string;
    /** A canonical `pubky`, `http` or `https` URI of an image, at most 300 code points; null for none. */
    cover_image: string | null;
}
export interface CollectionItem extends Extra {
    /** What is curated: a versionless reference of any scheme (a pubky URL, a web URL or another scheme), at most 1024 code points. */
    uri: string;
    /** The curator's note, trimmed by the builder: 1 to 1000 code points, not blank; null for none. */
    note: string | null;
}
export interface CollectionContent extends Extra {
    /** The collection's name, trimmed by the builder: 1 to 100 code points, not blank. */
    name: string;
    /** What it gathers, trimmed by the builder: at most 500 code points, not blank; null for none. */
    description: string | null;
    /** At most 100 items, in the curator's order; empty for none. */
    items: CollectionItem[];
    /** A canonical `pubky`, `http` or `https` URI of an image, at most 300 code points; null for none. */
    cover_image: string | null;
    /** How the creator would show it, one of `collectionLayouts`, or a newer writer's name kept as written; null for the reader's choice. */
    layout: CollectionLayout | null;
}
export declare const article: import("../json/schema.js").Codec<ArticleContent>;
export declare const collection: import("../json/schema.js").Codec<CollectionContent>;
/** A TimestampId in its canonical spelling and inside the time bounds. */
export declare function checkTimestampId(id: string, field?: string): bigint;
/** The version a path names: a TimestampId of its own, never older than the post. */
export declare function checkVersion(id: string, editId: string): void;
/** Every reference of a post through the one gate. With an owner the ownership rule runs too. */
export declare function checkReferences(value: Post, publicRoot: boolean, owner: string | null, each?: Each): void;
/**
 * The references inside the envelope of an article or a collection: its cover, and a
 * collection's item URIs. Content that does not parse references nothing here; its own rule
 * refuses it after.
 */
export declare function envelopeRefs(value: Post): {
    cover: string | null;
    items: string[];
};
/**
 * The content of an article or a collection with `cover` as its cover, written as the kind
 * writes it so only the cover changes; null when the content does not parse as that envelope.
 */
export declare function withCover(value: Post, cover: string): string | null;
export declare const post: Model<Post>;
export interface Minted {
    id: string;
    editId: string;
    path: OwnerPath;
    value: Post;
    body: string;
}
/** A slug, when given: what a version filename may carry after its editId. */
export declare function checkSlug(slug: string | null): void;
/** Where version `editId` of post `id` is stored under `root`. */
export declare const versionPath: (root: Root, id: string, editId: string, slug: string | null) => OwnerPath;
/** The id a validator checks a new post under: the clock's, which leaves the mint alone. */
export declare const unminted: () => string;
/**
 * An edit of post `id`: an editId strictly above `head`. When the clock is not past the head,
 * as when a faster clock made it, the bytes being written pick the distance, so only identical
 * edits share a path.
 */
export declare function editPost(owner: string, value: Post, id: string, head: string, root: Root, slug: string | null): Minted;
/**
 * A new post. The builder trims the display text and writes the envelope of a typed kind. A
 * validator passes a collecting `each`, `unminted` and, when it has one, the owner.
 */
export declare function buildPost(owner: string | null, input: unknown, each?: Each, newId?: () => string): Minted;
//# sourceMappingURL=post.d.ts.map