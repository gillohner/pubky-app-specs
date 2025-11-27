use crate::{
    common::timestamp,
    traits::{HasIdPath, HashId, Validatable},
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

/// Valid RSVP participation status values (RFC 5545)
const VALID_PARTSTAT: &[&str] = &["NEEDS-ACTION", "ACCEPTED", "DECLINED", "TENTATIVE"];

/// Attendee - an RSVP/participation record for an event (simplified for self-RSVP only)
/// URI: /pub/eventky.pub/attendees/:attendee_id
/// Where attendee_id is a hash generated from the event URI (stored under the user's space)
/// 
/// This simplified version only supports direct RSVP by the user themselves,
/// not delegation or organizer-created invite records.
#[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
#[derive(Serialize, Deserialize, Debug, Clone)]
#[cfg_attr(feature = "openapi", derive(ToSchema))]
pub struct PubkyAppAttendee {
    // RFC 5545 - Attendee Properties (simplified)
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub partstat: String,               // REQUIRED - NEEDS-ACTION | ACCEPTED | DECLINED | TENTATIVE
    pub created_at: i64,               // Creation timestamp (Unix microseconds)
    pub last_modified: Option<i64>,    // Last modification timestamp (Unix microseconds)

    // RFC 5545 - Recurrence Support
    pub recurrence_id: Option<i64>,     // For recurring events, specifies which instance

    // Pubky Extensions
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub x_pubky_event_uri: String,      // REQUIRED - URI of the event this RSVP belongs to
}

impl PubkyAppAttendee {
    /// Creates a new `PubkyAppAttendee` instance with default "NEEDS-ACTION" status.
    pub fn new(x_pubky_event_uri: String) -> Self {
        let now = timestamp();
        Self {
            partstat: "NEEDS-ACTION".to_string(),
            created_at: now,
            last_modified: Some(now),
            recurrence_id: None,
            x_pubky_event_uri,
        }
        .sanitize()
    }

    /// Creates a new attendee with a specific status
    pub fn with_status(x_pubky_event_uri: String, partstat: String) -> Self {
        let now = timestamp();
        Self {
            partstat,
            created_at: now,
            last_modified: Some(now),
            recurrence_id: None,
            x_pubky_event_uri,
        }
        .sanitize()
    }

    /// Helper functions for common statuses
    pub fn accepted(x_pubky_event_uri: String) -> Self {
        Self::with_status(x_pubky_event_uri, "ACCEPTED".to_string())
    }

    pub fn declined(x_pubky_event_uri: String) -> Self {
        Self::with_status(x_pubky_event_uri, "DECLINED".to_string())
    }

    pub fn tentative(x_pubky_event_uri: String) -> Self {
        Self::with_status(x_pubky_event_uri, "TENTATIVE".to_string())
    }

    /// Update the participation status
    pub fn update_status(&mut self, new_partstat: String) {
        self.partstat = new_partstat;
        self.last_modified = Some(timestamp());
    }
}

#[cfg(target_arch = "wasm32")]
#[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
impl PubkyAppAttendee {
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn partstat(&self) -> String {
        self.partstat.clone()
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn x_pubky_event_uri(&self) -> String {
        self.x_pubky_event_uri.clone()
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(js_name = fromJson))]
    pub fn from_json(js_value: &JsValue) -> Result<Self, String> {
        Self::import_json(js_value)
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(js_name = toJson))]
    pub fn to_json(&self) -> Result<JsValue, String> {
        self.export_json()
    }

    /// Update the participation status (WASM version)
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(js_name = updateStatus))]
    pub fn update_status_wasm(&mut self, new_partstat: String) {
        self.update_status(new_partstat);
    }
}

#[cfg(target_arch = "wasm32")]
impl Json for PubkyAppAttendee {}

#[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
impl PubkyAppAttendee {
    /// Creates a new `PubkyAppAttendee` instance for WASM.
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(constructor))]
    pub fn new_wasm(x_pubky_event_uri: String) -> Self {
        Self::new(x_pubky_event_uri)
    }

    /// Create status-specific attendees for WASM
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(js_name = accepted))]
    pub fn accepted_wasm(x_pubky_event_uri: String) -> Self {
        Self::accepted(x_pubky_event_uri)
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(js_name = declined))]
    pub fn declined_wasm(x_pubky_event_uri: String) -> Self {
        Self::declined(x_pubky_event_uri)
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(js_name = tentative))]
    pub fn tentative_wasm(x_pubky_event_uri: String) -> Self {
        Self::tentative(x_pubky_event_uri)
    }
}

impl HasIdPath for PubkyAppAttendee {
    const PATH_SEGMENT: &'static str = "attendees/";
    
    fn create_path(id: &str) -> String {
        [PUBLIC_PATH, EVENTKY_PATH, Self::PATH_SEGMENT, id].concat()
    }
}

