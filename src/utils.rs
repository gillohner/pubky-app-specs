use crate::{
    common::*,
    traits::{HasIdPath, HasPath},
    PubkyAppAttendee, PubkyAppBlob, PubkyAppBookmark, PubkyAppCalendar, PubkyAppEvent, 
    PubkyAppFeed, PubkyAppFile, PubkyAppFollow, PubkyAppMute, PubkyAppPost, PubkyAppTag, 
    PubkyAppUser,
};

#[cfg(target_arch = "wasm32")]
use wasm_bindgen::prelude::*;

#[cfg_attr(target_arch = "wasm32", wasm_bindgen(js_name = baseUriBuilder))]
pub fn base_uri_builder(user_id: String) -> String {
    format!("{}{}{}{}", PROTOCOL, user_id, PUBLIC_PATH, APP_PATH)
}

/// Builds an User URI of the form "pubky://<user_pubky_id>/pub/pubky.app/profile.json"
#[cfg_attr(target_arch = "wasm32", wasm_bindgen(js_name = userUriBuilder))]
pub fn user_uri_builder(user_id: String) -> String {
    let user_path = PubkyAppUser::create_path();
    [PROTOCOL, &user_id, &user_path].concat()
}

/// Builds a Post URI of the form "pubky://<author_id>/pub/pubky.app/posts/<post_id>"
#[cfg_attr(target_arch = "wasm32", wasm_bindgen(js_name = postUriBuilder))]
pub fn post_uri_builder(author_id: String, post_id: String) -> String {
    let post_path = PubkyAppPost::create_path(&post_id);
    [PROTOCOL, &author_id, &post_path].concat()
}

/// Builds a Follow URI of the form "pubky://<author_id>/pub/pubky.app/follows/<follow_id>"
#[cfg_attr(target_arch = "wasm32", wasm_bindgen(js_name = followUriBuilder))]
pub fn follow_uri_builder(author_id: String, follow_id: String) -> String {
    let follow_path = PubkyAppFollow::create_path(&follow_id);
    [PROTOCOL, &author_id, &follow_path].concat()
}

/// Builds a Mute URI of the form "pubky://<author_id>/pub/pubky.app/mutes/<mute_id>"
#[cfg_attr(target_arch = "wasm32", wasm_bindgen(js_name = muteUriBuilder))]
pub fn mute_uri_builder(author_id: String, mute_id: String) -> String {
    let mute_path = PubkyAppMute::create_path(&mute_id);
    [PROTOCOL, &author_id, &mute_path].concat()
}

/// Builds a Bookmark URI of the form "pubky://<author_id>/pub/pubky.app/bookmarks/<bookmark_id>"
#[cfg_attr(target_arch = "wasm32", wasm_bindgen(js_name = bookmarkUriBuilder))]
pub fn bookmark_uri_builder(author_id: String, bookmark_id: String) -> String {
    let bookmark_path = PubkyAppBookmark::create_path(&bookmark_id);
    [PROTOCOL, &author_id, &bookmark_path].concat()
}

/// Builds a Tag URI of the form "pubky://<author_id>/pub/pubky.app/tags/<tag_id>"
#[cfg_attr(target_arch = "wasm32", wasm_bindgen(js_name = tagUriBuilder))]
pub fn tag_uri_builder(author_id: String, tag_id: String) -> String {
    let tag_path = PubkyAppTag::create_path(&tag_id);
    [PROTOCOL, &author_id, &tag_path].concat()
}

/// Builds a File URI of the form "pubky://<author_id>/pub/pubky.app/files/<file_id>"
#[cfg_attr(target_arch = "wasm32", wasm_bindgen(js_name = fileUriBuilder))]
pub fn file_uri_builder(author_id: String, file_id: String) -> String {
    let file_path = PubkyAppFile::create_path(&file_id);
    [PROTOCOL, &author_id, &file_path].concat()
}

/// Builds a Blob URI of the form "pubky://<author_id>/pub/pubky.app/blobs/<blob_id>"
#[cfg_attr(target_arch = "wasm32", wasm_bindgen(js_name = blobUriBuilder))]
pub fn blob_uri_builder(author_id: String, blob_id: String) -> String {
    let blob_path = PubkyAppBlob::create_path(&blob_id);
    [PROTOCOL, &author_id, &blob_path].concat()
}

/// Builds a Feed URI of the form "pubky://<author_id>/pub/pubky.app/feeds/<feed_id>"
#[cfg_attr(target_arch = "wasm32", wasm_bindgen(js_name = feedUriBuilder))]
pub fn feed_uri_builder(author_id: String, feed_id: String) -> String {
    let feed_path = PubkyAppFeed::create_path(&feed_id);
    [PROTOCOL, &author_id, &feed_path].concat()
}

/// Builds a LastRead URI of the form "pubky://<author_id>/pub/pubky.app/last_read"
#[cfg_attr(target_arch = "wasm32", wasm_bindgen(js_name = lastReadUriBuilder))]
pub fn last_read_uri_builder(author_id: String) -> String {
    let last_read_path = [PUBLIC_PATH, APP_PATH, "last_read"].concat();
    [PROTOCOL, &author_id, &last_read_path].concat()
}

/// Builds a Calendar URI of the form "pubky://<author_id>/pub/eventky.app/calendars/<calendar_id>"
#[cfg_attr(target_arch = "wasm32", wasm_bindgen(js_name = calendarUriBuilder))]
pub fn calendar_uri_builder(author_id: String, calendar_id: String) -> String {
    let calendar_path = PubkyAppCalendar::create_path(&calendar_id);
    [PROTOCOL, &author_id, &calendar_path].concat()
}

/// Builds an Event URI of the form "pubky://<author_id>/pub/eventky.app/events/<event_id>"
#[cfg_attr(target_arch = "wasm32", wasm_bindgen(js_name = eventUriBuilder))]
pub fn event_uri_builder(author_id: String, event_id: String) -> String {
    let event_path = PubkyAppEvent::create_path(&event_id);
    [PROTOCOL, &author_id, &event_path].concat()
}

/// Builds an Attendee URI of the form "pubky://<author_id>/pub/eventky.app/attendees/<attendee_id>"
/// TODO: Make sure this is correct id
/// Note: For attendees, the attendee_id is typically a hash of event_uri + user_id
#[cfg_attr(target_arch = "wasm32", wasm_bindgen(js_name = attendeeUriBuilder))]
pub fn attendee_uri_builder(author_id: String, attendee_id: String) -> String {
    let attendee_path = PubkyAppAttendee::create_path(&attendee_id);
    [PROTOCOL, &author_id, &attendee_path].concat()
}
