mod common;
mod constants;
mod models;
pub mod traits;
mod types;
mod uri_parser;
mod utils;
mod validation;

// Re-export constants
pub use constants::{
    APP_PATH, EVENTKY_PATH, INVALID_TAG_CHARS, MAX_SIZE, MAX_TAG_LABEL_LENGTH, MIN_TAG_LABEL_LENGTH, PROTOCOL,
    PUBLIC_PATH, VERSION,
};
// Re-export domain types
pub use models::attendee::PubkyAppAttendee;
pub use models::blob::PubkyAppBlob;
pub use models::bookmark::PubkyAppBookmark;
pub use models::calendar::{PubkyAppCalendar, StyledDescription};
pub use models::event::PubkyAppEvent;
pub use models::feed::{PubkyAppFeed, PubkyAppFeedLayout, PubkyAppFeedReach, PubkyAppFeedSort};
pub use models::file::{PubkyAppFile, VALID_MIME_TYPES};
pub use models::follow::PubkyAppFollow;
pub use models::last_read::PubkyAppLastRead;
pub use models::mute::PubkyAppMute;
pub use models::post::{PubkyAppPost, PubkyAppPostEmbed, PubkyAppPostKind};
pub use models::tag::PubkyAppTag;
pub use models::user::{PubkyAppUser, PubkyAppUserLink};
pub use models::PubkyAppObject;
pub use types::PubkyId;
pub use uri_parser::{ParsedUri, Resource};
pub use utils::*;
pub use validation::*;

// Our WASM module
#[cfg(target_arch = "wasm32")]
mod wasm;
// Re-export the Wasm functions so they're available to wasm-pack
#[cfg(target_arch = "wasm32")]
pub use wasm::*;
