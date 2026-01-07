use crate::{
    common::timestamp,
    models::calendar::StyledDescription,
    traits::{HasIdPath, TimestampId, Validatable},
    validation::{
        is_valid_conference_features, is_valid_datetime, is_valid_duration,
        is_valid_geo_uri, is_valid_location_type, is_valid_timezone, is_valid_uri,
    },
    EVENTKY_PATH, PUBLIC_PATH,
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
const MIN_UID_LENGTH: usize = 1;
const MAX_UID_LENGTH: usize = 255;
const MIN_SUMMARY_LENGTH: usize = 1;
const MAX_SUMMARY_LENGTH: usize = 500;
const MAX_DESCRIPTION_LENGTH: usize = 10_000;
const MAX_CALENDAR_URIS: usize = 10;

// Location validation constants (RFC 9073 VLOCATION)
const MAX_LOCATIONS: usize = 10;
const MAX_LOCATION_NAME_LENGTH: usize = 500;
const MAX_LOCATION_DESCRIPTION_LENGTH: usize = 2000;

// Conference validation constants (RFC 7986 CONFERENCE)
const MAX_CONFERENCES: usize = 10;
const MAX_CONFERENCE_LABEL_LENGTH: usize = 200;

/// Valid event status values
const VALID_STATUS: &[&str] = &["CONFIRMED", "TENTATIVE", "CANCELLED"];

/// Valid RSVP access values
const VALID_RSVP_ACCESS: &[&str] = &["PUBLIC"];

/// RFC 9073 VLOCATION - Structured location component
/// 
/// Represents a physical location for an event with structured data.
/// Based on RFC 9073 VLOCATION component, RFC 4589 location types,
/// and RFC 5870 geo URI format.
/// 
/// # Fields
/// - `uid`: Unique identifier for this location instance
/// - `name`: Human-readable location name (e.g., "Main Conference Room")
/// - `location_type`: RFC 4589 location type (e.g., "venue", "parking", "restaurant")
/// - `description`: Additional location details
/// - `geo`: RFC 5870 geo URI (e.g., "geo:47.3769,8.5417" or "geo:47.3769,8.5417;u=10")
/// - `structured_data_uri`: RFC 9073 STRUCTURED-DATA reference (e.g., OSM URL)
/// 
/// # Example
/// ```
/// use pubky_app_specs::EventLocation;
/// 
/// let location = EventLocation {
///     uid: "loc-main-venue".to_string(),
///     name: Some("Convention Center".to_string()),
///     location_type: Some("venue".to_string()),
///     description: Some("Main entrance on 5th Avenue".to_string()),
///     geo: Some("geo:40.7128,-74.0060".to_string()),
///     structured_data_uri: Some("https://www.openstreetmap.org/node/123456".to_string()),
/// };
/// ```
#[derive(Serialize, Deserialize, Debug, Clone, Default, PartialEq)]
#[cfg_attr(feature = "openapi", derive(ToSchema))]
pub struct EventLocation {
    /// Unique identifier for this location within the event
    pub uid: String,
    /// Human-readable location name
    pub name: Option<String>,
    /// RFC 4589 location type (venue, parking, restaurant, airport, hotel, etc.)
    pub location_type: Option<String>,
    /// Additional description of the location
    pub description: Option<String>,
    /// RFC 5870 geo URI format: "geo:lat,lon" or "geo:lat,lon;u=uncertainty"
    pub geo: Option<String>,
    /// RFC 9073 STRUCTURED-DATA URI reference (e.g., OpenStreetMap URL)
    pub structured_data_uri: Option<String>,
}

/// RFC 7986 CONFERENCE - Virtual meeting/conference property
/// 
/// Represents a virtual conference or meeting link for an event.
/// Based on RFC 7986 CONFERENCE property.
/// 
/// # Fields
/// - `uri`: Conference URI (e.g., "https://zoom.us/j/123456" or "tel:+1-555-1234")
/// - `features`: RFC 7986 FEATURE values (AUDIO, VIDEO, CHAT, PHONE, SCREEN, MODERATOR, FEED)
/// - `label`: Human-readable label for the conference link
/// 
/// # Example
/// ```
/// use pubky_app_specs::EventConference;
/// 
/// let conference = EventConference {
///     uri: "https://zoom.us/j/123456789".to_string(),
///     features: Some(vec!["AUDIO".to_string(), "VIDEO".to_string(), "SCREEN".to_string()]),
///     label: Some("Main Meeting Room".to_string()),
/// };
/// ```
#[derive(Serialize, Deserialize, Debug, Clone, Default, PartialEq)]
#[cfg_attr(feature = "openapi", derive(ToSchema))]
pub struct EventConference {
    /// Conference URI (any valid scheme: https, tel, sip, etc.)
    pub uri: String,
    /// RFC 7986 FEATURE values: AUDIO, VIDEO, CHAT, PHONE, SCREEN, MODERATOR, FEED
    pub features: Option<Vec<String>>,
    /// Human-readable label for this conference link
    pub label: Option<String>,
}

/// Event - a scheduled activity or occasion
/// URI: /pub/eventky.app/events/:event_id
/// Where event_id is a timestamp-based ID for chronological ordering
#[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
#[derive(Serialize, Deserialize, Debug, Clone)]
#[cfg_attr(feature = "openapi", derive(ToSchema))]
pub struct PubkyAppEvent {
    // RFC 5545 - Core Event Properties (REQUIRED)
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub uid: String,                    // Globally unique identifier
    pub dtstamp: i64,                   // Creation/last-modified timestamp (Unix microseconds)
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub dtstart: String,                // Start date-time in ISO 8601 format (YYYY-MM-DDTHH:MM:SS)
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub summary: String,                // Event title/subject

    // RFC 5545 - Time & Duration
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub dtend: Option<String>,          // End date-time in ISO 8601 format (mutually exclusive with duration)
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub duration: Option<String>,       // RFC 5545 duration format (mutually exclusive with dtend)
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub dtstart_tzid: Option<String>,   // IANA timezone for dtstart (e.g., "Europe/Zurich")
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub dtend_tzid: Option<String>,     // IANA timezone for dtend

    // RFC 5545 - Event Details
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub description: Option<String>,    // Plain text description
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub status: Option<String>,         // CONFIRMED | TENTATIVE | CANCELLED
    
    // RFC 9073 - Structured Locations (replaces RFC 5545 LOCATION/GEO)
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub locations: Option<Vec<EventLocation>>,  // Physical locations (venue, parking, etc.)
    
    // RFC 7986 - Virtual Conferences
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub conferences: Option<Vec<EventConference>>,  // Virtual meeting links
    
    // RFC 7986 - Event Publishing Extensions
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub image_uri: Option<String>,      // Event image/banner URI
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub url: Option<String>,            // Event homepage/details link

    // RFC 5545 - Change Management
    pub sequence: Option<i32>,          // Version number (increment on modifications)
    pub last_modified: Option<i64>,     // Last modification timestamp
    pub created: Option<i64>,           // Creation timestamp

    // RFC 5545 - Recurrence
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub rrule: Option<String>,          // Recurrence rule (RFC 5545 format)
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub rdate: Option<Vec<String>>,     // Additional recurrence dates
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub exdate: Option<Vec<String>>,    // Excluded recurrence dates
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub recurrence_id: Option<String>,  // ISO 8601 datetime of specific recurrence instance

    // RFC 9073 - Rich Content
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub styled_description: Option<StyledDescription>, // Formatted description with metadata

    // Pubky Extensions (all custom fields use x_pubky_ prefix)
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub x_pubky_calendar_uris: Option<Vec<String>>, // URIs of calendars containing this event
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub x_pubky_rsvp_access: Option<String>, // RSVP access control: "PUBLIC" (default, anyone can RSVP)
}

impl PubkyAppEvent {
    /// Creates a new `PubkyAppEvent` instance with required fields and sensible defaults.
    pub fn new(uid: String, dtstart: String, summary: String) -> Self {
        let now = timestamp();
        Self {
            uid,
            dtstamp: now,
            dtstart,
            summary,
            // Sensible defaults for all optional fields
            dtend: None,
            duration: None,
            dtstart_tzid: None,
            dtend_tzid: None,
            description: None,
            status: Some("CONFIRMED".to_string()),
            locations: None,
            conferences: None,
            image_uri: None,
            url: None,
            sequence: Some(0),
            last_modified: Some(now),
            created: Some(now),
            rrule: None,
            rdate: None,
            exdate: None,
            recurrence_id: None,
            styled_description: None,
            x_pubky_calendar_uris: None,
            x_pubky_rsvp_access: Some("PUBLIC".to_string()),
        }
        .sanitize()
    }

    /// Helper method to create an event with an end time
    pub fn with_end_time(mut self, dtend: String) -> Self {
        self.dtend = Some(dtend);
        self.sanitize()
    }

    /// Helper method to add a description
    pub fn with_description(mut self, description: String) -> Self {
        self.description = Some(description);
        self.sanitize()
    }

    /// Helper method to add a single location (convenience method)
    pub fn with_location(mut self, location: EventLocation) -> Self {
        match &mut self.locations {
            Some(locs) => locs.push(location),
            None => self.locations = Some(vec![location]),
        }
        self.sanitize()
    }

    /// Helper method to add multiple locations
    pub fn with_locations(mut self, locations: Vec<EventLocation>) -> Self {
        self.locations = Some(locations);
        self.sanitize()
    }

    /// Helper method to add a single conference (convenience method)
    pub fn with_conference(mut self, conference: EventConference) -> Self {
        match &mut self.conferences {
            Some(confs) => confs.push(conference),
            None => self.conferences = Some(vec![conference]),
        }
        self.sanitize()
    }

    /// Helper method to add multiple conferences
    pub fn with_conferences(mut self, conferences: Vec<EventConference>) -> Self {
        self.conferences = Some(conferences);
        self.sanitize()
    }

    /// Helper method to set the event status
    pub fn with_status(mut self, status: String) -> Self {
        self.status = Some(status);
        self.sanitize()
    }
}

#[cfg(target_arch = "wasm32")]
#[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
impl PubkyAppEvent {
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn uid(&self) -> String {
        self.uid.clone()
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn summary(&self) -> String {
        self.summary.clone()
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn dtstart(&self) -> String {
        self.dtstart.clone()
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn dtend(&self) -> Option<String> {
        self.dtend.clone()
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

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn description(&self) -> Option<String> {
        self.description.clone()
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn status(&self) -> Option<String> {
        self.status.clone()
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter, js_name = "locationsJson"))]
    pub fn locations_json(&self) -> Option<String> {
        self.locations.as_ref().map(|locs| serde_json::to_string(locs).unwrap_or_default())
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter, js_name = "conferencesJson"))]
    pub fn conferences_json(&self) -> Option<String> {
        self.conferences.as_ref().map(|confs| serde_json::to_string(confs).unwrap_or_default())
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn image_uri(&self) -> Option<String> {
        self.image_uri.clone()
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn url(&self) -> Option<String> {
        self.url.clone()
    }

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
    pub fn styled_description(&self) -> Option<StyledDescription> {
        self.styled_description.clone()
    }

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
    /// Creates a new `PubkyAppEvent` instance for WASM.
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(constructor))]
    pub fn new_wasm(uid: String, dtstart: String, summary: String) -> Self {
        Self::new(uid, dtstart, summary)
    }

    /// Generates a unique timestamp-based ID for the event
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(js_name = createId))]
    pub fn create_id_wasm(&self) -> String {
        self.create_id()
    }
}

