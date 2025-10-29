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

/// Represents an attendee/RSVP record in the Pubky ecosystem.
///
/// This struct implements RFC 5545/5546 ATTENDEE properties.
/// The attendee's name is fetched from their profile.json, not stored here.
///
/// # Storage Path
/// `/pub/pubky.app/attendee/:attendee_id`
///
/// Where `:attendee_id` is the Crockford base32 encoding of the RSVP's creation timestamp.
///
/// # Example
/// ```json
/// {
///   "attendee_uri": "pubky://alice",
///   "partstat": "ACCEPTED",
///   "role": "REQ-PARTICIPANT",
///   "rsvp": true,
///   "x_pubky_event_uri": "pubky://satoshi/pub/pubky.app/event/0033SCZXVEPNG"
/// }
/// ```
#[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
#[derive(Serialize, Deserialize, Default, Clone, Debug)]
#[cfg_attr(feature = "openapi", derive(ToSchema))]
pub struct PubkyAppAttendee {
    // RFC 5545/5546 - Attendee/RSVP Properties
    
    /// Pubky URI of the attendee (REQUIRED)
    /// Name is fetched from the attendee's profile.json
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub attendee_uri: String,
    
    /// Participation status (REQUIRED)
    /// Values: NEEDS-ACTION | ACCEPTED | DECLINED | TENTATIVE
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub partstat: String,
    
    /// Role of the attendee
    /// Values: CHAIR | REQ-PARTICIPANT | OPT-PARTICIPANT | NON-PARTICIPANT
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub role: Option<String>,
    
    /// Whether RSVP is requested/expected
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub rsvp: Option<bool>,
    
    /// Pubky URI of the delegator (for future delegation support)
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub delegated_from: Option<String>,
    
    /// Pubky URI of the delegatee (for future delegation support)
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub delegated_to: Option<String>,
    
    /// For recurring events, specifies which instance this RSVP is for
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub recurrence_id: Option<i64>,

    // Pubky Extensions
    
    /// URI of the event this RSVP belongs to (REQUIRED)
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub x_pubky_event_uri: String,
}

