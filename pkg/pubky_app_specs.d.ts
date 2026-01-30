/* tslint:disable */
/* eslint-disable */
/**
 * Validate RFC 5545 duration format (basic validation)
 */
export function validateDuration(duration: string): boolean;
/**
 * Get valid event status values
 */
export function getValidEventStatuses(): string[];
/**
 * Parse RRULE basic format (simplified validation)
 */
export function validateRrule(rrule: string): boolean;
/**
 * Validate geographic coordinates in "lat;lon" format
 */
export function validateGeoCoordinates(geo: string): boolean;
/**
 * Get valid RSVP status values
 */
export function getValidRsvpStatuses(): string[];
/**
 * Validate hex color format (#RRGGBB)
 */
export function validateColor(color: string): boolean;
/**
 * Parses a Pubky URI and returns a strongly typed `ParsedUriResult`.
 *
 * This function wraps the internal ParsedUri ust parsing logic. It converts the result into a
 * strongly typed object that is easier to use in TypeScript.
 *
 * # Parameters
 *
 * - `uri`: A string slice representing the Pubky URI. The URI should follow the format:
 *   `pubky://<user_id>/pub/pubky.app/<resource>[/<id>]`.
 *
 * # Returns
 *
 * On success, returns a `ParsedUriResult` with:
 * - `user_id`: the parsed user ID,
 * - `resource`: a string (derived from the Display implementation of internal `Resource` enum),
 * - `resource_id`: an optional resource identifier (if applicable).
 *
 * On failure, returns a JavaScript error (`String`) containing an error message.
 *
 * # Example (TypeScript)
 *
 * ```typescript
 * import { parse_uri } from "pubky-app-specs";
 *
 * try {
 *   const result = parse_uri("pubky://user123/pub/pubky.app/posts/abc123");
 *   console.log(result.user_id);        // e.g. "user123"
 *   console.log(result.resource);    // e.g. "posts"
 *   console.log(result.resource_id);      // e.g. "abc123" or null
 * } catch (error) {
 *   console.error("Error parsing URI:", error);
 * }
 * ```
 */
export function parse_uri(uri: string): ParsedUriResult;
/**
 * Validate timezone string (basic IANA timezone validation)
 */
export function validateTimezone(timezone: string): boolean;
/**
 * Builds a Blob URI of the form "pubky://<author_id>/pub/pubky.app/blobs/<blob_id>"
 */
export function blobUriBuilder(author_id: string, blob_id: string): string;
/**
 * Builds a File URI of the form "pubky://<author_id>/pub/pubky.app/files/<file_id>"
 */
export function fileUriBuilder(author_id: string, file_id: string): string;
/**
 * Builds an Event URI of the form "pubky://<author_id>/pub/eventky.app/events/<event_id>"
 */
export function eventUriBuilder(author_id: string, event_id: string): string;
/**
 * Builds a LastRead URI of the form "pubky://<author_id>/pub/pubky.app/last_read"
 */
export function lastReadUriBuilder(author_id: string): string;
/**
 * Builds a Mute URI of the form "pubky://<author_id>/pub/pubky.app/mutes/<mute_id>"
 */
export function muteUriBuilder(author_id: string, mute_id: string): string;
/**
 * Builds a Post URI of the form "pubky://<author_id>/pub/pubky.app/posts/<post_id>"
 */
export function postUriBuilder(author_id: string, post_id: string): string;
/**
 * Builds a Follow URI of the form "pubky://<author_id>/pub/pubky.app/follows/<follow_id>"
 */
export function followUriBuilder(author_id: string, follow_id: string): string;
export function baseUriBuilder(user_id: string): string;
/**
 * Builds a Tag URI of the form "pubky://<author_id>/pub/pubky.app/tags/<tag_id>"
 */
export function tagUriBuilder(author_id: string, tag_id: string): string;
/**
 * Builds an Eventky base URI of the form "pubky://<user_id>/pub/eventky.app/"
 */
