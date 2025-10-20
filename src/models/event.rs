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

// Validation
const MAX_SUMMARY_LENGTH: usize = 255;

/// Represents an event in the Pubky ecosystem
/// URI: /pub/pubky.app/event/:event_id
/// Where event_id is CrockfordBase32 encoding of timestamp
///
/// Example URI:
///
/// `/pub/pubky.app/event/0033SCZXVEPNG`
#[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
#[derive(Serialize, Deserialize, Default, Clone, Debug)]
#[cfg_attr(feature = "openapi", derive(ToSchema))]
pub struct PubkyAppEvent {
    // RFC 5545 - Core Event Properties
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub uid: Option<String>, // Globally unique identifier
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub dtstamp: Option<i64>, // Creation timestamp (microseconds)
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub dtstart: Option<i64>, // Start timestamp (microseconds)
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub dtend: Option<i64>, // End timestamp (microseconds)
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub summary: Option<String>, // Event title/subject
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub status: Option<String>, // CONFIRMED | TENTATIVE | CANCELLED
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub organizer: Option<String>, // JSON: {"uri": "...", "name": "..."}
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub categories: Option<Vec<String>>, // Event categories
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub created: Option<i64>, // Creation timestamp (microseconds)

    // RFC 5545 - Recurrence
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub rrule: Option<String>, // RFC 5545 RRULE string
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub rdate: Option<Vec<String>>, // Recurrence dates (JSON array)
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub exdate: Option<Vec<String>>, // Exception dates (JSON array)
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub recurrence_id: Option<i64>, // For recurrence instances

    // RFC 7986 - Modern Event Properties
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub image_uri: Option<String>, // Event image URI
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub conference: Option<String>, // JSON: {"uri": "...", "label": "..."}

    // RFC 9073 - Event Publishing Extensions
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub structured_location: Option<String>, // JSON object
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub styled_description: Option<String>, // JSON: {"fmttype": "text/html", "value": "..."}

    // Pubky Linkage - explicit references for aggregation
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub x_pubky_calendar_uri: Option<String>, // URI of the calendar this event belongs to
}

