# pubky-social-specs

The Pubky social data model for JavaScript and TypeScript: profiles, posts, tags, bookmarks, follows, mutes, feeds and media, as plain synchronous functions. A builder gives you where an object goes and the exact bytes to PUT there, and a decoder checks what a GET returned.

```bash
npm install pubky-social-specs
```

## Concepts

Every Pubky user has an **owner** key: 52 characters of z-base32, such as `8kkppkmiubfq4pxn6f73nqrhhhgkb5xyfprntc9si3np9ydbotto`. The user's data lives on a **homeserver**, as files in a tree that belongs to that key.

The tree has two **roots**. Files under `/pub/` are world-readable. Files under `/priv/` are read and written only by the owner and by the apps the owner granted access, which is where drafts, bookmarks, mutes and feeds go.

A client talks to the homeserver with four requests: **PUT** a file at a path, **GET** it, **DELETE** it, and **LIST** the files under a directory. This package performs none of them. It builds the bytes, checks what comes back and computes the paths, so it runs anywhere JavaScript runs. The requests are made by the Pubky SDK, [`@synonymdev/pubky`](https://www.npmjs.com/package/@synonymdev/pubky), or by any HTTP client you bring.

A post is a directory of **versions**: each edit writes a new file, `posts/{id}/{editId}.json`, and the version with the highest `editId` is the **head**, the post as it reads now. A reference to a post names the directory, so it survives every edit. Post ids and edit ids encode the time they were minted and sort by it as plain strings, so `a > b` compares two of them.

A LIST is recursive: listing `/pub/social/v1/posts/` returns every version file below it, a page of up to 1000 URLs at a time. A **plan** is a function that computes which files to copy and delete for a change of several files (publishing a draft, deleting a post) and performs no request itself.

This package writes the **1.x** layout, under `/{root}/social/v1/`. Data written by pubky-app before it, the **0.x** layout under `/pub/pubky.app/`, is read only by the migration, the separate package [`pubky-social-migrator`](https://www.npmjs.com/package/pubky-social-migrator), which copies it into 1.x.

The reference implementation is the Rust crate of the same name. This package is held to it on every operation: the same stored bytes, the same ids and paths, and the same message when an object is refused.

## Quick start

Every block in this README runs as pasted, in an app or a test. Each takes a signed-in `session` from `memoryHomeserver()` of `pubky-social-specs/testing`, an in-memory homeserver with the SDK's calls and answers that starts empty on every call; in an app that line is your SDK sign-in, and `owner` is `session.info.publicKey.z32()`.

```js
import { buildPost, decodeObject } from "pubky-social-specs";
import { memoryHomeserver } from "pubky-social-specs/testing";
const { owner, session } = memoryHomeserver(); // your SDK session and session.info.publicKey.z32()

// Build: where the post goes and the bytes to send
const { url, path, body } = buildPost(owner, { content: "Hello" });
await session.storage.putBytes(path, body);

// Read: what a GET returned, checked by the rules of the kind the URL names
const post = decodeObject(url, await session.storage.getBytes(path), "post");
console.log(post.content); // Hello
```

`body` is a `Uint8Array` that `fetch`, `Blob` and the SDK take as it is; `new TextDecoder().decode(body)` shows the JSON. [`example.js`](example.js) walks through every builder, an edit, a publish and a delete; from a project that installed the package, run it with `node node_modules/pubky-social-specs/example.js`.

## Four ways to name a place

Most first errors are one of these passed where another goes. Each has a branded type, so TypeScript refuses one passed for another before the code runs. A plain string is taken too, so an entry of a LIST goes straight in; to check and brand one where it enters, from a form or a LIST, call `parseOwner`, `parsePubkyUrl`, `parseOwnerPath` or `parsePostRef`, or test it with `isPubkyUrl`. `parsePubkyUrl(url, "post")` also checks the kind and types the result for it. `toPath(url)` and `toUrl(owner, path)` turn one spelling into the other, and `isOneOf(postKinds, kind)` narrows a string to the names of a table.

| name | looks like | comes from | goes to |
|---|---|---|---|
| owner (`Owner`) | `8kkp...otto` | `session.info.publicKey.z32()` | the first argument of a builder |
| URL (`PubkyUrl`) | `pubky://<owner>/pub/social/v1/posts/<id>/<editId>.json` | `url` of a builder result, an entry of a LIST | `decodeObject`, `encodeObject`, `editPost`, `parseUri`, `toPath` |
| path (`OwnerPath`) | `/pub/social/v1/posts/<id>/<editId>.json` | `path` of a builder result, `toPath(url)` | the SDK's storage calls, every plan, `deletionPaths` |
| reference (`PostRef`) | `pubky://<owner>/pub/social/v1/posts/<id>` | `buildUri(author, "post", id)` | `parent`, `embed`, a tag, a bookmark, a collection item |

A URL names one stored file. A reference names a thing: for a post it leaves out the version, and for a user it is the URL of the profile, `buildUri(owner, "user")`. A LIST prefix, `listPrefix(owner, "public")`, ends with `/` and names a directory, so it has a type of its own.

## Create

Every builder of a stored object takes the owner first and returns a `Built<T>`, `T` being the stored object (`User`, `Post`, ...): `id` (what the path names), `path`, `url`, `object` (the stored object, every known member present) and `body` (the bytes to PUT).

```js
import { buildBookmark, buildFeed, buildFollow, buildMute, buildPost, buildTag, buildUri, buildUser } from "pubky-social-specs";
import { memoryHomeserver } from "pubky-social-specs/testing";
const { friend, owner, session } = memoryHomeserver();

const theirPost = buildUri(friend, "post", "0035QZPT4QG00"); // a reference: the post, not one version

const writes = [
  buildUser(owner, { name: "Alice", bio: "Hi", links: [{ title: "Site", url: "https://example.com" }] }),
  buildPost(owner, { content: "A reply", parent: theirPost }),
  buildPost(owner, { kind: "article", title: "On Pubky", body: "Markdown body", slug: "on-pubky" }),
  buildPost(owner, { kind: "collection", name: "Reading list", items: [{ uri: theirPost, note: "start here" }], layout: "grid" }),
  buildPost(owner, { content: "A draft", root: "private" }),
  buildTag(owner, theirPost, "rust"),
  buildBookmark(owner, theirPost),
  buildFollow(owner, friend),
  buildMute(owner, friend),
  buildFeed(owner, { name: "Rust", icon: "crab", reach: "all", layout: "columns", sort: "recent", tags: ["rust"] }),
];
for (const { path, body } of writes) await session.storage.putBytes(path, body);
console.log(writes.map((w) => w.path));
```

A builder trims display text (a name, a title, a post's content, a label) and lowercases the ASCII letters of a tag label. A reference is stored as written, so it must be canonical already: a pubky reference comes from `buildUri`, and a web URL starts with lowercase `http://` or `https://` and holds no whitespace. Absent and `null` mean the same in an input.

`buildPost` takes a note, an article or a collection, told apart by `kind`, and TypeScript refuses a member of another kind (a `title` on a note, a `parent` on a collection). Besides `article` and `collection` the kinds are `note` (the default), `image`, `video`, `link` and `file`, which all take `content`. It returns a `BuiltPost`, which adds the `editId` of the version; for a new post it equals `id`.

A slug gives a version a readable leaf, `{editId}-{slug}.json`: 1 to 64 of a-z, 0-9 and `-`. It carries no identity, so a renamed slug is the next edit, and it is allowed under both roots.

A feed's id is its filter (reach, layout, sort, content, tags, domain tags, target, and a resources feed's `filters` but their `place`), so two feeds with one filter are one feed whatever their names. A tag label is trimmed and ASCII-lowercased and nothing more: `café` in NFC and in NFD are two labels with two ids.

A feed lists posts unless its `target` is `resources`, the external links people tag (`feedTargets`). Posts is the default and is stored as no member, so `target: "posts"` builds the bytes and the id of a feed that names no target. A resources feed takes no `domain_tags`, and its `content` names schema.org types instead of a post kind: up to 10 type names of at most 64 characters, comma-separated with no spaces (`content: "MusicRecording,MusicAlbum"` lists songs and albums), each standing for itself and its subtypes as the index reads them, or none for every resource. The builder stores the list deduplicated and sorted by code point, so one set of types is one feed, and `feedResourceTypes(feed)` reads it back as an array. Only the spelling is checked (an ASCII capital letter or digit, then letters and digits): which types exist is up to the index, so a newer schema.org type needs no new release. A post kind or any other spelling is refused. Its id hashes `resources:` in front of the filter, so it never shares an id or a path with the post feed of the same filter; for that reason no reach is ever named after a target, and a later target puts its own name in front. A reader older than `target` refuses a resources feed at its URL, since the id it derives leaves the target out. A reader that decodes feed bytes with no URL, `decodeObject({ kind: "feed" }, bytes)`, has no id to check: an older one reads the post feed of the same filter, with `target` in `$unknown`, and `feedId` gives it that feed's id. Decode a stored feed at its URL.

A resources feed may keep the filters of its search in `filters` (`FeedFilters`), every value a string. The values are the app's `/search` vocabulary, not Pinakes', with stricter rules; a client turns them into a `GET /v1/search` like this:

| Member | Value | App `/search` URL | Pinakes `GET /v1/search` |
|---|---|---|---|
| `when` | `today`, `weekend`, `week`, `month`, `past` | `when` | `from` and `to`, see below |
| `from`, `to` | `YYYY-MM-DD` | `when=dates`, `from`, `to` | `from`, `to` (RFC 3339) |
| `near` | `lat,lon` | `near` | `near` |
| `radius` | whole km, 1 to 200 | `radius` | `radius` in metres (km × 1000) |
| `place` | a name | `place` | not sent |
| `category` | `amenity/cafe` | `category` | `category` |
| `host` | `open.spotify.com` | `service` | `host` |
| `key` | `isbn:9780140328721` | `id` | `key` |
| `remote` | `yes`, `no` | `remote` | `remote=true`, `remote=false` |
| `closed` | `yes` | `closed=1` | `closed=true` |
| `ingredients` | up to 3, `chickpeas,lemon` | `ingredient` | `ingredient` |
| `sort` | `trending`, `upcoming`, `nearest` | `sort` | `sort=trending`, `start`, `distance` |
| `window` | `24h`, `7d`, `30d` | `window` | `window` |
| `rows` | `links` | `rows` | no `collapse=group` (without `rows`: `collapse=group`) |

What the values mean, as the app reads them:

- Days and windows are the viewer's own, in the local time zone of the device that searches, sent to Pinakes as UTC instants (`now` as `now`).
- `when` is a calendar window from now, not a rolling one: `today` up to the end of today, `week` up to the end of Sunday (weeks run Monday to Sunday), `month` up to the end of the month's last day, `weekend` from Saturday's start (or now, once it is the weekend) to the end of Sunday, `past` up to now (`to=now`).
- `from` is the start of its day and `to` the end of its day, so `to` includes its whole day. Either alone leaves the window open on the other side. Without `when`, `from` and `to` the filters set no window, and a saved feed lists as the app does: a feed whose `content` is `Event` (or its subtypes) from now on (its Upcoming), any other feed with no window.
- Without `radius` the distance is 10 km. Without `window`, `trending` counts 7 days. A writer leaves these defaults out, as the app does: `radius: "10"` or `window: "7d"` is valid, but a stored default is in the id, so it would make a second feed of the same search.
- `sort: upcoming` orders by start time, soonest first. With no `when`, `from` or `to` it lists from now on; otherwise their window applies, so `when: past` with `upcoming` lists past events by their start.
- `filters.sort` orders the list in place of the feed's own `sort`, which stays in the id: two feeds that differ only in their own `sort` are two feeds even with one `filters.sort`.

The rules check each value's spelling and which members go together, not that a value exists. Lowercase the ingredients before you build (only ASCII capitals are refused, so `Äpfel` and `äpfel` would be two feeds), and round `near` to 5 decimals (`Math.round(x * 1e5) / 1e5`, spelled as JavaScript prints it: `47.37`, never `47.370000000000005`). The builder sorts and deduplicates the ingredients and stores no empty set. A member this version does not know is refused, as an unknown reach is, since it changes what the feed lists.

The filters are a seventh segment of the id input, one JSON object of the members set in their stored order, `place` left out. `place` only names the point, as `name` names the feed: the same point under a new name is the same feed, so saving it renames the feed in place, and there is no old path to delete. A resources feed without filters keeps the bytes and the id it had.

Readers older than `filters` (1.0.0-rc.1, and unreleased builds up to `f8f5a491`) refuse a feed with filters at its URL, since the id they derive leaves the filters out. One that decodes the bytes with no URL reads the broader feed without them, with `filters` in `$unknown`, and `feedId` points it at that feed's path: a copy it writes there carries `filters` to a path where newer readers refuse it. So update Nexus and the app's pinned copy of this package before any app writes `filters`, and always decode a feed at its URL. `filters` is not in a release of the data model yet: it needs one before it goes upstream.

### Media

Media is content addressed: its id is the hash of its bytes, and the declared type picks only the extension. A type the package does not map, an empty one included, gets `.bin`; the table is in [`docs/reference.md`](docs/reference.md#media-types). `buildFile` returns `{ id, path, url }`, with no `body`, since the bytes are yours to PUT.

```js
import { buildFile, buildPost, hashMedia } from "pubky-social-specs";
import { memoryHomeserver } from "pubky-social-specs/testing";
const { owner, session } = memoryHomeserver();

const file = new File([new Uint8Array([137, 80, 78, 71])], "cat.png", { type: "image/png" });
const bytes = new Uint8Array(await file.arrayBuffer());
const media = buildFile(owner, { bytes, type: file.type });
await session.storage.putBytes(media.path, bytes);

const post = buildPost(owner, { content: "A photo", attachments: [{ uri: media.url, name: file.name, alt: "A cat" }] });
await session.storage.putBytes(post.path, post.body);

// A large file: hash it a chunk at a time, so the page keeps running, and pass the id
const id = await hashMedia(file);
console.log(buildFile(owner, { id, type: file.type }).url === media.url); // true
```

Hashing is plain JavaScript, far slower than a native hash, so give `hashMedia` anything over a few megabytes; `createMediaHasher()` is the same hash fed by hand, for a worker. A `Blob` that cannot stream, as jsdom's cannot, is read whole. With an `id` the package never sees the bytes, so check `file.size` against `limits.maxFileSizeBytes` yourself. A media id is 128 bits of BLAKE3, as in the crate.

### Validating a form

A builder throws at the first refusal. `validateUser`, `validatePost`, `validateFeed` and `validateTag` run the same rules, collect every issue, and mint nothing; `userSchema`, `postSchema`, `feedSchema` and `tagSchema` are the same validators as [Standard Schema](https://standardschema.dev) objects, for react-hook-form, TanStack Form, tRPC or Hono as they are.

```js
import { postSchema, validatePost } from "pubky-social-specs";
import { memoryHomeserver } from "pubky-social-specs/testing";
const { owner } = memoryHomeserver();

const result = validatePost({ kind: "article", title: " ", body: "...", slug: "Not A Slug" }, owner);
if (!result.success) for (const issue of result.issues) console.log(issue.path.join("."), issue.code, issue.message);
// title blank Article title must contain non-whitespace characters
// slug format slug must be 1 to 64 chars of a-z, 0-9 and -: Not A Slug

const checked = postSchema["~standard"].validate({ content: "fine" });
console.log(checked.issues === undefined ? checked.value : checked.issues);
```

Each issue has a `path` into the input, a `code` (`invalid_type` for a value of the wrong JavaScript shape, else the [error code](#errors) of the rule), the `message`, and a `limit` for a length or a count. `validatePost(input, owner)` also runs the rule that a private draft references only its owner's private objects.

## Read and edit

`decodeObject(url, bytes, kind)` returns the object, typed, and refuses a URL that names another kind before it reads the bytes. Without the kind it returns `{ kind, object }`, or `{ kind: "file", bytes }` for media. Bytes that are no valid object at that URL throw a `ValidationError`; other people's data can be anything, so `tryDecodeObject` returns the refusal instead of throwing it.

### Reading a timeline

```js
import { buildPost, buildUri, idMicros, microsToDate, parseUri, tryDecodeObject } from "pubky-social-specs";
import { memoryHomeserver } from "pubky-social-specs/testing";
const { friend, friendSession, publicStorage } = memoryHomeserver();

// Someone posted, and edited once
const first = buildPost(friend, { content: "Hello from the other side", embed: "javascript:alert(1)" });
await friendSession.storage.putBytes(first.path, first.body);

// LIST their public posts: one URL per version. A directory with nothing in it answers 404
const listed = await publicStorage.list(`pubky://${friend}/pub/social/v1/posts/`).catch((e) => (e.data?.statusCode === 404 ? [] : Promise.reject(e)));

// The head of each post is its version with the highest editId
const heads = new Map();
for (const url of listed) {
  // Someone else's tree may hold any file name; one that is no canonical URL is skipped
  let at;
  try {
    at = parseUri(url);
  } catch {
    continue;
  }
  if (at.kind === "post" && at.editId !== undefined && !(heads.get(at.id)?.editId > at.editId)) heads.set(at.id, { url, editId: at.editId });
}

// Render only the schemes you link to; anything else is text
const linkable = (uri) => /^(pubky|https?):/.test(uri);
for (const [id, { url }] of heads) {
  const read = tryDecodeObject(url, await publicStorage.getBytes(url), "post");
  if (!read.ok) continue; // a bad object of someone else's is skipped, read.error says why
  const when = microsToDate(idMicros(id)).toISOString();
  console.log(when, read.value.content, read.value.embed && (linkable(read.value.embed) ? read.value.embed : "(not a link)"));
  console.log("reply to it with parent:", buildUri(friend, "post", id));
}
```

The data model takes any scheme in an `embed`, a `parent`, a tag, a bookmark or a collection item, `javascript:` and `data:` included; which ones become a link is the renderer's call. `idMicros(id)` gives the time a post id or an edit id was minted, in microseconds, the unit of every stored timestamp; `microsToDate` and `dateToMicros` convert.

### Editing an object

To change a stored object, decode it, change it, and encode it. Members a newer client added, which this version does not know, travel in `$unknown` and are written back.

```js
import { buildUser, decodeObject, encodeObject, toPath } from "pubky-social-specs";
import { memoryHomeserver } from "pubky-social-specs/testing";
const { owner, session } = memoryHomeserver();

const { url, path, body } = buildUser(owner, { name: "Alice" });
await session.storage.putBytes(path, body);

const profile = decodeObject(url, await session.storage.getBytes(toPath(url)), "user");
await session.storage.putBytes(toPath(url), encodeObject(url, { ...profile, status: "On holiday" }));
```

Pass `encodeObject` the `.object` with your changes, spread so `$unknown` stays on it. It also takes `{ kind, root? }` in place of a URL, for bytes that go somewhere the data model does not name. An edited feed filter moves the feed, since its id is the filter: write it at `buildUri(owner, "feed", feedId(feed))` and delete the old path, unless the id is unchanged (a new name, icon or `place` only). A feed is stored private. `feedPaths(id)` gives both of its addresses: to publish it, PUT the same bytes at `public`, and to unpublish, DELETE `public`; `deletionPaths` removes both copies.

### Articles and collections

The `content` of an article or a collection is itself JSON. Read and write it through the package, which spells it as the crate does.

```js
import { buildPost, decodeContent, editPost, encodeContent } from "pubky-social-specs";
import { memoryHomeserver } from "pubky-social-specs/testing";
const { owner } = memoryHomeserver();

const article = buildPost(owner, { kind: "article", title: "Title", body: "Body" });
const envelope = decodeContent(article.object); // { kind: "article", content: { title, body, cover_image } }, or null for a note
if (envelope?.kind !== "article") throw new Error("not an article");
const content = encodeContent({ ...envelope.content, title: "A better title" });
const edited = editPost(owner, article.url, { ...article.object, content });
console.log(edited.editId > article.editId); // true
```

`encodeContent` only spells the envelope; its rules run when the post reaches `editPost` or `encodeObject`. A post an indexer handed over can carry any content: `tryDecodeContent` returns the refusal instead of throwing it.

## Delete

`deletionPaths({ kind, id, listings? })` gives the paths to DELETE for one object, in order, its 0.x copy first:

| kind | `id` | paths, in order | `listings` |
|---|---|---|---|
| `user` | `""` | `/pub/pubky.app/profile.json`, `/pub/social/v1/profile.json` | none |
| `follow` | the followee's key | `/pub/pubky.app/follows/<key>`, `/pub/social/v1/follows/<key>.json` | none |
| `mute` | the muted key | `/pub/pubky.app/mutes/<key>`, `/priv/social/v1/mutes/<key>.json` | none |
| `bookmark` | the filename | `/priv/social/v1/bookmarks/<id>.json` | none |
| `feed` | the hash id | `/pub/social/v1/feeds/<id>.json`, `/priv/social/v1/feeds/<id>.json` | none |
| `post` | the post id | each listed 0.x copy, then each listed version oldest first, public before private; nothing for a post with no listings | the paths a LIST of `/pub/social/v1/posts/<id>/` and `/priv/social/v1/posts/<id>/` found, and `/pub/pubky.app/posts/<id>` when a GET finds it |
| `file` | the hash | each 0.x File object, the 0.x blob, then each listed copy, public before private | the 1.x copies, and each 0.x File object with its `src` |
| `tag` | the hash id | each listed 0.x tag, then `/pub/social/v1/tags/<id>.json` | each 0.x tag with its `uri` and `label` |

For a post, prefer `planDelete` (below): it takes the same copies, orders them the same way, and also returns the media the post referenced. A bookmark and a feed delete their 1.x copies only: their 0.x id hashes a target that the migration respells, so their own id cannot name the 0.x path. That copy stays readable under `/pub/pubky.app/`, and a later migration run does not copy it back (see [`pubky-social-migrator`](https://www.npmjs.com/package/pubky-social-migrator)). Every listing is checked, and one that is not a copy of the object is refused with a `ValidationError` naming it.

```js
import { buildFollow, deletionPaths } from "pubky-social-specs";
import { memoryHomeserver } from "pubky-social-specs/testing";
const { friend, owner, session } = memoryHomeserver();

const follow = buildFollow(owner, friend);
await session.storage.putBytes(follow.path, follow.body);
// A path with nothing stored there deletes as a no-op
for (const path of deletionPaths({ kind: "follow", id: friend })) await session.storage.delete(path);
console.log(await session.storage.exists(follow.path)); // false
```

## Posts and the lifecycle

A post's versions sit under the public root or the private one. `editPost(owner, headUrl, post)` writes the next version above the head, in the owner's own tree, under the head's root unless you pass `{ root }`; an edit of another user's head is refused. A plan computes what to copy and delete and performs no I/O; every path it takes or returns is owner-relative.

```js
import { buildFile, buildPost, editPost, parseUri, planDelete, planPublish, planUnpublish } from "pubky-social-specs";
import { memoryHomeserver } from "pubky-social-specs/testing";
const { owner, session } = memoryHomeserver();

const copy = async ({ from, to }) => session.storage.putBytes(to, await session.storage.getBytes(from));

// A private draft with private media, and an edit of it
const picture = new Uint8Array([1, 2, 3]);
const media = buildFile(owner, { bytes: picture, type: "image/png", root: "private" });
await session.storage.putBytes(media.path, picture);
const draft = buildPost(owner, { content: "Draft", attachments: [{ uri: media.url }], root: "private", slug: "my-post" });
await session.storage.putBytes(draft.path, draft.body);
const edited = editPost(owner, draft.url, { ...draft.object, content: "Better draft" });
await session.storage.putBytes(edited.path, edited.body);

// Publish the head: its private media first, then the post, under the same leaf
const at = parseUri(edited.url);
const publish = planPublish(owner, { id: edited.id, editId: edited.editId, post: edited.object, slug: at.kind === "post" ? at.slug : null });
for (const step of publish.copies) await copy(step);
await session.storage.putBytes(publish.put.path, publish.put.body);

// Unpublish: copy back what the private tree lacks, then delete the public versions
const unpublish = planUnpublish({ id: edited.id, publicPaths: [publish.put.path], privateHead: edited.path });
for (const step of unpublish.copies) await copy(step);
for (const path of unpublish.deletes) await session.storage.delete(path);

// Delete everywhere, in an order that never leaves a reader a dangling post
const removal = planDelete(owner, {
  id: edited.id,
  copies: [draft, edited].map((v) => ({ root: "private", path: v.path })),
  versions: [draft.object, edited.object],
});
for (const path of removal.deletes) await session.storage.delete(path);
console.log(removal.mediaGcCandidates); // media the post referenced: delete it if nothing else does
```

`planPublish` keeps the slug the private version had, the `slug` of `parseUri(url)`, and respells private media references to public ones in the members that hold a reference (attachments and the cover), never inside the text. `planUnpublish` takes the paths of the public versions and of the newest private one, from a LIST. `planDelete` takes every stored version as `{ root, path }` and the versions it could read, whose media it returns as candidates to collect.

## Rules

1. **The package writes the bytes.** Never `JSON.stringify` an object yourself: unknown members have an order and numbers a spelling that only the package reproduces. Every builder returns `body`, and `encodeObject` gives the bytes of an object you edited.
2. **Unknown members are carried along.** A newer client may store members this version does not know. They come back in `$unknown`, as text; leave it on the object and it is written back untouched. A spread, `structuredClone` and a JSON round trip keep it, and copying an object field by field drops it, with the other client's data. A name this version does not know in a feed's `content` or a collection's `layout` is kept as written too.
3. **Every argument is read once.** The package copies what you pass, own members only, before it reads it. A member that is neither known nor inside `$unknown` is an error, so a typo is never stored or ignored, and whatever `Object.prototype` holds never becomes a member.
4. **Stored objects are spelled as stored.** `created_at`, `cover_image`, `domain_tags`: the same names in an input, in a decoded object and on the wire. Every known member is present in an object, `null` when it has no value. Integers are numbers, and `created_at` is microseconds since the epoch.

## Common mistakes

- An owner written as `pubky://<key>` is refused as a key of the wrong length, with `field: "owner"`. `parseOwner` reads the key out of such a URL.
- A path passed where a URL goes is refused as `Not a canonical pubky URI`, with `code: "path"`: pass the `url` a builder returned, or the one a LIST gave.
- The `url` a builder returned names one version of a post. As a reference it is refused (`must be versionless`): use `buildUri(author, "post", id)`.
- A user is referenced by the URL of the profile, `buildUri(owner, "user")`: that is what a tag or a bookmark of a user points at, and what the migration respells a 0.x one to. The bare `pubky://<owner>` is another target, so a tag on it is not counted with the others, and `decodeObject` refuses it.
- `created_at` set from `Date.now()` is milliseconds. Outside a production build `encodeObject` warns; `dateToMicros(Date.now())` gives microseconds.
- A private object, a bookmark, a mute, a feed or anything under `root: "private"`, is invisible to an indexer: a feature built on an indexer's view, such as a notification, never sees it.
- An object copied field by field loses `$unknown`. Outside a production build `encodeObject` and `editPost` warn when an object read with unknown members is written without them.

## Errors

A value the data model refuses throws a `ValidationError`. A value of the wrong JavaScript type, or a member the input does not have, throws an `ArgumentError`, a `TypeError` naming the argument: a bug in the calling code, which TypeScript catches first. A string of the right type that the model refuses, such as an unknown kind or a path where a URL goes, is a `ValidationError`.

```js
import { ArgumentError, buildPost, buildUser, ValidationError } from "pubky-social-specs";
import { memoryHomeserver } from "pubky-social-specs/testing";
const { owner } = memoryHomeserver();

try {
  buildUser(owner, { name: "Al" });
} catch (e) {
  if (e instanceof ValidationError) console.log(e.code, e.field, e.limit); // length name 3
}
try {
  // @ts-expect-error a number is the wrong type for content
  buildPost(owner, { content: 42 });
} catch (e) {
  if (e instanceof ArgumentError) console.log(e.field); // input.content
}
```

A `ValidationError` has `message`, the reference text starting with `Validation Error: ` (the package's own words after the same prefix where the reference has no rule, as for a lone surrogate); `reason`, the same text without the prefix; `code`, one of the set below, stable across releases where the text is not; `field`, the member or argument refused, absent when the whole object is; and `limit`, the bound a `size`, `length` or `count` refusal broke. `instanceof` holds across two installed copies of the package.

| `code` | the rule | `limit` |
|---|---|---|
| `json` | the bytes, or an envelope inside them, are not JSON of the stored shape | |
| `size` | an object or a file over its byte cap, or text over a cap in bytes (a resources feed's `filters.category`, the value of `filters.key`) | bytes |
| `length` | text outside its bounds | code points |
| `count` | a list longer than its cap | items |
| `blank` | text, a list or a file that is empty or whitespace only | |
| `format` | text not spelled the one way the model accepts (a key, an id, a tag, a slug), or a number held as text out of its range (a resources feed's `filters.radius`) | |
| `id` | an id that does not match its object, or whose time is out of bounds | |
| `reference` | a URI in a reference position the model refuses | |
| `unknown_name` | a kind, reach, layout, sort or target this version does not know, or a member of a resources feed's `filters` this version does not know | |
| `unsafe_integer` | an integer a JavaScript number cannot hold exactly | |
| `path` | a URL or path that names no object of the kind asked for | |
| `conflict` | members or arguments that cannot go together | |
| `migration` | refused by `pubky-social-migrator`; see the message | |

## Testing your code

The package is pure and synchronous, so tests call it for real. `setClock`, from `pubky-social-specs/testing`, fixes the clock in milliseconds, which fixes every id and `created_at`. With `node:test`, and the same with vitest or jest:

```js
import assert from "node:assert";
import { test } from "node:test";
import { buildFollow, decodeObject } from "pubky-social-specs";
import { fakeOwner, setClock } from "pubky-social-specs/testing";

test("a follow reads back", () => {
  setClock(() => 1_790_000_000_000);
  try {
    const { url, body } = buildFollow(fakeOwner(1), fakeOwner(2));
    assert.deepStrictEqual(decodeObject(url, body, "follow"), { created_at: 1_790_000_000_000_000 });
  } finally {
    setClock();
  }
});
```

`fakeOwner(n)` gives a well-formed key, the same for the same `n`, and `samplePost`, `sampleUser` and `sampleFeed` build a fixture from a partial input. Ids go up within one process, so two posts built in the same instant get different ids; `setClock` starts that guard over. Two copies of the package minting in the same millisecond rarely meet, and when they do the post ids are equal, so before PUTting a new post check that neither root holds a version of its id (the client does).

## The client

`pubky-social-specs/client` is the glue every app writes over a signed-in SDK session: it builds, PUTs the exact bytes, LISTs, picks the newest version and decodes. A stored object that does not decode comes back as a value with its error. The core stays free of I/O, and an app with its own transport ignores this entry.

```js
import { createSocialClient } from "pubky-social-specs/client";
import { memoryHomeserver } from "pubky-social-specs/testing";
const { friend, publicStorage, session } = memoryHomeserver();

const social = createSocialClient(session, { publicStorage });
const post = await social.posts.create({ content: "Hello" });
// The newest version, read and decoded, or null; `ok` is false when it does not decode
const newest = await social.posts.head(social.owner, post.id);
if (newest?.ok) await social.posts.edit(newest, { ...newest.object, content: "Hello, edited" });
for await (const read of social.posts.list(friend)) if (read.ok) console.log(read.object.content);
```

It covers `posts` (`create`, `head`, `edit`, `list`, `delete`), `profile` (`get`, `set`, `update`), `follows`, `mutes`, `tags`, `bookmarks` and `feeds` (`add`, `remove`, `list`; feeds also `publish` and `unpublish`), and `files` (`upload`, `get`). Reading another user's tree needs `publicStorage`, the SDK's `pubky.publicStorage`. `tags.remove` also deletes the tag's 0.x copies, which it finds by reading the owner's 0.x tags, each once per client, so the first removal of a long-time user is slow. `posts.delete` answers the own media the post's versions referenced as `mediaGcCandidates` and leaves them: only the app knows whether something else still uses one.

## Runtimes and tooling

- ESM only, with types. Node `^20.19.0 || >=22.12.0`, where `require()` of an ES module works too; Deno 2; Bun 1; browsers with ES2022. One dependency, [`@noble/hashes`](https://www.npmjs.com/package/@noble/hashes).
- TypeScript 5.7 or later. An older compiler fails on the import with `has no exported member`, where it would otherwise read every byte type as `any`. A CommonJS file compiled with TypeScript `module: node16` cannot import an ES module; 5.8 or later with `nodenext` can.
- jest runs it in ESM mode (`NODE_OPTIONS=--experimental-vm-modules` and `transform: {}`) or on Node 24.9 or later; vitest needs nothing. Under jsdom the bytes a builder returns are Node's `Uint8Array`, not the window's, so `expect.any(Uint8Array)` misses them: compare with `toEqual(new Uint8Array(...))` or check `ArrayBuffer.isView`.
- The package uses no host-specific global and loads no wasm, so it runs in a worker, in Cloudflare Workers and during server rendering.
- `decodeObject` pulls in every model, about 20 kB gzipped; `buildUri` alone is about 3 kB and the whole entry about 28 kB (`npm run size`: esbuild, minified, gzipped).
- The id guard and the clock belong to one copy of the package. A library that wraps this one should declare it a peer dependency, so a page holds one copy.

## Reference

- Hover any export in an editor: every one carries its doc and an example, which `npm run examples` compiles and runs.
- [`docs/reference.md`](docs/reference.md): the limits, the media types, every stored object member by member, and the error codes, generated from the package.
- [`SECURITY.md`](SECURITY.md): what is attacker-controlled and what the package guarantees about it.
- [`CHANGELOG.md`](CHANGELOG.md): what a version promises about the API and about the stored bytes, separately.

The legacy 0.x layout is described in [`docs/SPEC_V0.md`](https://github.com/pubky/pubky-social-specs/blob/main/docs/SPEC_V0.md) of the repository; a JS consumer that has to read un-migrated data as such goes through a Rust service, since the frozen 0.x reader is Rust only.

## Migration

[`pubky-social-migrator`](https://www.npmjs.com/package/pubky-social-migrator) migrates an owner's 0.x tree to 1.x: the engine, its port over an SDK session, and the `pubky-social-migrate` CLI. It is a separate package, released with this one at the same version, so the wasm it loads stays out of an app that never migrates, and it can be retired without a new major version of this one.

## License

MIT