export function eventkyBaseUriBuilder(user_id: string): string;
/**
 * Builds a Feed URI of the form "pubky://<author_id>/pub/pubky.app/feeds/<feed_id>"
 */
export function feedUriBuilder(author_id: string, feed_id: string): string;
/**
 * Builds a Calendar URI of the form "pubky://<author_id>/pub/eventky.app/calendars/<calendar_id>"
 */
export function calendarUriBuilder(author_id: string, calendar_id: string): string;
/**
 * Builds an User URI of the form "pubky://<user_pubky_id>/pub/pubky.app/profile.json"
 */
export function userUriBuilder(user_id: string): string;
/**
 * Builds a Bookmark URI of the form "pubky://<author_id>/pub/pubky.app/bookmarks/<bookmark_id>"
 */
export function bookmarkUriBuilder(author_id: string, bookmark_id: string): string;
/**
 * Builds an Attendee URI of the form "pubky://<author_id>/pub/eventky.app/attendees/<attendee_id>"
 */
export function attendeeUriBuilder(author_id: string, attendee_id: string): string;
/**
 * Enum representing the layout of the feed.
 */
export enum PubkyAppFeedLayout {
  Columns = 0,
  Wide = 1,
  Visual = 2,
}
/**
 * Enum representing the reach of the feed.
 */
export enum PubkyAppFeedReach {
  Following = 0,
  Followers = 1,
  Friends = 2,
  All = 3,
}
/**
 * Enum representing the sort order of the feed.
 */
export enum PubkyAppFeedSort {
  Recent = 0,
  Popularity = 1,
}
/**
 * Represents the type of pubky-app posted data
 * Used primarily to best display the content in UI
 */
export enum PubkyAppPostKind {
  Short = 0,
  Long = 1,
  Image = 2,
  Video = 3,
  Link = 4,
  File = 5,
}
export class AttendeeResult {
  private constructor();
  free(): void;
  readonly meta: Meta;
  readonly attendee: PubkyAppAttendee;
}
export class BlobResult {
  private constructor();
  free(): void;
  readonly blob: PubkyAppBlob;
  readonly meta: Meta;
}
export class BookmarkResult {
  private constructor();
  free(): void;
  readonly meta: Meta;
  readonly bookmark: PubkyAppBookmark;
}
export class CalendarResult {
  private constructor();
  free(): void;
  readonly meta: Meta;
  readonly calendar: PubkyAppCalendar;
}
export class EventResult {
  private constructor();
  free(): void;
  readonly meta: Meta;
  readonly event: PubkyAppEvent;
}
export class FeedResult {
  private constructor();
  free(): void;
  readonly feed: PubkyAppFeed;
  readonly meta: Meta;
}
export class FileResult {
  private constructor();
  free(): void;
  readonly file: PubkyAppFile;
  readonly meta: Meta;
}
export class FollowResult {
  private constructor();
  free(): void;
  readonly meta: Meta;
  readonly follow: PubkyAppFollow;
}
export class LastReadResult {
  private constructor();
  free(): void;
  readonly meta: Meta;
  readonly last_read: PubkyAppLastRead;
}
/**
 * Structured location (RFC 9073 VLOCATION)
 *
 * Events can have multiple locations. First is primary.
 * Physical locations can be simple (name only) or full (with OSM link).
 *
 * # Examples
 *
 * Simple physical location:
 * ```
 * use pubky_app_specs::Location;
 *
 * let loc = Location::physical("My backyard");
 * assert_eq!(loc.name, "My backyard");
 * assert!(loc.structured_data.is_none());
 * ```
 *
 * Online meeting:
 * ```
 * use pubky_app_specs::Location;
 *
 * let loc = Location::online("Weekly Standup", "https://zoom.us/j/123456789");
 * assert_eq!(loc.name, "Weekly Standup");
 * assert_eq!(loc.structured_data.as_deref(), Some("https://zoom.us/j/123456789"));
 * ```
 */
