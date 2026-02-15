# Pubky App Specs — Data Model Schemas

Rust crate defining all data models for Pubky applications.
Compiled to WASM via wasm-pack for use in JavaScript/TypeScript frontends.
THIS IS THE SINGLE SOURCE OF TRUTH for all data models across the entire Eventky stack.

## Architecture
- `src/` — Rust model definitions with serde + validation
- `pkg/` — WASM output (built via wasm-pack, also published to npm as `pubky-app-specs`)
- `tests/` — Rust unit tests for validation rules
- `docs/` — Documentation for each model
- `examples/` — Usage examples

## Models (with URI paths)
- `PubkyAppUser` → `/pub/pubky.app/profile.json`
- `PubkyAppFile` → `/pub/pubky.app/files/:file_id`
- `PubkyAppPost` → `/pub/pubky.app/posts/:post_id`
- `PubkyAppTag` → `/pub/pubky.app/tags/:tag_id`
- `PubkyAppBookmark` → `/pub/pubky.app/bookmarks/:bookmark_id`
- `PubkyAppFollow` → `/pub/pubky.app/follows/:user_id`
- `PubkyAppFeed` → `/pub/pubky.app/feeds/:feed_id`
- `PubkyAppCalendar` → `/pub/eventky.app/calendars/:calendar_id` (eventky namespace)
- `PubkyAppEvent` → `/pub/eventky.app/events/:event_id` (eventky namespace)
- `PubkyAppAttendee` → `/pub/eventky.app/attendees/:attendee_id` (eventky namespace)

## ID Generation
- **Timestamp IDs**: Crockford Base32 encoded timestamps (posts, files, events, calendars)
- **Hash IDs**: Blake3 hash in Crockford Base32 (tags, bookmarks, attendees)

## Commands
- `cargo test` — Run Rust tests
- `wasm-pack build --target bundler` — Build WASM package
- `cd pkg && npm run test` — Run JS package tests
- After changes: `cd ../eventky && npm install` to pick up new WASM

## IMPORTANT Rules
- Changes here CASCADE to: pubky-nexus (recompile) AND eventky (rebuild WASM + npm install)
- All timestamp fields use Unix MICROSECONDS (not seconds, not milliseconds)
- Events follow RFC 5545/7986/9073 standards strictly
- `dtend` and `duration` are MUTUALLY EXCLUSIVE on events
- Validation is enforced at the WASM layer — invalid data cannot be written to homeservers
- RRULE must follow RFC 5545 exactly (FREQ=MONTHLY;COUNT=12)
- Attendee `partstat` values: NEEDS-ACTION, ACCEPTED, DECLINED, TENTATIVE (uppercase)
- Event `status` values: CONFIRMED, TENTATIVE, CANCELLED (uppercase)
- Location `location_type`: PHYSICAL or ONLINE only
- User `name` cannot be "[DELETED]" (reserved for deletion marker)
- Always create a feature branch: `git checkout -b feat/<description>`
- After changes, verify: `cargo test && wasm-pack build --target bundler`
