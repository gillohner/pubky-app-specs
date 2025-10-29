use crate::{
    traits::{HasIdPath, TimestampId, Validatable},
    APP_PATH, PUBLIC_PATH,
};
use serde::{Deserialize, Serialize};
use url::Url;

#[cfg(target_arch = "wasm32")]
use crate::traits::Json;
#[cfg(target_arch = "wasm32")]
use wasm_bindgen::prelude::*;

#[cfg(feature = "openapi")]
use utoipa::ToSchema;

// Validation constants
const MAX_SUMMARY_LENGTH: usize = 255;
const MAX_DESCRIPTION_LENGTH: usize = 5000;

/// RFC 5545 Organizer - represents event organizer
/// The organizer's name is fetched from their profile.json, not stored here
#[derive(Serialize, Deserialize, Clone, Debug, Default, PartialEq)]
#[cfg_attr(feature = "openapi", derive(ToSchema))]
pub struct Organizer {
    /// Pubky URI of the organizer (REQUIRED)
    pub uri: String,
    /// Pubky URI of delegate sending on behalf of organizer
    pub sent_by: Option<String>,
}

/// RFC 7986 Conference - video/audio conference details
#[derive(Serialize, Deserialize, Clone, Debug, Default, PartialEq)]
#[cfg_attr(feature = "openapi", derive(ToSchema))]
pub struct Conference {
    /// Conference URL - Zoom, Google Meet, etc. (REQUIRED)
    pub uri: String,
    /// Human-readable label (e.g., "Zoom Meeting", "Google Meet")
    pub label: Option<String>,
    /// Conference features: AUDIO, VIDEO, CHAT, SCREEN, etc.
    pub features: Option<Vec<String>>,
}

/// RFC 9073 VLOCATION - structured location component (repeatable)
/// Enables complex events with multiple locations (venue, parking, virtual, etc.)
#[derive(Serialize, Deserialize, Clone, Debug, Default, PartialEq)]
#[cfg_attr(feature = "openapi", derive(ToSchema))]
pub struct VLocation {
    /// Location name (REQUIRED) - e.g., "Insider Bar", "Parking Lot B"
    pub name: String,
    /// RFC 9073 LOCATION-TYPE: ARRIVAL, DEPARTURE, PARKING, VIRTUAL, etc.
    pub location_type: Option<String>,
    /// Street address - e.g., "Münstergasse 20, 8001 Zürich"
    pub address: Option<String>,
    /// Reference URI - OSM node, website, geo URI, etc.
    pub uri: Option<String>,
    /// Additional details - e.g., "Second floor, near the bar"
    pub description: Option<String>,
}

/// RFC 9073 Styled Description - formatted content with metadata
#[derive(Serialize, Deserialize, Clone, Debug, Default, PartialEq)]
#[cfg_attr(feature = "openapi", derive(ToSchema))]
pub struct StyledDescription {
    /// Media type - e.g., "text/html", "text/markdown"
    pub fmttype: Option<String>,
    /// The styled content (REQUIRED)
    pub value: String,
    /// RFC 9073 - TRUE if auto-derived from plain DESCRIPTION
    pub derived: Option<bool>,
    /// RFC 9073 - Alternate representation URI
    pub altrep: Option<String>,
    /// RFC 9073 - Language tag (e.g., "en-US")
    pub language: Option<String>,
}

/// Represents an event (scheduled activity or occasion) in the Pubky ecosystem.
///
/// This struct implements RFC 5545 (iCalendar VEVENT), RFC 7986 (New Properties),
/// and RFC 9073 (Event Publishing Extensions).
///
/// # Storage Path
/// `/pub/pubky.app/event/:event_id`
///
/// Where `:event_id` is the Crockford base32 encoding of the event's creation timestamp.
///
/// # Example
/// ```json
/// {
///   "uid": "pubky://user123/pub/pubky.app/event/ABC123",
///   "dtstamp": 1730185200000000,
///   "dtstart": 1730271600000000,
///   "summary": "Bitcoin Meetup Zürich",
///   "status": "CONFIRMED",
///   "location": "Insider Bar, Münstergasse 20, Zürich",
///   "geo": "47.366667;8.550000",
///   "organizer": {
///     "uri": "pubky://organizer123"
///   },
///   "x_pubky_calendar_uris": ["pubky://user123/pub/pubky.app/calendar/CAL123"]
/// }
/// ```
#[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
#[derive(Serialize, Deserialize, Default, Clone, Debug)]
#[cfg_attr(feature = "openapi", derive(ToSchema))]
pub struct PubkyAppEvent {
    // ============================================================================
    // RFC 5545 - Core Event Properties (REQUIRED)
    // ============================================================================
    