impl TimestampId for PubkyAppEvent {}

impl HasIdPath for PubkyAppEvent {
    const PATH_SEGMENT: &'static str = "events/";

    fn create_path(id: &str) -> String {
        [PUBLIC_PATH, EVENTKY_PATH, Self::PATH_SEGMENT, id].concat()
    }
}

impl Validatable for PubkyAppEvent {
    fn sanitize(self) -> Self {
        // Sanitize UID
        let uid = self.uid.trim().chars().take(MAX_UID_LENGTH).collect();
        
        // Sanitize summary
        let summary = self.summary.trim().chars().take(MAX_SUMMARY_LENGTH).collect();
        
        // Sanitize dtstart (trim whitespace, validate format)
        let dtstart = self.dtstart.trim().to_string();
        
        // Sanitize dtend (trim whitespace, validate format)
        let dtend = self.dtend.map(|dt| dt.trim().to_string());
        
        // Sanitize description
        let description = self.description.map(|desc| {
            desc.trim().chars().take(MAX_DESCRIPTION_LENGTH).collect()
        });
        
        // Sanitize locations (RFC 9073 VLOCATION)
        let locations = self.locations.map(|locs| {
            locs.into_iter()
                .take(MAX_LOCATIONS)
                .map(|loc| EventLocation {
                    uid: loc.uid.trim().to_string(),
                    name: loc.name.map(|n| n.trim().chars().take(MAX_LOCATION_NAME_LENGTH).collect()),
                    location_type: loc.location_type.and_then(|lt| {
                        let lt = lt.trim().to_lowercase();
                        if is_valid_location_type(&lt) {
                            Some(lt)
                        } else {
                            None
                        }
                    }),
                    description: loc.description.map(|d| d.trim().chars().take(MAX_LOCATION_DESCRIPTION_LENGTH).collect()),
                    geo: loc.geo.and_then(|g| {
                        let g = g.trim();
                        if is_valid_geo_uri(g) {
                            Some(g.to_string())
                        } else {
                            None
                        }
                    }),
                    structured_data_uri: loc.structured_data_uri.and_then(|uri| {
                        match Url::parse(&uri.trim()) {
                            Ok(url) => Some(url.to_string()),
                            Err(_) => None,
                        }
                    }),
                })
                .collect::<Vec<_>>()
        }).filter(|locs| !locs.is_empty());
        
        // Sanitize conferences (RFC 7986 CONFERENCE)
        let conferences = self.conferences.map(|confs| {
            confs.into_iter()
                .take(MAX_CONFERENCES)
                .filter_map(|conf| {
                    // Validate the conference URI (required field)
                    if !is_valid_uri(&conf.uri.trim()) {
                        return None;
                    }
                    
                    Some(EventConference {
                        uri: conf.uri.trim().to_string(),
                        features: conf.features.and_then(|f| {
                            let filtered: Vec<String> = f.into_iter()
                                .map(|feat| feat.trim().to_uppercase())
                                .filter(|feat| is_valid_conference_features(std::slice::from_ref(feat)))
                                .collect();
                            if filtered.is_empty() { None } else { Some(filtered) }
                        }),
                        label: conf.label.map(|l| l.trim().chars().take(MAX_CONFERENCE_LABEL_LENGTH).collect()),
                    })
                })
                .collect::<Vec<_>>()
        }).filter(|confs| !confs.is_empty());
        
        // Sanitize status (normalize to uppercase)
        let status = self.status.map(|s| {
            let s = s.trim().to_uppercase();
            if VALID_STATUS.contains(&s.as_str()) {
                s
            } else {
                "CONFIRMED".to_string() // Default to CONFIRMED for invalid status
            }
        });
        
        // Sanitize URIs (image_uri, url, calendar_uris)
        let image_uri = self.image_uri.and_then(|uri| {
            match Url::parse(&uri.trim()) {
                Ok(url) => Some(url.to_string()),
                Err(_) => None,
            }
        });
        
        let url = self.url.and_then(|uri| {
            match Url::parse(&uri.trim()) {
                Ok(url) => Some(url.to_string()),
                Err(_) => None,
            }
        });
        
        let x_pubky_calendar_uris = self.x_pubky_calendar_uris.map(|uris| {
            uris.into_iter()
                .take(MAX_CALENDAR_URIS)
                .filter_map(|uri| {
                    match Url::parse(&uri.trim()) {
                        Ok(url) => Some(url.to_string()),
                        Err(_) => None,
                    }
                })
                .collect::<Vec<_>>()
        }).filter(|uris| !uris.is_empty());
        
        // Sanitize timezones
        let dtstart_tzid = self.dtstart_tzid.and_then(|tz| {
            if is_valid_timezone(&tz.trim()) {
                Some(tz.trim().to_string())
            } else {
                None
            }
        });
        
        let dtend_tzid = self.dtend_tzid.and_then(|tz| {
            if is_valid_timezone(&tz.trim()) {
                Some(tz.trim().to_string())
            } else {
                None
            }
        });
        
        // Sanitize duration
        let duration = self.duration.and_then(|dur| {
            if is_valid_duration(&dur.trim()) {
                Some(dur.trim().to_string())
            } else {
                None
            }
        });
        
        // Sanitize RSVP access
        let x_pubky_rsvp_access = self.x_pubky_rsvp_access.map(|access| {
            let access = access.trim().to_uppercase();
            if VALID_RSVP_ACCESS.contains(&access.as_str()) {
                access
            } else {
                "PUBLIC".to_string() // Default to PUBLIC
            }
        });
        
        Self {
            uid,
            dtstamp: self.dtstamp,
            dtstart,
            summary,
            dtend,
            duration,
            dtstart_tzid,
            dtend_tzid,
            description,
            status,
            locations,
            conferences,
            image_uri,
            url,
            sequence: self.sequence,
            last_modified: self.last_modified,
            created: self.created,
            rrule: self.rrule,
            rdate: self.rdate,
            exdate: self.exdate,
            recurrence_id: self.recurrence_id,
            styled_description: self.styled_description,
            x_pubky_calendar_uris,
            x_pubky_rsvp_access,
        }
    }

