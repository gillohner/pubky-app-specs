# Pubky.app Data Model Specification

_Version 0.4.0_

> ⚠️ **Warning: Rapid Development Phase**  
> This specification is in an **early development phase** and is evolving quickly. Expect frequent changes and updates as the system matures. Consider this a **v0 draft**.
>
> When we reach the first stable, long-term support version of the schemas, paths will adopt the format: `pubky.app/v1/` to indicate compatibility and stability.

### JS package

The package is available as an npm module [pubky-app-specs](https://www.npmjs.com/package/pubky-app-specs). Alternatively, you can build from source using the provided build scripts:

```bash
cd pkg
npm run build
```

Test with:

```bash
cd pkg
npm run install
npm run test
```

Examples with:

```bash
cd pkg
npm run example
```

---

## Table of Contents

- [Pubky.app Data Model Specification](#pubkyapp-data-model-specification)
    - [JS package](#js-package)
  - [Table of Contents](#table-of-contents)
  - [Introduction](#introduction)
  - [Quick Start](#quick-start)
    - [Concepts:](#concepts)
  - [Data Models](#data-models)
    - [PubkyAppUser](#pubkyappuser)
    - [PubkyAppFile](#pubkyappfile)
    - [PubkyAppPost](#pubkyapppost)
    - [PubkyAppTag](#pubkyapptag)
    - [PubkyAppBookmark](#pubkyappbookmark)
    - [PubkyAppFollow](#pubkyappfollow)
    - [PubkyAppFeed](#pubkyappfeed)
    - [PubkyAppCalendar](#pubkyappcalendar)
    - [PubkyAppEvent](#pubkyappevent)
    - [PubkyAppAttendee](#pubkyappattendee)
  - [Validation Rules](#validation-rules)
    - [Common Rules](#common-rules)
  - [License](#license)

---

## Introduction

This document specifies the data models and validation rules for the **Pubky.app** clients interactions. It defines the structure of data entities, their properties, and the validation rules to ensure data integrity and consistency. This is intended for developers building compatible libraries or clients.

This document intents to be a faithful representation of our [Rust pubky.app models](https://github.com/pubky/pubky-app-specs/tree/main/src). If you intend to develop in Rust, use them directly. In case of disagreement between this document and the Rust implementation, the Rust implementation prevails.

---

## Quick Start

Pubky.app models are designed for decentralized content sharing. The system uses a combination of timestamp-based IDs and Blake3-hashed IDs encoded in Crockford Base32 to ensure unique identifiers for each entity.

### Concepts:

- **Timestamp IDs** for sequential objects like posts and files.
- **Hash IDs** for content-based uniqueness (e.g., tags and bookmarks).
- **Validation Rules** ensure consistent and interoperable data formats.

---

## Data Models

### PubkyAppUser

**Description:** Represents a user's profile information.

**URI:** `/pub/pubky.app/profile.json`

| **Field** | **Type** | **Description**                         | **Validation Rules**                                                                         |
| --------- | -------- | --------------------------------------- | -------------------------------------------------------------------------------------------- |
| `name`    | String   | User's name.                            | Required. Length: 3–50 characters. Cannot be `"[DELETED]"`.                                  |
| `bio`     | String   | Short biography.                        | Optional. Maximum length: 160 characters.                                                    |
| `image`   | String   | URL to the user's profile image.        | Optional. Valid URL. Maximum length: 300 characters.                                         |
| `links`   | Array    | List of associated links (title + URL). | Optional. Maximum of 5 links, each with title (100 chars max) and valid URL (300 chars max). |
| `status`  | String   | User's current status.                  | Optional. Maximum length: 50 characters.                                                     |

**Validation Notes:**

- Reserved keyword `[DELETED]` cannot be used for `name`.
- Each `UserLink` in `links` must have a valid title and URL.

**Example: Valid User**

```json
{
  "name": "Alice",
  "bio": "Toxic maximalist.",
  "image": "pubky://user_id/pub/pubky.app/files/0000000000000",
  "links": [
    {
      "title": "GitHub",
      "url": "https://github.com/alice"
    }
  ],
  "status": "Exploring decentralized tech."
}
```

---

### PubkyAppFile

**Description:** Represents a file uploaded by the user, containing its metadata, including a reference to the actual blob of the file in `src` property.

**URI:** `/pub/pubky.app/files/:file_id`

| **Field**      | **Type** | **Description**             | **Validation Rules**                           |
| -------------- | -------- | --------------------------- | ---------------------------------------------- |
| `name`         | String   | Name of the file.           | Required. Must be 1-255 characters             |
| `created_at`   | Integer  | Unix timestamp of creation. | Required.                                      |
| `src`          | String   | File blob URL               | Required. must be a valid URL. Max length 1024 |
| `content_type` | String   | MIME type of the file.      | Required. Valid IANA mime types                |
| `size`         | Integer  | Size of the file in bytes.  | Required. Positive integer. Max size is 10Mb   |

**Validation Notes:**

- The `file_id` in the URI must be a valid **Timestamp ID**.

---

### PubkyAppPost

**Description:** Represents a user's post.

**URI:** `/pub/pubky.app/posts/:post_id`

| **Field**     | **Type** | **Description**                      | **Validation Rules**                                                       |
| ------------- | -------- | ------------------------------------ | -------------------------------------------------------------------------- |
| `content`     | String   | Content of the post.                 | Required. Max length: 2000 (short), 50000 (long). Cannot be `"[DELETED]"`. |
| `kind`        | String   | Type of post.                        | Required. Must be a valid `PubkyAppPostKind` value.                        |
| `parent`      | String   | URI of the parent post (if a reply). | Optional. Must be a valid URI if present.                                  |
| `embed`       | Object   | Reposted content (type + URI).       | Optional. URI must be valid if present.                                    |
| `attachments` | Array    | List of attachment URIs.             | Optional. Each must be a valid URI.                                        |

**Post Kinds:**

- `short`
- `long`
- `image`
- `video`
- `link`
- `file`

**Example: Valid Post**

```json
{
  "content": "Hello world! This is my first post.",
  "kind": "short",
  "parent": null,
  "embed": {
    "kind": "short",
    "uri": "pubky://user_id/pub/pubky.app/posts/0000000000000"
  },
  "attachments": ["pubky://user_id/pub/pubky.app/files/0000000000000"]
}
```

---

### PubkyAppTag

**Description:** Represents a tag applied to a URI.

**URI:** `/pub/pubky.app/tags/:tag_id`

| **Field**    | **Type** | **Description**             | **Validation Rules**                                     |
| ------------ | -------- | --------------------------- | -------------------------------------------------------- |
| `uri`        | String   | URI of the tagged object.   | Required. Must be a valid URI.                           |
| `label`      | String   | Label for the tag.          | Required. Trimmed, lowercase. Max length: 20 characters. |
| `created_at` | Integer  | Unix timestamp of creation. | Required.                                                |

**Validation Notes:**

- The `tag_id` is a **Hash ID** derived from the `uri` and `label`.

---

### PubkyAppBookmark

**Description:** Represents a bookmark to a URI.

**URI:** `/pub/pubky.app/bookmarks/:bookmark_id`

| **Field**    | **Type** | **Description**        | **Validation Rules**           |
| ------------ | -------- | ---------------------- | ------------------------------ |
| `uri`        | String   | URI of the bookmark.   | Required. Must be a valid URI. |
| `created_at` | Integer  | Timestamp of creation. | Required.                      |

**Validation Notes:**

- The `bookmark_id` is a **Hash ID** derived from the `uri`.

---

### PubkyAppFollow

**Description:** Represents a follow relationship.

**URI:** `/pub/pubky.app/follows/:user_id`

| **Field**    | **Type** | **Description**        | **Validation Rules** |
| ------------ | -------- | ---------------------- | -------------------- |
| `created_at` | Integer  | Timestamp of creation. | Required.            |

---

### PubkyAppFeed

**Description:** Represents a feed configuration.

**URI:** `/pub/pubky.app/feeds/:feed_id`

| **Field** | **Type** | **Description**                           | **Validation Rules**               |
| --------- | -------- | ----------------------------------------- | ---------------------------------- |
| `tags`    | Array    | List of tags for filtering.               | Optional. Strings must be trimmed. |
| `reach`   | String   | Feed visibility (e.g., `all`, `friends`). | Required. Must be a valid reach.   |
| `layout`  | String   | Feed layout style (e.g., `columns`).      | Required. Must be valid layout.    |
| `sort`    | String   | Sort order (e.g., `recent`).              | Required. Must be valid sort.      |
| `content` | String   | Type of content filtered.                 | Optional.                          |
| `name`    | String   | Name of the feed.                         | Required.                          |

---

### PubkyAppCalendar

**Description:** Represents a calendar container for events. Based on RFC 5545 (iCalendar) and RFC 7986 (Calendar Properties).

**URI:** `/pub/eventky.app/calendars/:calendar_id`

| **Field**          | **Type** | **Description**                              | **Validation Rules**                                        |
| ------------------ | -------- | -------------------------------------------- | ----------------------------------------------------------- |
| `name`             | String   | Calendar display name.                       | Required. Length: 1-100 characters.                         |
| `timezone`         | String   | IANA timezone ID.                            | Required. Must be valid IANA timezone (e.g., "Europe/Zurich"). |
| `color`            | String   | CSS color value for display.                 | Optional. Must be hex format (#RRGGBB).                     |
| `image_uri`        | String   | Calendar image/logo URI.                     | Optional. Valid URI (pubky:// or https).                    |
| `description`      | String   | Calendar description.                        | Optional. Maximum length: 10,000 characters.                |
| `url`              | String   | Calendar homepage/details URL.               | Optional. Must be valid URL.                                |
| `created`          | Integer  | Creation timestamp (Unix microseconds).      | Optional.                                                   |
| `sequence`         | Integer  | Version number for edit tracking.            | Optional. Incremented on each edit.                         |
| `last_modified`    | Integer  | Last modification timestamp.                 | Optional.                                                   |
| `x_pubky_authors`  | Array    | Pubky URIs of users who can add events.      | Optional. Maximum 20 authors.                               |

**Validation Notes:**

- The `calendar_id` in the URI must be a valid **Timestamp ID**.
- Only the calendar owner can edit the calendar itself; authors can only add events.

**Example: Valid Calendar**

```json
{
  "name": "Bitcoin Meetups Zurich",
  "timezone": "Europe/Zurich",
  "color": "#F7931A",
  "description": "Monthly Bitcoin meetups in the Zurich area.",
  "url": "https://bitcoinzurich.ch",
  "created": 1727740800000000,
  "sequence": 0,
  "last_modified": 1727740800000000
}
```

---

### PubkyAppEvent

**Description:** Represents a scheduled event or activity. Based on RFC 5545 (iCalendar), RFC 7986 (Event Extensions), and RFC 9073 (Structured Locations).

**URI:** `/pub/eventky.app/events/:event_id`

| **Field**               | **Type** | **Description**                                | **Validation Rules**                                              |
| ----------------------- | -------- | ---------------------------------------------- | ----------------------------------------------------------------- |
| `uid`                   | String   | Globally unique identifier.                    | Required. Length: 1-255 characters.                               |
| `dtstamp`               | Integer  | Creation timestamp (Unix microseconds).        | Required.                                                         |
| `dtstart`               | String   | Start date-time.                               | Required. ISO 8601 format (YYYY-MM-DDTHH:MM:SS).                  |
| `summary`               | String   | Event title/subject.                           | Required. Length: 1-500 characters.                               |
| `dtend`                 | String   | End date-time.                                 | Optional. ISO 8601 format. Mutually exclusive with `duration`.    |
| `duration`              | String   | Event duration.                                | Optional. RFC 5545 format (e.g., "PT1H30M"). Mutually exclusive with `dtend`. |
| `dtstart_tzid`          | String   | IANA timezone for start time.                  | Optional. Must be valid IANA timezone.                            |
| `dtend_tzid`            | String   | IANA timezone for end time.                    | Optional. Must be valid IANA timezone.                            |
| `description`           | String   | Plain text description.                        | Optional. Maximum length: 10,000 characters.                      |
| `status`                | String   | Event status.                                  | Optional. Must be: `CONFIRMED`, `TENTATIVE`, or `CANCELLED`.      |
| `locations`             | Array    | Structured locations (RFC 9073).               | Optional. Maximum 5 locations. First is primary.                  |
| `image_uri`             | String   | Event image/banner URI.                        | Optional. Valid URI.                                              |
| `url`                   | String   | Event homepage/details link.                   | Optional. Must be valid URL.                                      |
| `sequence`              | Integer  | Version number for modifications.              | Optional.                                                         |
| `last_modified`         | Integer  | Last modification timestamp.                   | Optional.                                                         |
| `created`               | Integer  | Creation timestamp.                            | Optional.                                                         |
| `rrule`                 | String   | Recurrence rule.                               | Optional. RFC 5545 RRULE format.                                  |
| `rdate`                 | Array    | Additional recurrence dates.                   | Optional. ISO 8601 datetime strings.                              |
| `exdate`                | Array    | Excluded recurrence dates.                     | Optional. ISO 8601 datetime strings.                              |
| `recurrence_id`         | String   | Specific recurrence instance.                  | Optional. ISO 8601 datetime.                                      |
| `styled_description`    | Object   | Rich formatted description.                    | Optional. Contains `content`, `format`, `attachments`.            |
| `x_pubky_calendar_uris` | Array    | URIs of calendars containing this event.       | Optional. Maximum 10 calendar URIs.                               |
| `x_pubky_rsvp_access`   | String   | RSVP access control.                           | Optional. Currently only `PUBLIC` is valid.                       |

**Location Object:**

| **Field**         | **Type** | **Description**                   | **Validation Rules**                           |
| ----------------- | -------- | --------------------------------- | ---------------------------------------------- |
| `name`            | String   | Human-readable location name.     | Required. Maximum 500 characters.              |
| `description`     | String   | Additional details/instructions.  | Optional. Maximum 2000 characters.             |
| `location_type`   | String   | Type of location.                 | Required. `PHYSICAL` or `ONLINE`.              |
| `structured_data` | String   | URI reference (OSM URL or meeting link). | Optional. Maximum 2048 characters.      |

**Validation Notes:**

- The `event_id` in the URI must be a valid **Timestamp ID**.
- `dtend` and `duration` are mutually exclusive.
- For recurring events, use `rrule` for patterns and `rdate`/`exdate` for exceptions.

**Example: Valid Event**

```json
{
  "uid": "0034JZW17NBFG",
  "dtstamp": 1769661838218000,
  "dtstart": "2026-01-22T18:30:30",
  "dtstart_tzid": "Europe/Zurich",
  "summary": "Bitcoin Weesen",
  "description": "Monthly Bitcoin meetup in Weesen.",
  "status": "CONFIRMED",
  "locations": [
    {
      "name": "Trattoria Walensee",
      "description": "Meeting on the 1st floor.",
      "location_type": "PHYSICAL",
      "structured_data": "https://www.openstreetmap.org/node/3459785276"
    }
  ],
  "url": "https://www.bitcoinweesen.ch/",
  "rrule": "FREQ=MONTHLY;COUNT=12",
  "x_pubky_calendar_uris": [
    "pubky://c5nr657md9g8mut1xhjgf9h3cxaio3et9xyupo4fsgi5f7etocey/pub/eventky.app/calendars/0034F0CQGAWR0"
  ],
  "x_pubky_rsvp_access": "PUBLIC"
}
```

---

### PubkyAppAttendee

**Description:** Represents an RSVP/attendance record for an event. Simplified to support self-RSVP only.

**URI:** `/pub/eventky.app/attendees/:attendee_id`

| **Field**            | **Type** | **Description**                           | **Validation Rules**                                         |
| -------------------- | -------- | ----------------------------------------- | ------------------------------------------------------------ |
| `partstat`           | String   | Participation status.                     | Required. Must be: `NEEDS-ACTION`, `ACCEPTED`, `DECLINED`, or `TENTATIVE`. |
| `created_at`         | Integer  | Creation timestamp (Unix microseconds).   | Required.                                                    |
| `last_modified`      | Integer  | Last modification timestamp.              | Optional.                                                    |
| `recurrence_id`      | String   | Specific instance of recurring event.     | Optional. ISO 8601 datetime.                                 |
| `x_pubky_event_uri`  | String   | URI of the event this RSVP belongs to.    | Required. Must be valid Pubky event URI.                     |

**Validation Notes:**

- The `attendee_id` is a **Hash ID** derived from `x_pubky_event_uri` and optionally `recurrence_id`.
- For recurring events:
  - A global RSVP (no `recurrence_id`) applies to the entire series.
  - An instance-specific RSVP (with `recurrence_id`) overrides the global for that instance.

**Example: Valid Attendee (RSVP)**

```json
{
  "partstat": "ACCEPTED",
  "created_at": 1769661900000000,
  "last_modified": 1769661900000000,
  "x_pubky_event_uri": "pubky://51da3n5m8s6oaq38uqs7jznp6ezbc3qbtmic8oy6fj3g6mokdyco/pub/eventky.app/events/0034JZW17NBFG"
}
```

**Example: Instance-specific RSVP for recurring event**

```json
{
  "partstat": "DECLINED",
  "created_at": 1769661900000000,
  "recurrence_id": "2026-02-19T18:30:21",
  "x_pubky_event_uri": "pubky://51da3n5m8s6oaq38uqs7jznp6ezbc3qbtmic8oy6fj3g6mokdyco/pub/eventky.app/events/0034JZW17NBFG"
}

---

## Validation Rules

### Common Rules

1. **Timestamp IDs:** 13-character Crockford Base32 strings derived from timestamps (in microseconds).
2. **Hash IDs:** First half of the bytes from the resulting Blake3-hashed strings encoded in Crockford Base32.
3. **URLs:** All URLs must pass standard validation.

---

## License

This specification is released under the MIT License.