    /// Globally unique identifier for this event (REQUIRED)
    /// Must be a valid URI (typically a pubky:// URI)
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub uid: String,
    
    /// Creation/last-modified timestamp in Unix microseconds (REQUIRED)
    /// Should be updated whenever the event is modified
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub dtstamp: i64,
    
    /// Event start timestamp in Unix microseconds (REQUIRED)
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub dtstart: i64,
    
    /// Event title/subject (REQUIRED)
    /// Max length: 255 characters
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub summary: String,

    // ============================================================================
    // RFC 5545 - Time & Duration
    // ============================================================================
    
    /// Event end timestamp in Unix microseconds
    /// Mutually exclusive with `duration`
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub dtend: Option<i64>,
    
    /// RFC 5545 duration format (e.g., "PT1H30M")
    /// Mutually exclusive with `dtend`
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub duration: Option<String>,
    
    /// IANA timezone ID for dtstart (e.g., "Europe/Zurich")
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub dtstart_tzid: Option<String>,
    
    /// IANA timezone ID for dtend
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub dtend_tzid: Option<String>,

    // ============================================================================
    // RFC 5545 - Event Details
    // ============================================================================
    
    /// Plain text event description
    /// Max length: 5000 characters
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub description: Option<String>,
    
    /// Event status: CONFIRMED | TENTATIVE | CANCELLED
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub status: Option<String>,
    
    /// Event organizer details
    /// Name is fetched from organizer's profile.json
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub organizer: Option<Organizer>,
    
    /// Event categories/tags for classification
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub categories: Option<Vec<String>>,

    // ============================================================================
    // RFC 5545 - Location (Three-tier approach)
    // ============================================================================
    
    /// Primary location text (RFC 5545 LOCATION property)
    /// Single-line human-readable location for event listings
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub location: Option<String>,
    
    /// Geographic coordinates "latitude;longitude" (RFC 5545 GEO property)
    /// For map display and proximity search
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub geo: Option<String>,
    
    /// Structured location data (RFC 9073 VLOCATION components)
    /// Repeatable for complex events with multiple locations
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub structured_locations: Option<Vec<VLocation>>,

    // ============================================================================
    // RFC 7986 - Event Publishing Extensions
    // ============================================================================
    
    /// Event image/banner URI
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub image_uri: Option<String>,
    
    /// Event homepage/details link
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub url: Option<String>,
    
    /// Video/audio conference details
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub conference: Option<Conference>,

    // ============================================================================
    // RFC 5545 - Change Management
    // ============================================================================
    
    /// Version number - increment on modifications
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub sequence: Option<i32>,
    
    /// Last modification timestamp in Unix microseconds
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub last_modified: Option<i64>,
    
    /// Creation timestamp in Unix microseconds
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub created: Option<i64>,

    // ============================================================================
    // RFC 5545 - Recurrence
    // ============================================================================
    
    /// Recurrence rule in RFC 5545 format (e.g., "FREQ=WEEKLY;BYDAY=MO,WE,FR")
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub rrule: Option<String>,
    
    /// Additional recurrence dates
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub rdate: Option<Vec<String>>,
    
    /// Excluded recurrence dates (exceptions)
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub exdate: Option<Vec<String>>,
    
    /// Identifies specific recurrence instance
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub recurrence_id: Option<i64>,

    // ============================================================================
    // RFC 9073 - Rich Content
    // ============================================================================
    
    /// Formatted description with metadata (HTML, Markdown, etc.)
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub styled_description: Option<StyledDescription>,

    // ============================================================================
    // Pubky Extensions (all custom fields use x_pubky_ prefix)
    // ============================================================================
    
    /// URIs of calendars containing this event (supports multi-calendar)
    /// Each URI should be a valid pubky:// URI
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub x_pubky_calendar_uris: Option<Vec<String>>,
    
    /// RSVP access control: "PUBLIC" (default, anyone can RSVP)
    /// Future: "INVITE_ONLY", "CONFIRMED_ONLY"
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub x_pubky_rsvp_access: Option<String>,
}