export class Location {
  private constructor();
  free(): void;
  toJson(): any;
  static fromJson(js_value: any): Location;
  readonly description: string | undefined;
  readonly location_type: string;
  readonly structured_data: string | undefined;
  readonly name: string;
}
/**
 * Each FFI function:
 * - Accepts minimal fields in a JavaScript-friendly manner (e.g. strings, JSON).
 * - Creates the Rust model, sanitizes, and validates it.
 * - Generates the ID (if applicable).
 * - Generates the path (if applicable).
 * - Returns { json, id, path, url } or a descriptive error.
 */
export class Meta {
  private constructor();
  free(): void;
  readonly id: string;
  readonly url: string;
  readonly path: string;
}
export class MuteResult {
  private constructor();
  free(): void;
  readonly meta: Meta;
  readonly mute: PubkyAppMute;
}
/**
 * This object represents the result of parsing a Pubky URI. It contains:
 * - `user_id`: the parsed user ID as a string.
 * - `resource`: a string representing the kind of resource (derived from internal `Resource` enum Display).
 * - `resource_id`: an optional resource identifier (if applicable).
 */
export class ParsedUriResult {
  private constructor();
  free(): void;
  /**
   * Returns the resource ID if present.
   */
  readonly resource_id: string | undefined;
  /**
   * Returns the user ID.
   */
  readonly user_id: string;
  /**
   * Returns the resource kind.
   */
  readonly resource: string;
}
export class PostResult {
  private constructor();
  free(): void;
  readonly meta: Meta;
  readonly post: PubkyAppPost;
}
/**
 * Attendee - an RSVP/participation record for an event (simplified for self-RSVP only)
 * URI: /pub/eventky.app/attendees/:attendee_id
 * 
 * The attendee_id is a hash generated from:
 * - `x_pubky_event_uri`: The event this RSVP belongs to
 * - `recurrence_id`: Optional - specific instance of a recurring event
 * 
 * ## Recurring Event Support
 * 
 * For recurring events, users can have multiple attendance records:
 * 
 * 1. **Global/Default RSVP** (no `recurrence_id`):
 *    - Applies to the entire event series
 *    - Used as fallback when no instance-specific RSVP exists
 * 
 * 2. **Instance-specific RSVP** (with `recurrence_id`):
 *    - Applies only to a specific occurrence
 *    - Overrides the global RSVP for that instance
 * 
 * ## Display Priority
 * 
 * When showing attendance for an instance:
 * 1. Use instance-specific record if it exists
 * 2. Fall back to global record if no instance-specific exists
 * 
 * This simplified version only supports direct RSVP by the user themselves,
 * not delegation or organizer-created invite records.
 */
export class PubkyAppAttendee {
  free(): void;
  /**
   * Create status-specific attendees for WASM
   */
  static accepted(x_pubky_event_uri: string): PubkyAppAttendee;
  static declined(x_pubky_event_uri: string): PubkyAppAttendee;
  static tentative(x_pubky_event_uri: string): PubkyAppAttendee;
  /**
   * Update the participation status (WASM version)
   */
  updateStatus(new_partstat: string): void;
  toJson(): any;
  /**
   * Creates a new `PubkyAppAttendee` instance for WASM.
   */
  constructor(x_pubky_event_uri: string);
  static fromJson(js_value: any): PubkyAppAttendee;
  readonly x_pubky_event_uri: string;
  readonly partstat: string;
  created_at: bigint;
  get last_modified(): bigint | undefined;
  set last_modified(value: bigint | null | undefined);
}
/**
 * Represents a blob, which backs a file uploaded by the user.
 * URI: /pub/pubky.app/blobs/:blob_id
 */
