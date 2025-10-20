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

/// Represents an attendee/RSVP in the Pubky ecosystem
/// URI: /pub/pubky.app/attendee/:attendee_id
/// Where attendee_id is CrockfordBase32 encoding of timestamp
///
/// Example URI:
///
/// `/pub/pubky.app/attendee/0033UCZXVEPNG`
#[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
#[derive(Serialize, Deserialize, Default, Clone, Debug)]
#[cfg_attr(feature = "openapi", derive(ToSchema))]
pub struct PubkyAppAttendee {
    // RFC 5545 / 5546 - Attendee/RSVP Properties
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub attendee_uri: Option<String>, // Pubky URI of attendee
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub attendee_name: Option<String>, // Display name
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub partstat: Option<String>, // NEEDS-ACTION | ACCEPTED | DECLINED | TENTATIVE | DELEGATED
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub role: Option<String>, // CHAIR | REQ-PARTICIPANT | OPT-PARTICIPANT | NON-PARTICIPANT

    // Pubky Linkage
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub x_pubky_event_uri: Option<String>, // URI of the event this RSVP belongs to
}

#[cfg(target_arch = "wasm32")]
#[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
impl PubkyAppAttendee {
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn attendee_uri(&self) -> Option<String> {
        self.attendee_uri.clone()
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn attendee_name(&self) -> Option<String> {
        self.attendee_name.clone()
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn partstat(&self) -> Option<String> {
        self.partstat.clone()
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn role(&self) -> Option<String> {
        self.role.clone()
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn x_pubky_event_uri(&self) -> Option<String> {
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
}

#[cfg(target_arch = "wasm32")]
impl Json for PubkyAppAttendee {}

#[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
impl PubkyAppAttendee {
    /// Creates a new `PubkyAppAttendee` instance and sanitizes it.
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(constructor))]
    pub fn new(
        attendee_uri: Option<String>,
        attendee_name: Option<String>,
        partstat: Option<String>,
        role: Option<String>,
        x_pubky_event_uri: Option<String>,
    ) -> Self {
        let attendee = PubkyAppAttendee {
            attendee_uri,
            attendee_name,
            partstat,
            role,
            x_pubky_event_uri,
        };
        attendee.sanitize()
    }
}

impl TimestampId for PubkyAppAttendee {}

impl HasIdPath for PubkyAppAttendee {
    const PATH_SEGMENT: &'static str = "attendee/";

    fn create_path(id: &str) -> String {
        [PUBLIC_PATH, APP_PATH, Self::PATH_SEGMENT, id].concat()
    }
}

impl Validatable for PubkyAppAttendee {
    fn sanitize(self) -> Self {
        // Sanitize URIs
        let attendee_uri = self
            .attendee_uri
            .and_then(|uri| Url::parse(&uri).ok().map(|url| url.to_string()));

        let x_pubky_event_uri = self
            .x_pubky_event_uri
            .and_then(|uri| Url::parse(&uri).ok().map(|url| url.to_string()));

        // Sanitize name
        let attendee_name = self.attendee_name.map(|n| n.trim().to_string());

        // Sanitize status and role - must be valid values
        let partstat = self.partstat.map(|s| s.trim().to_uppercase());
        let role = self.role.map(|r| r.trim().to_uppercase());

        PubkyAppAttendee {
            attendee_uri,
            attendee_name,
            partstat,
            role,
            x_pubky_event_uri,
        }
    }

    fn validate(&self, id: Option<&str>) -> Result<(), String> {
        // Validate the attendee ID
        if let Some(id) = id {
            self.validate_id(id)?;
        }

        // Validate required fields
        let attendee_uri = self
            .attendee_uri
            .as_ref()
            .ok_or("Validation Error: Attendee attendee_uri is required")?;

        Url::parse(attendee_uri).map_err(|_| {
            format!(
                "Validation Error: Invalid attendee_uri: {}",
                attendee_uri
            )
        })?;

        let partstat = self
            .partstat
            .as_ref()
            .ok_or("Validation Error: Attendee partstat is required")?;

        // Validate partstat value
        match partstat.as_str() {
            "NEEDS-ACTION" | "ACCEPTED" | "DECLINED" | "TENTATIVE" | "DELEGATED" => {}
            _ => {
                return Err(format!(
                    "Validation Error: Invalid partstat: {}. Must be one of: NEEDS-ACTION, ACCEPTED, DECLINED, TENTATIVE, DELEGATED",
                    partstat
                ))
            }
        }

        // Validate role if present
        if let Some(role) = &self.role {
            match role.as_str() {
                "CHAIR" | "REQ-PARTICIPANT" | "OPT-PARTICIPANT" | "NON-PARTICIPANT" => {}
                _ => {
                    return Err(format!(
                        "Validation Error: Invalid role: {}. Must be one of: CHAIR, REQ-PARTICIPANT, OPT-PARTICIPANT, NON-PARTICIPANT",
                        role
                    ))
                }
            }
        }

        // Validate event URI if present
        if let Some(event_uri) = &self.x_pubky_event_uri {
            Url::parse(event_uri).map_err(|_| {
                format!(
                    "Validation Error: Invalid x_pubky_event_uri: {}",
                    event_uri
                )
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
        let attendee = PubkyAppAttendee::new(
            Some("pubky://alice".to_string()),
            Some("Alice".to_string()),
            Some("ACCEPTED".to_string()),
            Some("REQ-PARTICIPANT".to_string()),
            Some("pubky://satoshi/pub/pubky.app/event/0033SCZXVEPNG".to_string()),
        );

        let attendee_id = attendee.create_id();
        println!("Generated Attendee ID: {}", attendee_id);

        // Assert that the attendee ID is 13 characters long
        assert_eq!(attendee_id.len(), 13);
    }

    #[test]
    fn test_new() {
        let attendee = PubkyAppAttendee::new(
            Some("pubky://alice".to_string()),
            Some("Alice".to_string()),
            Some("ACCEPTED".to_string()),
            Some("REQ-PARTICIPANT".to_string()),
            Some("pubky://satoshi/pub/pubky.app/event/0033SCZXVEPNG".to_string()),
        );

        assert_eq!(attendee.attendee_uri, Some("pubky://alice".to_string()));
        assert_eq!(attendee.attendee_name, Some("Alice".to_string()));
        assert_eq!(attendee.partstat, Some("ACCEPTED".to_string()));
        assert_eq!(attendee.role, Some("REQ-PARTICIPANT".to_string()));
    }

    #[test]
    fn test_create_path() {
        let attendee = PubkyAppAttendee::new(
            Some("pubky://alice".to_string()),
            Some("Alice".to_string()),
            Some("ACCEPTED".to_string()),
            Some("REQ-PARTICIPANT".to_string()),
            None,
        );

        let attendee_id = attendee.create_id();
        let path = PubkyAppAttendee::create_path(&attendee_id);

        // Check if the path starts with the expected prefix
        let prefix = format!("{}{}attendee/", PUBLIC_PATH, APP_PATH);
        assert!(path.starts_with(&prefix));

        let expected_path_len = prefix.len() + attendee_id.len();
        assert_eq!(path.len(), expected_path_len);
    }

    #[test]
    fn test_sanitize() {
        let attendee = PubkyAppAttendee::new(
            Some("pubky://alice".to_string()),
            Some("  Alice  ".to_string()),
            Some("  accepted  ".to_string()),
            Some("  req-participant  ".to_string()),
            Some("invalid uri".to_string()),
        );

        let sanitized = attendee.sanitize();
        assert_eq!(sanitized.attendee_name, Some("Alice".to_string()));
        assert_eq!(sanitized.partstat, Some("ACCEPTED".to_string()));
        assert_eq!(sanitized.role, Some("REQ-PARTICIPANT".to_string()));
        // Invalid event URI should be filtered out
        assert!(sanitized.x_pubky_event_uri.is_none());
    }

    #[test]
    fn test_validate_valid() {
        let attendee = PubkyAppAttendee::new(
            Some("pubky://alice".to_string()),
            Some("Alice".to_string()),
            Some("ACCEPTED".to_string()),
            Some("REQ-PARTICIPANT".to_string()),
            Some("pubky://satoshi/pub/pubky.app/event/0033SCZXVEPNG".to_string()),
        );

        let id = attendee.create_id();
        let result = attendee.validate(Some(&id));
        assert!(result.is_ok());
    }

    #[test]
    fn test_validate_missing_required_fields() {
        let attendee = PubkyAppAttendee::new(None, None, None, None, None);

        let id = attendee.create_id();
        let result = attendee.validate(Some(&id));
        assert!(result.is_err());
        assert!(result
            .unwrap_err()
            .contains("attendee_uri is required"));
    }

    #[test]
    fn test_validate_invalid_partstat() {
        let attendee = PubkyAppAttendee::new(
            Some("pubky://alice".to_string()),
            Some("Alice".to_string()),
            Some("INVALID_STATUS".to_string()),
            None,
            None,
        );

        let id = attendee.create_id();
        let result = attendee.validate(Some(&id));
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("Invalid partstat"));
    }

    #[test]
    fn test_validate_invalid_role() {
        let attendee = PubkyAppAttendee::new(
            Some("pubky://alice".to_string()),
            Some("Alice".to_string()),
            Some("ACCEPTED".to_string()),
            Some("INVALID_ROLE".to_string()),
            None,
        );

        let id = attendee.create_id();
        let result = attendee.validate(Some(&id));
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("Invalid role"));
    }

    #[test]
    fn test_try_from_valid() {
        let attendee_json = r#"
        {
            "attendee_uri": "pubky://alice",
            "attendee_name": "Alice",
            "partstat": "ACCEPTED",
            "role": "REQ-PARTICIPANT",
            "x_pubky_event_uri": "pubky://satoshi/pub/pubky.app/event/0033SCZXVEPNG"
        }
        "#;

        let id = PubkyAppAttendee::new(
            Some("pubky://alice".to_string()),
            Some("Alice".to_string()),
            Some("ACCEPTED".to_string()),
            Some("REQ-PARTICIPANT".to_string()),
            Some("pubky://satoshi/pub/pubky.app/event/0033SCZXVEPNG".to_string()),
        )
        .create_id();

        let blob = attendee_json.as_bytes();
        let attendee = <PubkyAppAttendee as Validatable>::try_from(blob, &id).unwrap();

        assert_eq!(attendee.attendee_uri, Some("pubky://alice".to_string()));
        assert_eq!(attendee.partstat, Some("ACCEPTED".to_string()));
    }
}