#[cfg(target_arch = "wasm32")]
#[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
impl PubkyAppAttendee {
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn attendee_uri(&self) -> String {
        self.attendee_uri.clone()
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn partstat(&self) -> String {
        self.partstat.clone()
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn role(&self) -> Option<String> {
        self.role.clone()
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn rsvp(&self) -> Option<bool> {
        self.rsvp
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn delegated_from(&self) -> Option<String> {
        self.delegated_from.clone()
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn delegated_to(&self) -> Option<String> {
        self.delegated_to.clone()
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn recurrence_id(&self) -> Option<i64> {
        self.recurrence_id
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
}

#[cfg(target_arch = "wasm32")]
impl Json for PubkyAppAttendee {}

#[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
impl PubkyAppAttendee {
    /// Creates a new `PubkyAppAttendee` instance and sanitizes it.
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(constructor))]
    pub fn new(
        attendee_uri: String,
        partstat: String,
        role: Option<String>,
        rsvp: Option<bool>,
        delegated_from: Option<String>,
        delegated_to: Option<String>,
        recurrence_id: Option<i64>,
        x_pubky_event_uri: String,
    ) -> Self {
        let attendee = PubkyAppAttendee {
            attendee_uri,
            partstat,
            role,
            rsvp,
            delegated_from,
            delegated_to,
            recurrence_id,
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
        // Sanitize required URIs
        let attendee_uri = if let Ok(url) = Url::parse(&self.attendee_uri) {
            url.to_string()
        } else {
            self.attendee_uri
        };

        let x_pubky_event_uri = if let Ok(url) = Url::parse(&self.x_pubky_event_uri) {
            url.to_string()
        } else {
            self.x_pubky_event_uri
        };

        // Sanitize status and role - must be valid values
        let partstat = self.partstat.trim().to_uppercase();
        let role = self.role.map(|r| r.trim().to_uppercase());

        // Sanitize delegation URIs
        let delegated_from = self
            .delegated_from
            .and_then(|uri| Url::parse(&uri).ok().map(|url| url.to_string()));

        let delegated_to = self
            .delegated_to
            .and_then(|uri| Url::parse(&uri).ok().map(|url| url.to_string()));

        PubkyAppAttendee {
            attendee_uri,
            partstat,
            role,
            rsvp: self.rsvp,
            delegated_from,
            delegated_to,
            recurrence_id: self.recurrence_id,
            x_pubky_event_uri,
        }
    }

    fn validate(&self, id: Option<&str>) -> Result<(), String> {
        // Validate the attendee ID
        if let Some(id) = id {
            self.validate_id(id)?;
        }

        // Validate required fields
        if self.attendee_uri.is_empty() {
            return Err("Validation Error: Attendee attendee_uri cannot be empty".into());
        }

        Url::parse(&self.attendee_uri).map_err(|_| {
            format!(
                "Validation Error: Invalid attendee_uri: {}",
                self.attendee_uri
            )
        })?;

        if self.partstat.is_empty() {
            return Err("Validation Error: Attendee partstat cannot be empty".into());
        }

        // Validate partstat value
        match self.partstat.as_str() {
            "NEEDS-ACTION" | "ACCEPTED" | "DECLINED" | "TENTATIVE" => {}
            _ => {
                return Err(format!(
                    "Validation Error: Invalid partstat: {}. Must be one of: NEEDS-ACTION, ACCEPTED, DECLINED, TENTATIVE",
                    self.partstat
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

        // Validate event URI
        if self.x_pubky_event_uri.is_empty() {
            return Err("Validation Error: Attendee x_pubky_event_uri cannot be empty".into());
        }

        let parsed = Url::parse(&self.x_pubky_event_uri).map_err(|_| {
            format!(
                "Validation Error: Invalid x_pubky_event_uri: {}",
                self.x_pubky_event_uri
            )
        })?;

        if parsed.scheme() != "pubky" {
            return Err(format!(
                "Validation Error: Event URI must use pubky:// scheme: {}",
                self.x_pubky_event_uri
            ));
        }

        // Validate delegation URIs if present
        if let Some(delegated_from) = &self.delegated_from {
            Url::parse(delegated_from).map_err(|_| {
                format!(
                    "Validation Error: Invalid delegated_from URI: {}",
                    delegated_from
                )
            })?;
        }

        if let Some(delegated_to) = &self.delegated_to {
            Url::parse(delegated_to).map_err(|_| {
                format!(
                    "Validation Error: Invalid delegated_to URI: {}",
                    delegated_to
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

    fn create_test_attendee() -> PubkyAppAttendee {
        PubkyAppAttendee::new(
            "pubky://alice".to_string(),
            "ACCEPTED".to_string(),
            Some("REQ-PARTICIPANT".to_string()),
            Some(true),
            None,
            None,
            None,
            "pubky://satoshi/pub/pubky.app/event/0033SCZXVEPNG".to_string(),
        )
    }

    #[test]
    fn test_create_id() {
        let attendee = create_test_attendee();
        let attendee_id = attendee.create_id();
        println!("Generated Attendee ID: {}", attendee_id);
        assert_eq!(attendee_id.len(), 13);
    }

    #[test]
    fn test_new() {
        let attendee = create_test_attendee();
        assert_eq!(attendee.attendee_uri, "pubky://alice".to_string());
        assert_eq!(attendee.partstat, "ACCEPTED".to_string());
        assert_eq!(
            attendee.role,
            Some("REQ-PARTICIPANT".to_string())
        );
        assert_eq!(attendee.rsvp, Some(true));
    }

    #[test]
    fn test_create_path() {
        let attendee = create_test_attendee();
        let attendee_id = attendee.create_id();
        let path = PubkyAppAttendee::create_path(&attendee_id);

        let prefix = format!("{}{}attendee/", PUBLIC_PATH, APP_PATH);
        assert!(path.starts_with(&prefix));

        let expected_path_len = prefix.len() + attendee_id.len();
        assert_eq!(path.len(), expected_path_len);
    }

    #[test]
    fn test_sanitize() {
        let attendee = PubkyAppAttendee::new(
            "pubky://alice".to_string(),
            "  accepted  ".to_string(),
            Some("  req-participant  ".to_string()),
            Some(true),
            Some("invalid uri".to_string()),
            None,
            None,
            "pubky://satoshi/pub/pubky.app/event/0033SCZXVEPNG".to_string(),
        );

        let sanitized = attendee.sanitize();
        assert_eq!(sanitized.partstat, "ACCEPTED".to_string());
        assert_eq!(sanitized.role, Some("REQ-PARTICIPANT".to_string()));
        // Invalid delegation URI should be filtered out
        assert!(sanitized.delegated_from.is_none());
    }

    #[test]
    fn test_validate_valid() {
        let attendee = create_test_attendee();
        let id = attendee.create_id();
        let result = attendee.validate(Some(&id));
        assert!(result.is_ok());
    }

    #[test]
    fn test_validate_missing_attendee_uri() {
        let mut attendee = create_test_attendee();
        attendee.attendee_uri = String::new();
        let id = attendee.create_id();
        let result = attendee.validate(Some(&id));
        assert!(result.is_err());
        assert!(result
            .unwrap_err()
            .contains("attendee_uri cannot be empty"));
    }

    #[test]
    fn test_validate_missing_partstat() {
        let mut attendee = create_test_attendee();
        attendee.partstat = String::new();
        let id = attendee.create_id();
        let result = attendee.validate(Some(&id));
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("partstat cannot be empty"));
    }

    #[test]
    fn test_validate_invalid_partstat() {
        let mut attendee = create_test_attendee();
        attendee.partstat = "INVALID_STATUS".to_string();
        let id = attendee.create_id();
        let result = attendee.validate(Some(&id));
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("Invalid partstat"));
    }

    #[test]
    fn test_validate_invalid_role() {
        let mut attendee = create_test_attendee();
        attendee.role = Some("INVALID_ROLE".to_string());
        let id = attendee.create_id();
        let result = attendee.validate(Some(&id));
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("Invalid role"));
    }

    #[test]
    fn test_validate_event_uri_must_be_pubky() {
        let mut attendee = create_test_attendee();
        attendee.x_pubky_event_uri = "https://example.com/event/123".to_string();
        let id = attendee.create_id();
        let result = attendee.validate(Some(&id));
        assert!(result.is_err());
        assert!(result
            .unwrap_err()
            .contains("must use pubky:// scheme"));
    }

    #[test]
    fn test_validate_with_delegation() {
        let mut attendee = create_test_attendee();
        attendee.delegated_from = Some("pubky://bob".to_string());
        attendee.delegated_to = Some("pubky://carol".to_string());
        let id = attendee.create_id();
        let result = attendee.validate(Some(&id));
        assert!(result.is_ok());
    }

    #[test]
    fn test_validate_with_recurrence_id() {
        let mut attendee = create_test_attendee();
        attendee.recurrence_id = Some(1698753600000000);
        let id = attendee.create_id();
        let result = attendee.validate(Some(&id));
        assert!(result.is_ok());
    }

    #[test]
    fn test_try_from_valid() {
        let attendee_json = r#"
        {
            "attendee_uri": "pubky://alice",
            "partstat": "ACCEPTED",
            "role": "REQ-PARTICIPANT",
            "rsvp": true,
            "x_pubky_event_uri": "pubky://satoshi/pub/pubky.app/event/0033SCZXVEPNG"
        }
        "#;

        let id = create_test_attendee().create_id();
        let blob = attendee_json.as_bytes();
        let attendee = <PubkyAppAttendee as Validatable>::try_from(blob, &id).unwrap();

        assert_eq!(attendee.attendee_uri, "pubky://alice".to_string());
        assert_eq!(attendee.partstat, "ACCEPTED".to_string());
        assert_eq!(attendee.rsvp, Some(true));
    }
}
