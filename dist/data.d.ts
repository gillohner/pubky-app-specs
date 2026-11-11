/**
 * The data model's limits, in the units their names say: code points for a `Length`, bytes for
 * `Bytes`, items for a `Count`. A builder, a validator and `decodeObject` refuse past them
 * with a `ValidationError` whose `code` is `length`, `size` or `count` and whose `limit`
 * is the value here.
 *
 * @example
 * ```ts
 * import { limits } from "pubky-social-specs";
 * console.log(limits.postNoteContentMaxLength, limits.maxFileSizeBytes);
 * ```
 */
export declare const limits: Readonly<{
    /** The longest article body, in code points: 50000. */
    articleBodyMaxLength: 50000;
    /** The longest `content` of an article post, the whole envelope as text, in code points: 104000. */
    articleContentMaxLength: 104000;
    /** The longest article title, in code points: 100. */
    articleTitleMaxLength: 100;
    /** The longest `alt` text of an attachment, in code points: 1000. */
    attachmentAltMaxLength: 1000;
    /** The longest `name` of an attachment, in code points: 255. */
    attachmentNameMaxLength: 255;
    /** The longest target a primary bookmark spells in its filename; a longer one takes the overflow form, `~{hash}`, in bytes: 187. */
    bookmarkTargetUriMaxBytes: 187;
    /** The longest `content` of a collection post, the whole envelope as text, in code points: 40000. */
    collectionContentMaxLength: 40000;
    /** The longest collection description, in code points: 500. */
    collectionDescriptionMaxLength: 500;
    /** The longest note on a collection item, in code points: 1000. */
    collectionItemNoteMaxLength: 1000;
    /** The most items in a collection, in items: 100. */
    collectionItemsMaxCount: 100;
    /** The longest collection name, in code points: 100. */
    collectionNameMaxLength: 100;
    /** The shortest collection name, in code points: 1. */
    collectionNameMinLength: 1;
    /** The longest feed icon name, in code points: 50. */
    feedIconMaxLength: 50;
    /** The longest feed name, in code points: 100. */
    feedNameMaxLength: 100;
    /** The longest schema.org type name in a resources feed's `content`, in code points: 64. */
    feedResourceTypeMaxLength: 64;
    /** The most schema.org types in a resources feed's `content`, in items: 10. */
    feedResourceTypesMaxCount: 10;
    /** The most labels in a feed's `tags`, and in its `domain_tags`, in items: 5. */
    feedTagsMaxCount: 5;
    /** The longest profile `image` and article or collection `cover_image`, in code points: 300. */
    imageUrlMaxLength: 300;
    /** The largest media file, 100 MiB, in bytes: 104857600. */
    maxFileSizeBytes: 104857600;
    /** The largest stored object other than a post, as stored, in bytes: 65536. */
    objectMaxBytes: 65536;
    /** The schemes an attachment URI may have. */
    postAllowedAttachmentProtocols: readonly ["pubky", "http", "https"];
    /** The most attachments on a post, in items: 10. */
    postAttachmentsMaxCount: 10;
    /** The largest stored post, as stored, in bytes: 524288. */
    postMaxBytes: 524288;
    /** The longest `content` of a post of any kind but an article or a collection, in code points: 2000. */
    postNoteContentMaxLength: 2000;
    /** The longest slug of a post version, in code points: 64. */
    postSlugMaxLength: 64;
    /** The longest reference: a `parent`, an `embed`, a `lock`, an attachment or a collection item, in code points: 1024. */
    referenceUriMaxLength: 1024;
    /** The characters a tag label may not hold. */
    tagInvalidChars: readonly [",", ":", " ", "\t", "\n", "\r"];
    /** The longest tag label, in code points: 20. */
    tagLabelMaxLength: 20;
    /** The shortest tag label, in code points: 1. */
    tagLabelMinLength: 1;
    /** The longest profile bio, in code points: 160. */
    userBioMaxLength: 160;
    /** The longest title of a profile link, in code points: 100. */
    userLinkTitleMaxLength: 100;
    /** The longest URL of a profile link, in code points: 300. */
    userLinkUrlMaxLength: 300;
    /** The most links on a profile, in items: 5. */
    userLinksMaxCount: 5;
    /** The longest profile name, in code points: 50. */
    userNameMaxLength: 50;
    /** The shortest profile name, in code points: 3. */
    userNameMinLength: 3;
    /** The longest profile status, in code points: 50. */
    userStatusMaxLength: 50;
}>;
export declare const MIME_TO_EXT: readonly [readonly ["image/jpeg", "jpg"], readonly ["image/png", "png"], readonly ["image/gif", "gif"], readonly ["image/webp", "webp"], readonly ["image/svg+xml", "svg"], readonly ["text/csv", "csv"], readonly ["video/mp4", "mp4"], readonly ["video/mpeg", "mpeg"], readonly ["audio/mpeg", "mp3"], readonly ["audio/wav", "wav"], readonly ["application/pdf", "pdf"], readonly ["application/json", "json"], readonly ["application/xml", "xml"], readonly ["text/xml", "xml"], readonly ["application/zip", "zip"], readonly ["application/javascript", "js"], readonly ["text/css", "css"], readonly ["text/html", "html"], readonly ["text/plain", "txt"]];
/**
 * The media types the data model names. Most map to an extension; `application/octet-stream`,
 * `application/x-www-form-urlencoded` and `multipart/form-data` map to `.bin`, as does any
 * type not listed. The table is in docs/reference.md.
 *
 * @example
 * ```ts
 * import { validMimeTypes } from "pubky-social-specs";
 * console.log(validMimeTypes.includes("image/png"));
 * ```
 */
export declare const validMimeTypes: readonly ["application/javascript", "application/json", "application/octet-stream", "application/pdf", "application/x-www-form-urlencoded", "application/xml", "application/zip", "audio/mpeg", "audio/wav", "image/gif", "image/jpeg", "image/png", "image/svg+xml", "image/webp", "multipart/form-data", "text/css", "text/csv", "text/html", "text/plain", "text/xml", "video/mp4", "video/mpeg"];
/**
 * The code points the reference spells as \u{..} when an error quotes text, as inclusive
 * ranges laid end to end. It follows the Unicode tables the reference was built with.
 */
export declare const DEBUG_ESCAPED: readonly number[];
//# sourceMappingURL=data.d.ts.map