export class PubkyAppBlob {
  private constructor();
  free(): void;
  toJson(): any;
  static fromJson(js_value: any): PubkyAppBlob;
  /**
   * Getter for the blob data as a `Uint8Array`.
   */
  readonly data: Uint8Array;
}
/**
 * Represents raw homeserver bookmark with id
 * URI: /pub/pubky.app/bookmarks/:bookmark_id
 *
 * Example URI:
 *
 * `/pub/pubky.app/bookmarks/AF7KQ6NEV5XV1EG5DVJ2E74JJ4`
 *
 * Where bookmark_id is Crockford-base32(Blake3("{uri_bookmarked}"")[:half])
 */
export class PubkyAppBookmark {
  private constructor();
  free(): void;
  toJson(): any;
  /**
   * Serialize to JSON for WASM.
   */
  static fromJson(js_value: any): PubkyAppBookmark;
  /**
   * Getter for `uri`.
   */
  readonly uri: string;
  created_at: bigint;
}
/**
 * Calendar container - collection of events
 * URI: /pub/eventky.app/calendars/:calendar_id
 * Where calendar_id is a timestamp-based ID (like events)
 */
export class PubkyAppCalendar {
  private constructor();
  free(): void;
  toJson(): any;
  static fromJson(js_value: any): PubkyAppCalendar;
  readonly description: string | undefined;
  readonly getLastModified: bigint | undefined;
  readonly x_pubky_authors: string[] | undefined;
  readonly url: string | undefined;
  readonly name: string;
  readonly color: string | undefined;
  readonly getCreated: bigint | undefined;
  readonly getSequence: number | undefined;
  readonly timezone: string;
  readonly image_uri: string | undefined;
  get created(): bigint | undefined;
  set created(value: bigint | null | undefined);
  get sequence(): number | undefined;
  set sequence(value: number | null | undefined);
  get last_modified(): bigint | undefined;
  set last_modified(value: bigint | null | undefined);
}
/**
 * Event - a scheduled activity or occasion
 * URI: /pub/eventky.app/events/:event_id
 * Where event_id is a timestamp-based ID for chronological ordering
 */
export class PubkyAppEvent {
  free(): void;
  /**
   * Generates a unique timestamp-based ID for the event
   */
  createId(): string;
  toJson(): any;
  /**
   * Creates a new `PubkyAppEvent` instance for WASM.
   */
  constructor(uid: string, dtstart: string, summary: string);
  static fromJson(js_value: any): PubkyAppEvent;
  readonly dtend_tzid: string | undefined;
  readonly description: string | undefined;
  readonly dtstart_tzid: string | undefined;
  readonly styled_description: StyledDescription | undefined;
  readonly x_pubky_rsvp_access: string | undefined;
  readonly x_pubky_calendar_uris: string[] | undefined;
  readonly uid: string;
  readonly url: string | undefined;
  readonly dtend: string | undefined;
  readonly rdate: string[] | undefined;
  readonly rrule: string | undefined;
  readonly exdate: string[] | undefined;
  readonly status: string | undefined;
  readonly dtstart: string;
  readonly summary: string;
  readonly duration: string | undefined;
  readonly image_uri: string | undefined;
  readonly locations: Location[] | undefined;
  dtstamp: bigint;
  get sequence(): number | undefined;
  set sequence(value: number | null | undefined);
  get last_modified(): bigint | undefined;
  set last_modified(value: bigint | null | undefined);
  get created(): bigint | undefined;
  set created(value: bigint | null | undefined);
}
/**
 * Represents a feed configuration.
 */
export class PubkyAppFeed {
  private constructor();
  free(): void;
  toJson(): any;
  /**
   * Serialize to JSON for WASM.
   */
  static fromJson(js_value: any): PubkyAppFeed;
  /**
   * Getter for `feed`.
   */
  readonly feed: PubkyAppFeedConfig;
  /**
   * Getter for `name`.
   */
  readonly name: string;
  created_at: bigint;
}
/**
 * Configuration object for the feed.
 */