#[cfg(target_arch = "wasm32")]
#[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
impl PubkyAppEvent {
    // Core required fields (non-Optional)
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn uid(&self) -> String {
        self.uid.clone()
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn dtstamp(&self) -> i64 {
        self.dtstamp
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn dtstart(&self) -> i64 {
        self.dtstart
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn summary(&self) -> String {
        self.summary.clone()
    }

    // Time & Duration
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn dtend(&self) -> Option<i64> {
        self.dtend
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn duration(&self) -> Option<String> {
        self.duration.clone()
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn dtstart_tzid(&self) -> Option<String> {
        self.dtstart_tzid.clone()
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn dtend_tzid(&self) -> Option<String> {
        self.dtend_tzid.clone()
    }

    // Event Details
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn description(&self) -> Option<String> {
        self.description.clone()
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn status(&self) -> Option<String> {
        self.status.clone()
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn categories(&self) -> Option<Vec<String>> {
        self.categories.clone()
    }

    // Location
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn location(&self) -> Option<String> {
        self.location.clone()
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn geo(&self) -> Option<String> {
        self.geo.clone()
    }

    // Publishing
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn image_uri(&self) -> Option<String> {
        self.image_uri.clone()
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn url(&self) -> Option<String> {
        self.url.clone()
    }

    // Change Management
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn sequence(&self) -> Option<i32> {
        self.sequence
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn last_modified(&self) -> Option<i64> {
        self.last_modified
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn created(&self) -> Option<i64> {
        self.created
    }

    // Recurrence
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn rrule(&self) -> Option<String> {
        self.rrule.clone()
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn rdate(&self) -> Option<Vec<String>> {
        self.rdate.clone()
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn exdate(&self) -> Option<Vec<String>> {
        self.exdate.clone()
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn recurrence_id(&self) -> Option<i64> {
        self.recurrence_id
    }

    // Pubky Extensions
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn x_pubky_calendar_uris(&self) -> Option<Vec<String>> {
        self.x_pubky_calendar_uris.clone()
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn x_pubky_rsvp_access(&self) -> Option<String> {
        self.x_pubky_rsvp_access.clone()
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(js_name = fromJson))]
    pub fn from_json(js_value: &JsValue) -> Result<Self, String> {
        Self::import_json(js_value)
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(js_name = toJson))]
    pub fn to_json(&self) -> Result<JsValue, String> {
        self.export_json()
    }
}

#[cfg(target_arch = "wasm32")]
impl Json for PubkyAppEvent {}

#[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
impl PubkyAppEvent {
    /// Creates a new `PubkyAppEvent` instance and sanitizes it.
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(constructor))]
    #[allow(clippy::too_many_arguments)]
    pub fn new(
        // Required fields
        uid: String,
        dtstamp: i64,
        dtstart: i64,
        summary: String,
        // Time & Duration
        dtend: Option<i64>,
        duration: Option<String>,
        dtstart_tzid: Option<String>,
        dtend_tzid: Option<String>,
        // Event Details
        description: Option<String>,
        status: Option<String>,
        categories: Option<Vec<String>>,
        // Location
        location: Option<String>,
        geo: Option<String>,
        // Publishing
        image_uri: Option<String>,
        url: Option<String>,
        // Change Management
        sequence: Option<i32>,
        last_modified: Option<i64>,
        created: Option<i64>,
        // Recurrence
        rrule: Option<String>,
        rdate: Option<Vec<String>>,
        exdate: Option<Vec<String>>,
        recurrence_id: Option<i64>,
        // Pubky Extensions
        x_pubky_calendar_uris: Option<Vec<String>>,
        x_pubky_rsvp_access: Option<String>,
    ) -> Self {
        let event = PubkyAppEvent {
            uid,
            dtstamp,
            dtstart,
            summary,
            dtend,
            duration,
            dtstart_tzid,
            dtend_tzid,
            description,
            status,
            organizer: None,
            categories,
            location,
            geo,
            structured_locations: None,
            image_uri,
            url,
            conference: None,
            sequence,
            last_modified,
            created,
            rrule,
            rdate,
            exdate,
            recurrence_id,
            styled_description: None,
            x_pubky_calendar_uris,
            x_pubky_rsvp_access,
        };
        event.sanitize()
    }
}

impl TimestampId for PubkyAppEvent {}

impl HasIdPath for PubkyAppEvent {
    const PATH_SEGMENT: &'static str = "event/";

    fn create_path(id: &str) -> String {
        [PUBLIC_PATH, APP_PATH, Self::PATH_SEGMENT, id].concat()
    }
}

impl Validatable for PubkyAppEvent {
    fn sanitize(self) -> Self {
        // Sanitize required fields
        let uid = if let Ok(url) = Url::parse(&self.uid) {
            url.to_string()
        } else {
            self.uid
        };

        let summary = self
            .summary
            .chars()
            .take(MAX_SUMMARY_LENGTH)
            .collect::<String>()
            .trim()
            .to_string();

        // Sanitize optional text fields
        let description = self.description.map(|s| {
            s.chars()
                .take(MAX_DESCRIPTION_LENGTH)
                .collect::<String>()
                .trim()
                .to_string()
        });

        let status = self.status.map(|s| s.trim().to_uppercase());
        let location = self.location.map(|s| s.trim().to_string());
        let geo = self.geo.map(|s| s.trim().to_string());
        let duration = self.duration.map(|s| s.trim().to_string());
        let rrule = self.rrule.map(|s| s.trim().to_string());
        let x_pubky_rsvp_access = self.x_pubky_rsvp_access.map(|s| s.trim().to_uppercase());

        // Sanitize URIs
        let image_uri = self
            .image_uri
            .and_then(|uri| Url::parse(&uri).ok().map(|url| url.to_string()));

        let url = self
            .url
            .and_then(|uri| Url::parse(&uri).ok().map(|url| url.to_string()));

        // Sanitize calendar URIs
        let x_pubky_calendar_uris = self.x_pubky_calendar_uris.map(|uris| {
            uris.iter()
                .filter_map(|uri| Url::parse(uri).ok().map(|url| url.to_string()))
                .collect()
        });

        // Sanitize organizer
        let organizer = self.organizer.map(|org| Organizer {
            uri: Url::parse(&org.uri)
                .ok()
                .map(|url| url.to_string())
                .unwrap_or(org.uri),
            sent_by: org
                .sent_by
                .and_then(|uri| Url::parse(&uri).ok().map(|url| url.to_string())),
        });

        // Sanitize conference
        let conference = self.conference.map(|conf| Conference {
            uri: Url::parse(&conf.uri)
                .ok()
                .map(|url| url.to_string())
                .unwrap_or(conf.uri),
            label: conf.label.map(|s| s.trim().to_string()),
            features: conf.features,
        });

        // Sanitize structured locations
        let structured_locations = self.structured_locations.map(|locs| {
            locs.iter()
                .map(|loc| VLocation {
                    name: loc.name.trim().to_string(),
                    location_type: loc.location_type.as_ref().map(|s| s.trim().to_string()),
                    address: loc.address.as_ref().map(|s| s.trim().to_string()),
                    uri: loc
                        .uri
                        .as_ref()
                        .and_then(|uri| Url::parse(uri).ok().map(|url| url.to_string())),
                    description: loc.description.as_ref().map(|s| s.trim().to_string()),
                })
                .collect()
        });

        // Sanitize styled description
        let styled_description = self.styled_description.map(|desc| StyledDescription {
            fmttype: desc.fmttype.map(|s| s.trim().to_string()),
            value: desc.value.trim().to_string(),
            derived: desc.derived,
            altrep: desc
                .altrep
                .and_then(|uri| Url::parse(&uri).ok().map(|url| url.to_string())),
            language: desc.language.map(|s| s.trim().to_string()),
        });

        PubkyAppEvent {
            uid,
            dtstamp: self.dtstamp,
            dtstart: self.dtstart,
            summary,
            dtend: self.dtend,
            duration,
            dtstart_tzid: self.dtstart_tzid,
            dtend_tzid: self.dtend_tzid,
            description,
            status,
            organizer,
            categories: self.categories,
            location,
            geo,
            structured_locations,
            image_uri,
            url,
            conference,
            sequence: self.sequence,
            last_modified: self.last_modified,
            created: self.created,
            rrule,
            rdate: self.rdate,
            exdate: self.exdate,
            recurrence_id: self.recurrence_id,
            styled_description,
            x_pubky_calendar_uris,
            x_pubky_rsvp_access,
        }
    }

    fn validate(&self, id: Option<&str>) -> Result<(), String> {
        // Validate the event ID
        if let Some(id) = id {
            self.validate_id(id)?;
        }

        // Validate required fields
        if self.uid.is_empty() {
            return Err("Validation Error: Event uid cannot be empty".into());
        }

        Url::parse(&self.uid)
            .map_err(|_| format!("Validation Error: Event uid must be a valid URI: {}", self.uid))?;

        if self.summary.is_empty() {
            return Err("Validation Error: Event summary cannot be empty".into());
        }

        if self.summary.chars().count() > MAX_SUMMARY_LENGTH {
            return Err(format!(
                "Validation Error: Event summary exceeds maximum length of {} characters",
                MAX_SUMMARY_LENGTH
            ));
        }

        // Validate description length
        if let Some(desc) = &self.description {
            if desc.chars().count() > MAX_DESCRIPTION_LENGTH {
                return Err(format!(
                    "Validation Error: Event description exceeds maximum length of {} characters",
                    MAX_DESCRIPTION_LENGTH
                ));
            }
        }

        // Validate mutual exclusivity of dtend and duration
        if self.dtend.is_some() && self.duration.is_some() {
            return Err(
                "Validation Error: Event cannot have both dtend and duration set".into()
            );
        }

        // Validate dtend is after dtstart if present
        if let Some(end) = self.dtend {
            if end <= self.dtstart {
                return Err("Validation Error: Event dtend must be after dtstart".into());
            }
        }

        // Validate status values
        if let Some(status) = &self.status {
            match status.as_str() {
                "CONFIRMED" | "TENTATIVE" | "CANCELLED" => {}
                _ => {
                    return Err(format!(
                        "Validation Error: Invalid event status: {}. Must be CONFIRMED, TENTATIVE, or CANCELLED",
                        status
                    ))
                }
            }
        }

        // Validate organizer URIs
        if let Some(organizer) = &self.organizer {
            Url::parse(&organizer.uri).map_err(|_| {
                format!(
                    "Validation Error: Invalid organizer URI: {}",
                    organizer.uri
                )
            })?;

            if let Some(sent_by) = &organizer.sent_by {
                Url::parse(sent_by).map_err(|_| {
                    format!("Validation Error: Invalid organizer sent_by URI: {}", sent_by)
                })?;
            }
        }

        // Validate conference URI
        if let Some(conference) = &self.conference {
            Url::parse(&conference.uri).map_err(|_| {
                format!(
                    "Validation Error: Invalid conference URI: {}",
                    conference.uri
                )
            })?;
        }

        // Validate structured locations
        if let Some(locations) = &self.structured_locations {
            for loc in locations {
                if loc.name.is_empty() {
                    return Err(
                        "Validation Error: VLocation name cannot be empty".into()
                    );
                }
                if let Some(uri) = &loc.uri {
                    Url::parse(uri).map_err(|_| {
                        format!("Validation Error: Invalid VLocation URI: {}", uri)
                    })?;
                }
            }
        }

        // Validate styled description
        if let Some(styled_desc) = &self.styled_description {
            if styled_desc.value.is_empty() {
                return Err(
                    "Validation Error: StyledDescription value cannot be empty".into()
                );
            }
            if let Some(altrep) = &styled_desc.altrep {
                Url::parse(altrep).map_err(|_| {
                    format!(
                        "Validation Error: Invalid StyledDescription altrep URI: {}",
                        altrep
                    )
                })?;
            }
        }

        // Validate optional URIs
        if let Some(image_uri) = &self.image_uri {
            Url::parse(image_uri)
                .map_err(|_| format!("Validation Error: Invalid image_uri: {}", image_uri))?;
        }

        if let Some(url) = &self.url {
            Url::parse(url)
                .map_err(|_| format!("Validation Error: Invalid url: {}", url))?;
        }

        // Validate calendar URIs
        if let Some(calendar_uris) = &self.x_pubky_calendar_uris {
            for uri in calendar_uris {
                let parsed = Url::parse(uri).map_err(|_| {
                    format!("Validation Error: Invalid calendar URI: {}", uri)
                })?;

                if parsed.scheme() != "pubky" {
                    return Err(format!(
                        "Validation Error: Calendar URI must use pubky:// scheme: {}",
                        uri
                    ));
                }
            }
        }

        // Validate RSVP access
        if let Some(rsvp_access) = &self.x_pubky_rsvp_access {
            match rsvp_access.as_str() {
                "PUBLIC" | "INVITE_ONLY" | "CONFIRMED_ONLY" => {}
                _ => {
                    return Err(format!(
                        "Validation Error: Invalid x_pubky_rsvp_access: {}. Must be PUBLIC, INVITE_ONLY, or CONFIRMED_ONLY",
                        rsvp_access
                    ))
                }
            }
        }

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::traits::Validatable;

    fn create_test_event() -> PubkyAppEvent {
        PubkyAppEvent::new(
            "pubky://satoshi/pub/pubky.app/event/0033SCZXVEPNG".to_string(),
            1698753600000000,
            1698753600000000,
            "Bitcoin Meetup Zürich".to_string(),
            Some(1698764400000000),
            None,
            None,
            None,
            Some("Weekly Bitcoin meetup at Insider Bar".to_string()),
            Some("CONFIRMED".to_string()),
            Some(vec!["bitcoin".to_string(), "meetup".to_string()]),
            Some("Insider Bar, Münstergasse 20, Zürich".to_string()),
            Some("47.366667;8.550000".to_string()),
            None,
            None,
            None,
            None,
            Some(1698753600000000),
            None,
            None,
            None,
            None,
            Some(vec![
                "pubky://satoshi/pub/pubky.app/calendar/0033RCZXVEPNG".to_string(),
            ]),
            Some("PUBLIC".to_string()),
        )
    }

    #[test]
    fn test_create_id() {
        let event = create_test_event();
        let event_id = event.create_id();
        println!("Generated Event ID: {}", event_id);
        assert_eq!(event_id.len(), 13);
    }

    #[test]
    fn test_create_path() {
        let event = create_test_event();
        let event_id = event.create_id();
        let path = PubkyAppEvent::create_path(&event_id);

        let prefix = format!("{}{}event/", PUBLIC_PATH, APP_PATH);
        assert!(path.starts_with(&prefix));

        let expected_path_len = prefix.len() + event_id.len();
        assert_eq!(path.len(), expected_path_len);
    }

    #[test]
    fn test_validate_valid() {
        let event = create_test_event();
        let id = event.create_id();
        let result = event.validate(Some(&id));
        assert!(result.is_ok());
    }

    #[test]
    fn test_validate_missing_uid() {
        let mut event = create_test_event();
        event.uid = String::new();
        let id = event.create_id();
        let result = event.validate(Some(&id));
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("uid cannot be empty"));
    }

    #[test]
    fn test_validate_missing_summary() {
        let mut event = create_test_event();
        event.summary = String::new();
        let id = event.create_id();
        let result = event.validate(Some(&id));
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("summary cannot be empty"));
    }

    #[test]
    fn test_validate_invalid_status() {
        let mut event = create_test_event();
        event.status = Some("INVALID_STATUS".to_string());
        let id = event.create_id();
        let result = event.validate(Some(&id));
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("Invalid event status"));
    }

    #[test]
    fn test_validate_dtend_before_dtstart() {
        let mut event = create_test_event();
        event.dtstart = 1698764400000000;
        event.dtend = Some(1698753600000000); // End before start
        let id = event.create_id();
        let result = event.validate(Some(&id));
        assert!(result.is_err());
        assert!(result
            .unwrap_err()
            .contains("dtend must be after dtstart"));
    }

    #[test]
    fn test_validate_dtend_and_duration_exclusive() {
        let mut event = create_test_event();
        event.dtend = Some(1698764400000000);
        event.duration = Some("PT3H".to_string());
        let id = event.create_id();
        let result = event.validate(Some(&id));
        assert!(result.is_err());
        assert!(result
            .unwrap_err()
            .contains("cannot have both dtend and duration"));
    }

    #[test]
    fn test_validate_invalid_rsvp_access() {
        let mut event = create_test_event();
        event.x_pubky_rsvp_access = Some("INVALID".to_string());
        let id = event.create_id();
        let result = event.validate(Some(&id));
        assert!(result.is_err());
        assert!(result
            .unwrap_err()
            .contains("Invalid x_pubky_rsvp_access"));
    }

    #[test]
    fn test_validate_calendar_uri_must_be_pubky() {
        let mut event = create_test_event();
        event.x_pubky_calendar_uris =
            Some(vec!["https://example.com/calendar/123".to_string()]);
        let id = event.create_id();
        let result = event.validate(Some(&id));
        assert!(result.is_err());
        assert!(result
            .unwrap_err()
            .contains("must use pubky:// scheme"));
    }

    #[test]
    fn test_validate_with_organizer() {
        let mut event = create_test_event();
        event.organizer = Some(Organizer {
            uri: "pubky://satoshi".to_string(),
            sent_by: Some("pubky://delegate".to_string()),
        });
        let id = event.create_id();
        let result = event.validate(Some(&id));
        assert!(result.is_ok());
    }

    #[test]
    fn test_validate_with_conference() {
        let mut event = create_test_event();
        event.conference = Some(Conference {
            uri: "https://meet.jit.si/bitcoin-zurich".to_string(),
            label: Some("Jitsi Meeting".to_string()),
            features: Some(vec!["AUDIO".to_string(), "VIDEO".to_string()]),
        });
        let id = event.create_id();
        let result = event.validate(Some(&id));
        assert!(result.is_ok());
    }

    #[test]
    fn test_validate_with_structured_locations() {
        let mut event = create_test_event();
        event.structured_locations = Some(vec![
            VLocation {
                name: "Insider Bar".to_string(),
                location_type: Some("ARRIVAL".to_string()),
                address: Some("Münstergasse 20, 8001 Zürich".to_string()),
                uri: Some("https://www.openstreetmap.org/node/123456789".to_string()),
                description: None,
            },
            VLocation {
                name: "Parking Garage".to_string(),
                location_type: Some("PARKING".to_string()),
                address: Some("Uraniastrasse 1, 8001 Zürich".to_string()),
                uri: None,
                description: Some("Underground parking".to_string()),
            },
        ]);
        let id = event.create_id();
        let result = event.validate(Some(&id));
        assert!(result.is_ok());
    }

    #[test]
    fn test_validate_vlocation_empty_name() {
        let mut event = create_test_event();
        event.structured_locations = Some(vec![VLocation {
            name: String::new(),
            location_type: Some("ARRIVAL".to_string()),
            address: None,
            uri: None,
            description: None,
        }]);
        let id = event.create_id();
        let result = event.validate(Some(&id));
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("VLocation name cannot be empty"));
    }

    #[test]
    fn test_validate_with_styled_description() {
        let mut event = create_test_event();
        event.styled_description = Some(StyledDescription {
            fmttype: Some("text/html".to_string()),
            value: "<p>Weekly Bitcoin meetup</p>".to_string(),
            derived: Some(false),
            altrep: None,
            language: Some("en-US".to_string()),
        });
        let id = event.create_id();
        let result = event.validate(Some(&id));
        assert!(result.is_ok());
    }

    #[test]
    fn test_try_from_valid() {
        let event_json = r#"
        {
            "uid": "pubky://satoshi/pub/pubky.app/event/0033SCZXVEPNG",
            "dtstamp": 1698753600000000,
            "dtstart": 1698753600000000,
            "summary": "Bitcoin Meetup Zürich",
            "dtend": 1698764400000000,
            "description": "Weekly Bitcoin meetup",
            "status": "CONFIRMED",
            "organizer": {
                "uri": "pubky://satoshi"
            },
            "categories": ["bitcoin", "meetup"],
            "location": "Insider Bar, Münstergasse 20, Zürich",
            "geo": "47.366667;8.550000",
            "created": 1698753600000000,
            "x_pubky_calendar_uris": ["pubky://satoshi/pub/pubky.app/calendar/0033RCZXVEPNG"],
            "x_pubky_rsvp_access": "PUBLIC"
        }
        "#;

        let id = create_test_event().create_id();
        let blob = event_json.as_bytes();
        let event = <PubkyAppEvent as Validatable>::try_from(blob, &id).unwrap();

        assert_eq!(event.summary, "Bitcoin Meetup Zürich".to_string());
        assert_eq!(event.status, Some("CONFIRMED".to_string()));
        assert_eq!(
            event.location,
            Some("Insider Bar, Münstergasse 20, Zürich".to_string())
        );
        assert_eq!(event.geo, Some("47.366667;8.550000".to_string()));
        assert!(event.organizer.is_some());
        assert_eq!(event.organizer.unwrap().uri, "pubky://satoshi");
    }
}