impl HashId for PubkyAppAttendee {
    /// Generates an ID based on event URI (since attendee only tracks self-attendance)
    fn get_id_data(&self) -> String {
        // Create a deterministic ID based on event URI
        let data = serde_json::json!({
            "x_pubky_event_uri": self.x_pubky_event_uri
        });
        serde_json::to_string(&data).unwrap_or_default()
    }
}

impl Validatable for PubkyAppAttendee {
    fn sanitize(self) -> Self {
        // Sanitize partstat (normalize to uppercase and validate)
        let partstat = self.partstat.trim().to_uppercase();
        let partstat = if VALID_PARTSTAT.contains(&partstat.as_str()) {
            partstat
        } else {
            "NEEDS-ACTION".to_string() // Default to NEEDS-ACTION for invalid status
        };
        
        // Sanitize event URI
        let x_pubky_event_uri = match Url::parse(&self.x_pubky_event_uri.trim()) {
            Ok(url) => url.to_string(),
            Err(_) => self.x_pubky_event_uri.trim().to_string(), // Keep original if not parseable as URL
        };
        
        Self {
            partstat,
            created_at: self.created_at,
            last_modified: self.last_modified,
            recurrence_id: self.recurrence_id,
            x_pubky_event_uri,
        }
    }

    fn validate(&self, _id: Option<&str>) -> Result<(), String> {
        // Validate partstat
        if !VALID_PARTSTAT.contains(&self.partstat.as_str()) {
            return Err("Validation Error: Invalid participation status. Must be one of: NEEDS-ACTION, ACCEPTED, DECLINED, TENTATIVE".into());
        }

        // Validate event URI is not empty
        if self.x_pubky_event_uri.trim().is_empty() {
            return Err("Validation Error: Event URI is required".into());
        }

        // Validate event URI format (should be a valid pubky URI)
        if !self.x_pubky_event_uri.starts_with("pubky://") {
            return Err("Validation Error: Event URI must be a valid pubky:// URI".into());
        }

        // Validate timestamps
        if self.created_at <= 0 {
            return Err("Validation Error: Created timestamp must be positive".into());
        }

        if let Some(last_modified) = self.last_modified {
            if last_modified < self.created_at {
                return Err("Validation Error: Last modified timestamp cannot be before created timestamp".into());
            }
        }

        // Validate recurrence_id (if present, should be reasonable)
        if let Some(recurrence_id) = self.recurrence_id {
            let now = timestamp();
            let one_hundred_years = 100 * 365 * 24 * 60 * 60 * 1_000_000i64; // 100 years in microseconds
            
            if recurrence_id < now - one_hundred_years || recurrence_id > now + one_hundred_years {
                return Err("Validation Error: Recurrence ID timestamp is invalid".into());
            }
        }

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::traits::Validatable;

    fn sample_event_uri() -> String {
        "pubky://user123/pub/eventky.pub/events/01HCXB9P7QBVKM".to_string()
    }

    #[test]
    fn test_new() {
        let attendee = PubkyAppAttendee::with_status(
            sample_event_uri(),
            "ACCEPTED".to_string(),
        );

        assert_eq!(attendee.partstat, "ACCEPTED");
        assert_eq!(attendee.x_pubky_event_uri, sample_event_uri());
        assert!(attendee.recurrence_id.is_none());
        
        // Check that timestamps are recent
        let now = timestamp();
        assert!(attendee.created_at <= now && attendee.created_at >= now - 1_000_000);
        assert!(attendee.last_modified.unwrap() <= now && attendee.last_modified.unwrap() >= now - 1_000_000);
    }

    #[test]
    fn test_new_needs_action() {
        let attendee = PubkyAppAttendee::new(sample_event_uri());
        assert_eq!(attendee.partstat, "NEEDS-ACTION");
        assert_eq!(attendee.x_pubky_event_uri, sample_event_uri());
    }

    #[test]
    fn test_new_accepted() {
        let attendee = PubkyAppAttendee::accepted(sample_event_uri());
        assert_eq!(attendee.partstat, "ACCEPTED");
        assert_eq!(attendee.x_pubky_event_uri, sample_event_uri());
    }

    #[test]
    fn test_new_declined() {
        let attendee = PubkyAppAttendee::declined(sample_event_uri());
        assert_eq!(attendee.partstat, "DECLINED");
        assert_eq!(attendee.x_pubky_event_uri, sample_event_uri());
    }

    #[test]
    fn test_new_tentative() {
        let attendee = PubkyAppAttendee::tentative(sample_event_uri());
        assert_eq!(attendee.partstat, "TENTATIVE");
        assert_eq!(attendee.x_pubky_event_uri, sample_event_uri());
    }

    #[test]
    fn test_update_status() {
        let mut attendee = PubkyAppAttendee::new(sample_event_uri());
        let original_created = attendee.created_at;
        let original_modified = attendee.last_modified.unwrap();

        // Wait a tiny bit to ensure timestamp difference
        std::thread::sleep(std::time::Duration::from_micros(1));

        attendee.update_status("ACCEPTED".to_string());
        
        assert_eq!(attendee.partstat, "ACCEPTED");
        assert_eq!(attendee.created_at, original_created); // Should not change
        assert!(attendee.last_modified.unwrap() >= original_modified); // Should be updated
    }

    #[test]
    fn test_create_path() {
        let test_id = "test_id_123";
        let path = PubkyAppAttendee::create_path(test_id);
        let expected = format!("{}{}attendees/{}", PUBLIC_PATH, EVENTKY_PATH, test_id);
        assert_eq!(path, expected);
    }

    #[test]
    fn test_validate_valid() {
        let attendee = PubkyAppAttendee::accepted(sample_event_uri());
        let result = attendee.validate(None);
        assert!(result.is_ok());
    }

    #[test]
    fn test_validate_invalid_partstat() {
        let mut attendee = PubkyAppAttendee::accepted(sample_event_uri());
        attendee.partstat = "INVALID_STATUS".to_string();
        
        let result = attendee.validate(None);
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("Invalid participation status"));
    }