export class PubkyAppFeedConfig {
  private constructor();
  free(): void;
  toJson(): any;
  static fromJson(js_value: any): PubkyAppFeedConfig;
  /**
   * Getter for `sort`.
   */
  readonly sort: PubkyAppFeedSort;
  /**
   * Getter for `tags`.
   */
  readonly tags: string[] | undefined;
  /**
   * Getter for `name`.
   */
  readonly reach: PubkyAppFeedReach;
  /**
   * Getter for `layout`.
   */
  readonly layout: PubkyAppFeedLayout;
  /**
   * Getter for `content`.
   */
  readonly content: PubkyAppPostKind | undefined;
}
/**
 * Represents a file uploaded by the user.
 * URI: /pub/pubky.app/files/:file_id
 */
export class PubkyAppFile {
  private constructor();
  free(): void;
  toJson(): any;
  static fromJson(js_value: any): PubkyAppFile;
  readonly content_type: string;
  readonly src: string;
  readonly name: string;
  created_at: bigint;
  size: number;
}
/**
 * Represents raw homeserver follow object with timestamp
 *
 * On follow objects, the main data is encoded in the path
 *
 * URI: /pub/pubky.app/follows/:user_id
 *
 * Example URI:
 *
 * `/pub/pubky.app/follows/pxnu33x7jtpx9ar1ytsi4yxbp6a5o36gwhffs8zoxmbuptici1jy`
 */
export class PubkyAppFollow {
  private constructor();
  free(): void;
  toJson(): any;
  static fromJson(js_value: any): PubkyAppFollow;
  created_at: bigint;
}
/**
 * Represents the last read timestamp for notifications.
 * URI: /pub/pubky.app/last_read
 */
export class PubkyAppLastRead {
  private constructor();
  free(): void;
  toJson(): any;
  static fromJson(js_value: any): PubkyAppLastRead;
  timestamp: bigint;
}
/**
 * Represents raw homeserver Mute object with timestamp
 * URI: /pub/pubky.app/mutes/:user_id
 *
 * Example URI:
 *
 * `/pub/pubky.app/mutes/pxnu33x7jtpx9ar1ytsi4yxbp6a5o36gwhffs8zoxmbuptici1jy`
 */
export class PubkyAppMute {
  private constructor();
  free(): void;
  toJson(): any;
  static fromJson(js_value: any): PubkyAppMute;
  created_at: bigint;
}
/**
 * Represents raw post in homeserver with content and kind
 * URI: /pub/pubky.app/posts/:post_id
 * Where post_id is CrockfordBase32 encoding of timestamp
 *
 * Example URI:
 *
 * `/pub/pubky.app/posts/00321FCW75ZFY`
 */
export class PubkyAppPost {
  free(): void;
  /**
   * Creates a new `PubkyAppPost` instance and sanitizes it.
   */
  constructor(content: string, kind: PubkyAppPostKind, parent?: string | null, embed?: PubkyAppPostEmbed | null, attachments?: string[] | null);
  toJson(): any;
  static fromJson(js_value: any): PubkyAppPost;
  readonly attachments: string[] | undefined;
  readonly kind: string;
  readonly embed: PubkyAppPostEmbed | undefined;
  readonly parent: string | undefined;
  readonly content: string;
}
/**
 * Represents embedded content within a post
 */
export class PubkyAppPostEmbed {
  free(): void;
  constructor(uri: string, kind: PubkyAppPostKind);
  readonly uri: string;
  readonly kind: string;
}
/**
 * Represents raw homeserver tag with id
 * URI: /pub/pubky.app/tags/:tag_id
 *
 * Example URI:
 *
 * `/pub/pubky.app/tags/FPB0AM9S93Q3M1GFY1KV09GMQM`
 *
 * Where tag_id is Crockford-base32(Blake3("{uri_tagged}:{label}")[:half])
 */