    fn validate(&self, id: Option<&str>) -> Result<(), String> {
        // Validate the event ID
        if let Some(id) = id {
            self.validate_id(id)?;
        }

        // Validate UID
        let uid_length = self.uid.chars().count();
        if !(MIN_UID_LENGTH..=MAX_UID_LENGTH).contains(&uid_length) {
            return Err("Validation Error: Event UID length must be between 1 and 255 characters".into());
        }

        // Validate summary
        let summary_length = self.summary.chars().count();
        if !(MIN_SUMMARY_LENGTH..=MAX_SUMMARY_LENGTH).contains(&summary_length) {
            return Err("Validation Error: Event summary length must be between 1 and 500 characters".into());
        }

        // Validate dtstart format
        if !is_valid_datetime(&self.dtstart) {
            return Err("Validation Error: Invalid start date-time format. Must be ISO 8601 (YYYY-MM-DDTHH:MM:SS)".into());
        }

        // Validate dtend format if present
        if let Some(ref dtend) = self.dtend {
            if !is_valid_datetime(dtend) {
                return Err("Validation Error: Invalid end date-time format. Must be ISO 8601 (YYYY-MM-DDTHH:MM:SS)".into());
            }
            
            // Validate that dtend is after dtstart
            if dtend <= &self.dtstart {
                return Err("Validation Error: Event end time must be after start time".into());
            }
        }

        // Validate that only one of dtend or duration is present
        if self.dtend.is_some() && self.duration.is_some() {
            return Err("Validation Error: Event cannot have both dtend and duration".into());
        }

        // Validate status
        if let Some(status) = &self.status {
            if !VALID_STATUS.contains(&status.as_str()) {
                return Err("Validation Error: Invalid event status".into());
            }
        }

        // Validate RSVP access
        if let Some(rsvp_access) = &self.x_pubky_rsvp_access {
            if !VALID_RSVP_ACCESS.contains(&rsvp_access.as_str()) {
                return Err("Validation Error: Invalid RSVP access level".into());
            }
        }

        // Validate description length
        if let Some(desc) = &self.description {
            if desc.chars().count() > MAX_DESCRIPTION_LENGTH {
                return Err("Validation Error: Event description exceeds maximum length".into());
            }
        }

        // Validate locations (RFC 9073 VLOCATION)
        if let Some(locs) = &self.locations {
            if locs.len() > MAX_LOCATIONS {
                return Err("Validation Error: Too many locations".into());
            }
            for (i, loc) in locs.iter().enumerate() {
                // UID is required and must not be empty
                if loc.uid.trim().is_empty() {
                    return Err(format!("Validation Error: Location {} UID is required", i + 1));
                }
                // Validate name length if present
                if let Some(name) = &loc.name {
                    if name.chars().count() > MAX_LOCATION_NAME_LENGTH {
                        return Err(format!("Validation Error: Location {} name exceeds maximum length", i + 1));
                    }
                }
                // Validate description length if present
                if let Some(desc) = &loc.description {
                    if desc.chars().count() > MAX_LOCATION_DESCRIPTION_LENGTH {
                        return Err(format!("Validation Error: Location {} description exceeds maximum length", i + 1));
                    }
                }
                // Validate location_type if present (RFC 4589)
                if let Some(lt) = &loc.location_type {
                    if !is_valid_location_type(lt) {
                        return Err(format!("Validation Error: Location {} has invalid location type", i + 1));
                    }
                }
                // Validate geo URI if present (RFC 5870)
                if let Some(geo) = &loc.geo {
                    if !is_valid_geo_uri(geo) {
                        return Err(format!("Validation Error: Location {} has invalid geo URI", i + 1));
                    }
                }
                // Validate structured_data_uri if present
                if let Some(uri) = &loc.structured_data_uri {
                    if Url::parse(uri).is_err() {
                        return Err(format!("Validation Error: Location {} has invalid structured data URI", i + 1));
                    }
                }
            }
        }

        // Validate conferences (RFC 7986 CONFERENCE)
        if let Some(confs) = &self.conferences {
            if confs.len() > MAX_CONFERENCES {
                return Err("Validation Error: Too many conferences".into());
            }
            for (i, conf) in confs.iter().enumerate() {
                // URI is required and must be valid
                if !is_valid_uri(&conf.uri) {
                    return Err(format!("Validation Error: Conference {} has invalid URI", i + 1));
                }
                // Validate features if present
                if let Some(features) = &conf.features {
                    if !is_valid_conference_features(features) {
                        return Err(format!("Validation Error: Conference {} has invalid features", i + 1));
                    }
                }
                // Validate label length if present
                if let Some(label) = &conf.label {
                    if label.chars().count() > MAX_CONFERENCE_LABEL_LENGTH {
                        return Err(format!("Validation Error: Conference {} label exceeds maximum length", i + 1));
                    }
                }
            }
        }

        // Validate calendar URIs count
        if let Some(cal_uris) = &self.x_pubky_calendar_uris {
            if cal_uris.len() > MAX_CALENDAR_URIS {
                return Err("Validation Error: Too many calendar URIs".into());
            }
        }

        // Additional validations can be added here
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::traits::Validatable;
    use crate::validation::{is_valid_geo, is_valid_geo_uri, is_valid_location_type, is_valid_conference_features};

    #[test]
    fn test_new_simple() {
        let event = PubkyAppEvent::new(
            "event-123".to_string(),
            "2025-12-01T10:00:00".to_string(),
            "Team Meeting".to_string(),
        );

        assert_eq!(event.uid, "event-123");
        assert_eq!(event.dtstart, "2025-12-01T10:00:00");
        assert_eq!(event.summary, "Team Meeting");
        assert_eq!(event.status, Some("CONFIRMED".to_string()));
        assert_eq!(event.x_pubky_rsvp_access, Some("PUBLIC".to_string()));
        assert!(event.created.is_some());
        
        // Check that timestamps are recent
        let now = timestamp();
        assert!(event.dtstamp <= now && event.dtstamp >= now - 1_000_000);
    }

    #[test]
    fn test_new_complex() {
        let venue = EventLocation {
            uid: "main-venue".to_string(),
            name: Some("Convention Center".to_string()),
            location_type: Some("venue".to_string()),
            description: None,
            geo: Some("geo:47.3769,8.5417".to_string()), // Zurich coordinates (RFC 5870)
            structured_data_uri: None,
        };
        
        let zoom_conf = EventConference {
            uri: "https://zoom.us/j/123456789".to_string(),
            features: Some(vec!["AUDIO".to_string(), "VIDEO".to_string()]),
            label: Some("Main Meeting Room".to_string()),
        };

        let event = PubkyAppEvent::new(
            "complex-event-456".to_string(),
            "2025-12-01T14:00:00".to_string(),
            "Annual Conference".to_string(),
        )
        .with_end_time("2025-12-01T18:00:00".to_string())
        .with_description("Annual company conference with presentations".to_string())
        .with_location(venue)
        .with_conference(zoom_conf);

        assert_eq!(event.uid, "complex-event-456");
        assert_eq!(event.dtstart, "2025-12-01T14:00:00");
        assert_eq!(event.dtend, Some("2025-12-01T18:00:00".to_string()));
        assert_eq!(event.summary, "Annual Conference");
        
        // Verify location
        assert!(event.locations.is_some());
        let locs = event.locations.as_ref().unwrap();
        assert_eq!(locs.len(), 1);
        assert_eq!(locs[0].uid, "main-venue");
        assert_eq!(locs[0].name, Some("Convention Center".to_string()));
        assert_eq!(locs[0].geo, Some("geo:47.3769,8.5417".to_string()));
        
        // Verify conference
        assert!(event.conferences.is_some());
        let confs = event.conferences.as_ref().unwrap();
        assert_eq!(confs.len(), 1);
        assert_eq!(confs[0].uri, "https://zoom.us/j/123456789");
        assert_eq!(confs[0].label, Some("Main Meeting Room".to_string()));
    }

    #[test]
    fn test_create_id() {
        let event = PubkyAppEvent::new(
            "event-123".to_string(),
            "2025-12-01T10:00:00".to_string(),
            "Team Meeting".to_string(),
        );

        let event_id = event.create_id();
        println!("Generated Event ID: {}", event_id);

        // Assert that the event ID is 13 characters long (timestamp-based)
        assert_eq!(event_id.len(), 13);
    }

    #[test]
    fn test_create_path() {
        let event = PubkyAppEvent::new(
            "event-123".to_string(),
            "2025-12-01T10:00:00".to_string(),
            "Team Meeting".to_string(),
        );

        let event_id = event.create_id();
        let path = PubkyAppEvent::create_path(&event_id);

        // Check if the path starts with the expected prefix
        let prefix = format!("{}{}events/", PUBLIC_PATH, EVENTKY_PATH);
        assert!(path.starts_with(&prefix));

        let expected_path_len = prefix.len() + event_id.len();
        assert_eq!(path.len(), expected_path_len);
    }

    #[test]
    fn test_validate_valid() {
        let event = PubkyAppEvent::new(
            "event-123".to_string(),
            "2025-12-01T10:00:00".to_string(),
            "Team Meeting".to_string(),
        );

        let id = event.create_id();
        let result = event.validate(Some(&id));
        assert!(result.is_ok());
    }

    #[test]
    fn test_validate_invalid_uid() {
        let event = PubkyAppEvent::new(
            "".to_string(), // Empty UID
            "2025-12-01T10:00:00".to_string(),
            "Team Meeting".to_string(),
        );

        let id = event.create_id();
        let result = event.validate(Some(&id));
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("UID length"));
    }