#[cfg(target_arch = "wasm32")]
#[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
impl PubkyAppEvent {
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn uid(&self) -> Option<String> {
        self.uid.clone()
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn dtstamp(&self) -> Option<i64> {
        self.dtstamp
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn dtstart(&self) -> Option<i64> {
        self.dtstart
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn dtend(&self) -> Option<i64> {
        self.dtend
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn summary(&self) -> Option<String> {
        self.summary.clone()
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn status(&self) -> Option<String> {
        self.status.clone()
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn organizer(&self) -> Option<String> {
        self.organizer.clone()
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn categories(&self) -> Option<Vec<String>> {
        self.categories.clone()
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn created(&self) -> Option<i64> {
        self.created
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
    pub fn recurrence_id(&self) -> Option<i64> {
        self.recurrence_id
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn image_uri(&self) -> Option<String> {
        self.image_uri.clone()
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn conference(&self) -> Option<String> {
        self.conference.clone()
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn structured_location(&self) -> Option<String> {
        self.structured_location.clone()
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn styled_description(&self) -> Option<String> {
        self.styled_description.clone()
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn x_pubky_calendar_uri(&self) -> Option<String> {
        self.x_pubky_calendar_uri.clone()
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
        uid: Option<String>,
        dtstamp: Option<i64>,
        dtstart: Option<i64>,
        dtend: Option<i64>,
        summary: Option<String>,
        status: Option<String>,
        organizer: Option<String>,
        categories: Option<Vec<String>>,
        created: Option<i64>,
        rrule: Option<String>,
        rdate: Option<Vec<String>>,
        exdate: Option<Vec<String>>,
        recurrence_id: Option<i64>,
        image_uri: Option<String>,
        conference: Option<String>,
        structured_location: Option<String>,
        styled_description: Option<String>,
        x_pubky_calendar_uri: Option<String>,
    ) -> Self {
        let event = PubkyAppEvent {
            uid,
            dtstamp,
            dtstart,
            dtend,
            summary,
            status,
            organizer,
            categories,
            created,
            rrule,
            rdate,
            exdate,
            recurrence_id,
            image_uri,
            conference,
            structured_location,
            styled_description,
            x_pubky_calendar_uri,
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
        // Sanitize summary
        let summary = self.summary.map(|s| {
            let trimmed = s.trim().to_string();
            trimmed.chars().take(MAX_SUMMARY_LENGTH).collect::<String>()
        });

        // Sanitize status - must be valid value
        let status = self.status.map(|s| s.trim().to_uppercase());

        // Sanitize URIs
        let uid = self
            .uid
            .and_then(|uri| Url::parse(&uri).ok().map(|url| url.to_string()));

        let image_uri = self
            .image_uri
            .and_then(|uri| Url::parse(&uri).ok().map(|url| url.to_string()));

        let x_pubky_calendar_uri = self
            .x_pubky_calendar_uri
            .and_then(|uri| Url::parse(&uri).ok().map(|url| url.to_string()));

        // Sanitize JSON fields
        let organizer = self.organizer.map(|o| o.trim().to_string());
        let conference = self.conference.map(|c| c.trim().to_string());
        let structured_location = self.structured_location.map(|l| l.trim().to_string());
        let styled_description = self.styled_description.map(|d| d.trim().to_string());

        // Sanitize rrule
        let rrule = self.rrule.map(|r| r.trim().to_string());

        PubkyAppEvent {
            uid,
            dtstamp: self.dtstamp,
            dtstart: self.dtstart,
            dtend: self.dtend,
            summary,
            status,
            organizer,
            categories: self.categories,
            created: self.created,
            rrule,
            rdate: self.rdate,
            exdate: self.exdate,
            recurrence_id: self.recurrence_id,
            image_uri,
            conference,
            structured_location,
            styled_description,
            x_pubky_calendar_uri,
        }
    }

    fn validate(&self, id: Option<&str>) -> Result<(), String> {
        // Validate the event ID
        if let Some(id) = id {
            self.validate_id(id)?;
        }

        // Validate required fields
        if self.uid.is_none() {
            return Err("Validation Error: Event uid is required".into());
        }

        if self.dtstart.is_none() {
            return Err("Validation Error: Event dtstart is required".into());
        }

        let summary = self
            .summary
            .as_ref()
            .ok_or("Validation Error: Event summary is required")?;

        if summary.is_empty() {
            return Err("Validation Error: Event summary cannot be empty".into());
        }

        if summary.chars().count() > MAX_SUMMARY_LENGTH {
            return Err(format!(
                "Validation Error: Event summary exceeds maximum length of {} characters",
                MAX_SUMMARY_LENGTH
            ));
        }

        // Validate dtend is after dtstart if present
        if let (Some(start), Some(end)) = (self.dtstart, self.dtend) {
            if end <= start {
                return Err("Validation Error: Event dtend must be after dtstart".into());
            }
        }

        // Validate status if present
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

        // Validate URIs
        if let Some(uid) = &self.uid {
            Url::parse(uid)
                .map_err(|_| format!("Validation Error: Invalid uid URI: {}", uid))?;
        }

        if let Some(image_uri) = &self.image_uri {
            Url::parse(image_uri)
                .map_err(|_| format!("Validation Error: Invalid image_uri: {}", image_uri))?;
        }

        if let Some(calendar_uri) = &self.x_pubky_calendar_uri {
            Url::parse(calendar_uri).map_err(|_| {
                format!(
                    "Validation Error: Invalid x_pubky_calendar_uri: {}",
                    calendar_uri
                )
            })?;
        }

        // Validate JSON fields contain valid JSON if present
        if let Some(organizer) = &self.organizer {
            serde_json::from_str::<serde_json::Value>(organizer).map_err(|_| {
                "Validation Error: organizer field must contain valid JSON".to_string()
            })?;
        }

        if let Some(conference) = &self.conference {
            serde_json::from_str::<serde_json::Value>(conference).map_err(|_| {
                "Validation Error: conference field must contain valid JSON".to_string()
            })?;
        }

        if let Some(location) = &self.structured_location {
            serde_json::from_str::<serde_json::Value>(location).map_err(|_| {
                "Validation Error: structured_location field must contain valid JSON".to_string()
            })?;
        }

        if let Some(description) = &self.styled_description {
            serde_json::from_str::<serde_json::Value>(description).map_err(|_| {
                "Validation Error: styled_description field must contain valid JSON".to_string()
            })?;
        }

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::traits::Validatable;

    #[test]
    fn test_create_id() {
        let event = PubkyAppEvent::new(
            Some("pubky://satoshi/pub/pubky.app/event/0033SCZXVEPNG".to_string()),
            Some(1698753600000000),
            Some(1698753600000000),
            Some(1698764400000000),
            Some("Bitcoin Meetup Zürich".to_string()),
            Some("CONFIRMED".to_string()),
            None,
            None,
            Some(1698753600000000),
            None,
            None,
            None,
            None,
            None,
            None,
            None,
            None,
            Some("pubky://satoshi/pub/pubky.app/calendar/0033RCZXVEPNG".to_string()),
        );

        let event_id = event.create_id();
        println!("Generated Event ID: {}", event_id);

        // Assert that the event ID is 13 characters long
        assert_eq!(event_id.len(), 13);
    }

    #[test]
    fn test_create_path() {
        let event = PubkyAppEvent::new(
            Some("pubky://satoshi/pub/pubky.app/event/0033SCZXVEPNG".to_string()),
            Some(1698753600000000),
            Some(1698753600000000),
            Some(1698764400000000),
            Some("Bitcoin Meetup Zürich".to_string()),
            Some("CONFIRMED".to_string()),
            None,
            None,
            Some(1698753600000000),
            None,
            None,
            None,
            None,
            None,
            None,
            None,
            None,
            None,
        );

        let event_id = event.create_id();
        let path = PubkyAppEvent::create_path(&event_id);

        // Check if the path starts with the expected prefix
        let prefix = format!("{}{}event/", PUBLIC_PATH, APP_PATH);
        assert!(path.starts_with(&prefix));

        let expected_path_len = prefix.len() + event_id.len();
        assert_eq!(path.len(), expected_path_len);
    }

    #[test]
    fn test_validate_valid() {
        let event = PubkyAppEvent::new(
            Some("pubky://satoshi/pub/pubky.app/event/0033SCZXVEPNG".to_string()),
            Some(1698753600000000),
            Some(1698753600000000),
            Some(1698764400000000),
            Some("Bitcoin Meetup Zürich".to_string()),
            Some("CONFIRMED".to_string()),
            None,
            None,
            Some(1698753600000000),
            None,
            None,
            None,
            None,
            None,
            None,
            None,
            None,
            Some("pubky://satoshi/pub/pubky.app/calendar/0033RCZXVEPNG".to_string()),
        );

        let id = event.create_id();
        let result = event.validate(Some(&id));
        assert!(result.is_ok());
    }

    #[test]
    fn test_validate_missing_required_fields() {
        let event = PubkyAppEvent::new(
            None, None, None, None, None, None, None, None, None, None, None, None, None, None,
            None, None, None, None,
        );

        let id = event.create_id();
        let result = event.validate(Some(&id));
        assert!(result.is_err());
    }

    #[test]
    fn test_validate_invalid_status() {
        let event = PubkyAppEvent::new(
            Some("pubky://satoshi/pub/pubky.app/event/0033SCZXVEPNG".to_string()),
            Some(1698753600000000),
            Some(1698753600000000),
            Some(1698764400000000),
            Some("Bitcoin Meetup Zürich".to_string()),
            Some("INVALID_STATUS".to_string()),
            None,
            None,
            Some(1698753600000000),
            None,
            None,
            None,
            None,
            None,
            None,
            None,
            None,
            None,
        );

        let id = event.create_id();
        let result = event.validate(Some(&id));
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("Invalid event status"));
    }

    #[test]
    fn test_validate_dtend_before_dtstart() {
        let event = PubkyAppEvent::new(
            Some("pubky://satoshi/pub/pubky.app/event/0033SCZXVEPNG".to_string()),
            Some(1698753600000000),
            Some(1698764400000000), // Start
            Some(1698753600000000), // End before start
            Some("Bitcoin Meetup Zürich".to_string()),
            Some("CONFIRMED".to_string()),
            None,
            None,
            Some(1698753600000000),
            None,
            None,
            None,
            None,
            None,
            None,
            None,
            None,
            None,
        );

        let id = event.create_id();
        let result = event.validate(Some(&id));
        assert!(result.is_err());
        assert!(result
            .unwrap_err()
            .contains("dtend must be after dtstart"));
    }

    #[test]
    fn test_try_from_valid() {
        let event_json = r#"
        {
            "uid": "pubky://satoshi/pub/pubky.app/event/0033SCZXVEPNG",
            "dtstamp": 1698753600000000,
            "dtstart": 1698753600000000,
            "dtend": 1698764400000000,
            "summary": "Bitcoin Meetup Zürich",
            "status": "CONFIRMED",
            "organizer": "{\"uri\": \"pubky://satoshi\", \"name\": \"Satoshi\"}",
            "categories": ["bitcoin", "meetup"],
            "created": 1698753600000000,
            "rrule": "FREQ=WEEKLY;BYDAY=WE",
            "rdate": null,
            "exdate": null,
            "recurrence_id": null,
            "image_uri": "pubky://satoshi/pub/pubky.app/files/0033EVENT01",
            "conference": "{\"uri\": \"https://meet.jit.si/bitcoin-zurich\", \"label\": \"Jitsi Meeting\"}",
            "structured_location": "{\"uri\": \"geo:47.366667,8.550000\", \"name\": \"Insider Bar\"}",
            "styled_description": "{\"fmttype\": \"text/html\", \"value\": \"<p>Weekly Bitcoin meetup</p>\"}",
            "x_pubky_calendar_uri": "pubky://satoshi/pub/pubky.app/calendar/0033RCZXVEPNG"
        }
        "#;

        let id = PubkyAppEvent::new(
            Some("pubky://satoshi/pub/pubky.app/event/0033SCZXVEPNG".to_string()),
            Some(1698753600000000),
            Some(1698753600000000),
            Some(1698764400000000),
            Some("Bitcoin Meetup Zürich".to_string()),
            Some("CONFIRMED".to_string()),
            None,
            None,
            Some(1698753600000000),
            None,
            None,
            None,
            None,
            None,
            None,
            None,
            None,
            None,
        )
        .create_id();

        let blob = event_json.as_bytes();
        let event = <PubkyAppEvent as Validatable>::try_from(blob, &id).unwrap();

        assert_eq!(
            event.summary,
            Some("Bitcoin Meetup Zürich".to_string())
        );
        assert_eq!(event.status, Some("CONFIRMED".to_string()));
    }
}