export class PubkyAppTag {
  private constructor();
  free(): void;
  /**
   * Serialize to JSON for WASM.
   */
  toJson(): any;
  static fromJson(js_value: any): PubkyAppTag;
  /**
   * Getter for `uri`.
   */
  readonly uri: string;
  /**
   * Getter for `label`.
   */
  readonly label: string;
  created_at: bigint;
}
/**
 * URI: /pub/pubky.app/profile.json
 */
export class PubkyAppUser {
  free(): void;
  /**
   * Creates a new `PubkyAppUser` instance and sanitizes it.
   */
  constructor(name: string, bio?: string | null, image?: string | null, links?: PubkyAppUserLink[] | null, status?: string | null);
  toJson(): any;
  static fromJson(js_value: any): PubkyAppUser;
  readonly bio: string | undefined;
  readonly name: string;
  readonly image: string | undefined;
  readonly links: PubkyAppUserLink[] | undefined;
  readonly status: string | undefined;
}
/**
 * Represents a user's single link with a title and URL.
 */
export class PubkyAppUserLink {
  free(): void;
  /**
   * Creates a new `PubkyAppUserLink` instance and sanitizes it.
   */
  constructor(title: string, url: string);
  readonly url: string;
  readonly title: string;
}
/**
 * Represents user data with name, bio, image, links, and status.
 */
export class PubkyId {
  private constructor();
  free(): void;
}
/**
 * Represents a user's single link with a title and URL.
 */
export class PubkySpecsBuilder {
  free(): void;
  createTag(uri: string, label: string): TagResult;
  createBlob(blob_data: any): BlobResult;
  createFeed(tags: any, reach: string, layout: string, sort: string, content: string | null | undefined, name: string): FeedResult;
  createFile(name: string, src: string, content_type: string, size: number): FileResult;
  createMute(mutee_id: string): MuteResult;
  createPost(content: string, kind: PubkyAppPostKind, parent?: string | null, embed?: PubkyAppPostEmbed | null, attachments?: string[] | null): PostResult;
  createUser(name: string, bio: string | null | undefined, image: string | null | undefined, links: any, status?: string | null): UserResult;
  createEvent(uid: string, dtstart: string, summary: string, dtend: string | null | undefined, duration: string | null | undefined, dtstart_tzid: string | null | undefined, dtend_tzid: string | null | undefined, description: string | null | undefined, status: string | null | undefined, image_uri: string | null | undefined, url: string | null | undefined, rrule: string | null | undefined, rdate: any, exdate: any, recurrence_id: string | null | undefined, styled_description: StyledDescription | null | undefined, x_pubky_calendar_uris: any, x_pubky_rsvp_access?: string | null): EventResult;
  createFollow(followee_id: string): FollowResult;
  createAttendee(partstat: string, x_pubky_event_uri: string, recurrence_id?: string | null): AttendeeResult;
  createBookmark(uri: string): BookmarkResult;
  createCalendar(name: string, timezone: string, color: string | null | undefined, image_uri: string | null | undefined, description: string | null | undefined, url: string | null | undefined, x_pubky_authors: any): CalendarResult;
  createLastRead(): LastReadResult;
  /**
   * Creates a new `PubkyAppBuilder` instance.
   */
  constructor(pubky_id: string);
  /**
   * Edits an existing post by updating its content while preserving its original ID and timestamp.
   */
  editPost(original_post: PubkyAppPost, post_id: string, new_content: string): PostResult;
}
/**
 * Represents styled description with metadata for rich content
 */
export class StyledDescription {
  free(): void;
  constructor(content: string, format: string, attachments?: string[] | null);
  readonly attachments: string[] | undefined;
  readonly format: string;
  readonly content: string;
}
export class TagResult {
  private constructor();
  free(): void;
  readonly tag: PubkyAppTag;
  readonly meta: Meta;
}
export class UserResult {
  private constructor();
  free(): void;
  readonly meta: Meta;
  readonly user: PubkyAppUser;
}