    #[test]
    fn test_validate_empty_event_uri() {
        let mut attendee = PubkyAppAttendee::accepted(sample_event_uri());
        attendee.x_pubky_event_uri = "".to_string();
        
        let result = attendee.validate(None);
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("Event URI is required"));
    }

    #[test]
    fn test_validate_invalid_event_uri() {
        let mut attendee = PubkyAppAttendee::accepted(sample_event_uri());
        attendee.x_pubky_event_uri = "https://example.com/event".to_string(); // Not a pubky URI
        
        let result = attendee.validate(None);
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("must be a valid pubky:// URI"));
    }

    #[test]
    fn test_validate_invalid_timestamps() {
        let mut attendee = PubkyAppAttendee::accepted(sample_event_uri());
        attendee.created_at = -1; // Invalid timestamp
        
        let result = attendee.validate(None);
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("Created timestamp must be positive"));
    }

    #[test]
    fn test_validate_invalid_last_modified() {
        let mut attendee = PubkyAppAttendee::accepted(sample_event_uri());
        attendee.last_modified = Some(attendee.created_at - 1); // Before created
        
        let result = attendee.validate(None);
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("Last modified timestamp cannot be before created"));
    }

    #[test]
    fn test_validate_invalid_recurrence_id() {
        let mut attendee = PubkyAppAttendee::accepted(sample_event_uri());
        let very_old_timestamp = -2_000_000_000_000_000i64; // Way before Unix epoch, outside 100-year range
        attendee.recurrence_id = Some(very_old_timestamp);
        
        let result = attendee.validate(None);
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("Recurrence ID timestamp is invalid"));
    }

    #[test]
    fn test_sanitize() {
        let attendee = PubkyAppAttendee::with_status(
            format!("  {}  ", sample_event_uri()), // with whitespace
            "  accepted  ".to_string(), // lowercase with whitespace
        );

        assert_eq!(attendee.partstat, "ACCEPTED"); // Should be uppercase and trimmed
        assert_eq!(attendee.x_pubky_event_uri, sample_event_uri()); // Should be trimmed
    }

    #[test]
    fn test_sanitize_invalid_partstat() {
        let attendee = PubkyAppAttendee::with_status(
            sample_event_uri(),
            "INVALID_STATUS".to_string(),
        );

        assert_eq!(attendee.partstat, "NEEDS-ACTION"); // Should default to NEEDS-ACTION
    }

    #[test]
    fn test_try_from_valid() {
        let attendee_json = r##"
        {
            "partstat": "ACCEPTED",
            "created_at": 1700000000,
            "last_modified": 1700000100,
            "recurrence_id": null,
            "x_pubky_event_uri": "pubky://user123/pub/eventky.pub/events/01HCXB9P7QBVKM"
        }
        "##;

        let blob = attendee_json.as_bytes();
        let attendee_parsed = <PubkyAppAttendee as Validatable>::try_from(blob, "").unwrap();

        assert_eq!(attendee_parsed.partstat, "ACCEPTED");
        assert_eq!(attendee_parsed.created_at, 1700000000);
        assert_eq!(attendee_parsed.last_modified, Some(1700000100));
        assert_eq!(attendee_parsed.x_pubky_event_uri, "pubky://user123/pub/eventky.pub/events/01HCXB9P7QBVKM");
        assert!(attendee_parsed.recurrence_id.is_none());
    }

    #[test]
    fn test_all_valid_partstat_values() {
        for &status in VALID_PARTSTAT {
            let attendee = PubkyAppAttendee::with_status(
                sample_event_uri(),
                status.to_string(),
            );
            let result = attendee.validate(None);
            assert!(result.is_ok(), "Status {} should be valid", status);
        }
    }
}