    #[test]
    fn test_validate_invalid_summary() {
        let event = PubkyAppEvent::new(
            "event-123".to_string(),
            "2025-12-01T10:00:00".to_string(),
            "".to_string(), // Empty summary
        );

        let id = event.create_id();
        let result = event.validate(Some(&id));
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("summary length"));
    }

    #[test]
    fn test_validate_invalid_time_order() {
        let event = PubkyAppEvent::new(
            "event-123".to_string(),
            "2025-12-01T10:00:00".to_string(),
            "Team Meeting".to_string(),
        ).with_end_time("2025-12-01T09:00:00".to_string()); // End before start

        let id = event.create_id();
        let result = event.validate(Some(&id));
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("end time must be after start time"));
    }

    #[test]
    fn test_validate_both_dtend_and_duration() {
        let mut event = PubkyAppEvent::new(
            "event-123".to_string(),
            "2025-12-01T10:00:00".to_string(),
            "Team Meeting".to_string(),
        ).with_end_time("2025-12-01T11:00:00".to_string());
        
        // Set both dtend and duration (invalid)
        event.duration = Some("PT1H".to_string());

        let id = event.create_id();
        let result = event.validate(Some(&id));
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("cannot have both dtend and duration"));
    }

    #[test]
    fn test_sanitize() {
        let venue = EventLocation {
            uid: "  main-venue  ".to_string(),
            name: Some("  Conference Room  ".to_string()),
            location_type: Some("  VENUE  ".to_string()), // uppercase should normalize to lowercase
            description: None,
            geo: Some("  geo:47.3769,8.5417  ".to_string()),
            structured_data_uri: None,
        };

        let event = PubkyAppEvent::new(
            "  event-123  ".to_string(), // uid
            "  2025-12-01T10:00:00  ".to_string(), // dtstart
            "  Team Meeting  ".to_string(), // summary
        )
        .with_description("  Meeting description  ".to_string())
        .with_status("  confirmed  ".to_string()) // lowercase
        .with_location(venue);

        assert_eq!(event.uid, "event-123");
        assert_eq!(event.dtstart, "2025-12-01T10:00:00");
        assert_eq!(event.summary, "Team Meeting");
        assert_eq!(event.description, Some("Meeting description".to_string()));
        assert_eq!(event.status, Some("CONFIRMED".to_string()));
        
        // Verify location was sanitized
        let locs = event.locations.as_ref().unwrap();
        assert_eq!(locs[0].uid, "main-venue");
        assert_eq!(locs[0].name, Some("Conference Room".to_string()));
        assert_eq!(locs[0].location_type, Some("venue".to_string())); // normalized to lowercase
        assert_eq!(locs[0].geo, Some("geo:47.3769,8.5417".to_string()));
    }

    #[test]
    fn test_geo_validation() {
        // Legacy RFC 5545 format (semicolon separator)
        assert!(is_valid_geo("47.3769;8.5417"));
        assert!(is_valid_geo("-90.0;-180.0"));
        assert!(is_valid_geo("0;0"));
        assert!(!is_valid_geo("47.3769"));       // Missing semicolon
        assert!(!is_valid_geo("47.3769;"));      // Missing longitude
        assert!(!is_valid_geo(";8.5417"));       // Missing latitude
        assert!(!is_valid_geo("invalid;coords")); // Not numbers
    }

    #[test]
    fn test_geo_uri_validation() {
        // RFC 5870 geo URI format
        assert!(is_valid_geo_uri("geo:47.3769,8.5417"));
        assert!(is_valid_geo_uri("geo:-90.0,-180.0"));
        assert!(is_valid_geo_uri("geo:0,0"));
        assert!(is_valid_geo_uri("geo:47.3769,8.5417;u=10")); // with uncertainty
        assert!(!is_valid_geo_uri("47.3769,8.5417"));         // Missing "geo:" prefix
        assert!(!is_valid_geo_uri("geo:47.3769"));            // Missing longitude
        assert!(!is_valid_geo_uri("geo:invalid,coords"));     // Not numbers
    }

    #[test]
    fn test_location_type_validation() {
        // RFC 4589 location types
        assert!(is_valid_location_type("venue"));
        assert!(is_valid_location_type("parking"));
        assert!(is_valid_location_type("restaurant"));
        assert!(is_valid_location_type("hotel"));
        assert!(is_valid_location_type("airport"));
        assert!(!is_valid_location_type("invalid_type"));
        assert!(!is_valid_location_type(""));
    }

    #[test]
    fn test_conference_features_validation() {
        // RFC 7986 CONFERENCE features
        assert!(is_valid_conference_features(&["AUDIO".to_string()]));
        assert!(is_valid_conference_features(&["VIDEO".to_string(), "AUDIO".to_string()]));
        assert!(is_valid_conference_features(&["CHAT".to_string(), "SCREEN".to_string()]));
        assert!(is_valid_conference_features(&["MODERATOR".to_string(), "FEED".to_string()]));
        assert!(!is_valid_conference_features(&["INVALID".to_string()]));
        assert!(!is_valid_conference_features(&["AUDIO".to_string(), "INVALID".to_string()]));
    }

    #[test]
    fn test_timezone_validation() {
        assert!(is_valid_timezone("Europe/Zurich"));
        assert!(is_valid_timezone("America/New_York"));
        assert!(is_valid_timezone("Asia/Tokyo"));
        assert!(!is_valid_timezone(""));           // Empty
        assert!(!is_valid_timezone("Invalid"));    // No slash
        assert!(!is_valid_timezone("Europe@Zurich")); // Invalid char
    }

    #[test]
    fn test_duration_validation() {
        assert!(is_valid_duration("PT1H"));       // 1 hour
        assert!(is_valid_duration("PT30M"));      // 30 minutes
        assert!(is_valid_duration("P1D"));        // 1 day
        assert!(is_valid_duration("P1DT2H30M"));  // 1 day, 2 hours, 30 minutes
        assert!(!is_valid_duration("1H"));        // Missing P
        assert!(!is_valid_duration(""));          // Empty
        assert!(!is_valid_duration("PT@H"));      // Invalid character
    }

    #[test]
    fn test_try_from_valid() {
        let event_json = r##"
        {
            "uid": "event-123",
            "dtstamp": 1700000000000,
            "dtstart": "2025-12-01T10:00:00",
            "summary": "Team Meeting",
            "dtend": "2025-12-01T11:00:00",
            "duration": null,
            "dtstart_tzid": "Europe/Zurich",
            "dtend_tzid": "Europe/Zurich",
            "description": "Weekly team sync meeting",
            "status": "CONFIRMED",
            "locations": [
                {
                    "uid": "main-room",
                    "name": "Conference Room A",
                    "location_type": "venue",
                    "description": null,
                    "geo": "geo:47.3769,8.5417",
                    "structured_data_uri": null
                }
            ],
            "conferences": [
                {
                    "uri": "https://zoom.us/j/123456789",
                    "features": ["AUDIO", "VIDEO"],
                    "label": "Join via Zoom"
                }
            ],
            "image_uri": null,
            "url": "https://example.com/meeting",
            "sequence": 0,
            "last_modified": 1700000000000,
            "created": 1700000000000,
            "rrule": null,
            "rdate": null,
            "exdate": null,
            "recurrence_id": null,
            "styled_description": null,
            "x_pubky_calendar_uris": null,
            "x_pubky_rsvp_access": "PUBLIC"
        }
        "##;

        let event = PubkyAppEvent::new(
            "event-123".to_string(),
            "2025-12-01T10:00:00".to_string(),
            "Team Meeting".to_string(),
        ).with_end_time("2025-12-01T11:00:00".to_string());
        let id = event.create_id();

        let blob = event_json.as_bytes();
        let event_parsed = <PubkyAppEvent as Validatable>::try_from(blob, &id).unwrap();

        assert_eq!(event_parsed.uid, "event-123");
        assert_eq!(event_parsed.dtstart, "2025-12-01T10:00:00");
        assert_eq!(event_parsed.summary, "Team Meeting");
        
        // Verify locations
        let locs = event_parsed.locations.as_ref().unwrap();
        assert_eq!(locs.len(), 1);
        assert_eq!(locs[0].name, Some("Conference Room A".to_string()));
        assert_eq!(locs[0].geo, Some("geo:47.3769,8.5417".to_string()));
        
        // Verify conferences
        let confs = event_parsed.conferences.as_ref().unwrap();
        assert_eq!(confs.len(), 1);
        assert_eq!(confs[0].uri, "https://zoom.us/j/123456789");
        assert_eq!(confs[0].label, Some("Join via Zoom".to_string()));
    }
}