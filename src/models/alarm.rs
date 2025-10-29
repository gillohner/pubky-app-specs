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

/// Represents an alarm/reminder in the Pubky ecosystem.
///
/// This struct implements RFC 5545 VALARM component.
///
/// # Storage Path
/// `/pub/pubky.app/alarm/:alarm_id`
///
/// Where `:alarm_id` is the Crockford base32 encoding of the alarm's creation timestamp.
///
/// # Example
/// ```json
/// {
///   "action": "DISPLAY",
///   "trigger": "-PT15M",
///   "description": "Bitcoin Meetup in 15 minutes",
///   "x_pubky_target_uri": "pubky://satoshi/pub/pubky.app/event/0033SCZXVEPNG"
/// }
/// ```
#[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
#[derive(Serialize, Deserialize, Default, Clone, Debug)]
#[cfg_attr(feature = "openapi", derive(ToSchema))]
pub struct PubkyAppAlarm {
    // RFC 5545 - Alarm Properties (REQUIRED)
    
    /// Alarm action type (REQUIRED)
    /// Values: AUDIO | DISPLAY | EMAIL
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub action: String,
    
    /// Trigger time (REQUIRED)
    /// Duration format (e.g., "-PT15M" for 15 minutes before)
    /// or absolute timestamp
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub trigger: String,

    // RFC 5545 - Optional Alarm Properties
    
    /// Alarm description (REQUIRED for DISPLAY and EMAIL actions)
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub description: Option<String>,
    
    /// Email subject (REQUIRED for EMAIL action)
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub summary: Option<String>,
    
    /// Email recipients (REQUIRED for EMAIL action)
    /// Pubky URIs of recipients
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub attendees: Option<Vec<String>>,

    // RFC 5545 - Repeat Functionality
    
    /// Number of additional repetitions (beyond the initial trigger)
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub repeat: Option<i32>,
    
    /// Delay between repetitions (RFC 5545 duration format)
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub duration: Option<String>,

    // RFC 5545 - Attachments
    
    /// URIs to attachments (audio file for AUDIO, files for EMAIL)
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub attach: Option<Vec<String>>,

    // Pubky Extensions
    
    /// Target event or calendar URI (REQUIRED)
    /// Must be a pubky:// URI
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub x_pubky_target_uri: String,
}

#[cfg(target_arch = "wasm32")]
#[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
impl PubkyAppAlarm {
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn action(&self) -> String {
        self.action.clone()
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn trigger(&self) -> String {
        self.trigger.clone()
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn description(&self) -> Option<String> {
        self.description.clone()
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn summary(&self) -> Option<String> {
        self.summary.clone()
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn attendees(&self) -> Option<Vec<String>> {
        self.attendees.clone()
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn repeat(&self) -> Option<i32> {
        self.repeat
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn duration(&self) -> Option<String> {
        self.duration.clone()
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn attach(&self) -> Option<Vec<String>> {
        self.attach.clone()
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn x_pubky_target_uri(&self) -> String {
        self.x_pubky_target_uri.clone()
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
impl Json for PubkyAppAlarm {}

#[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
impl PubkyAppAlarm {
    /// Creates a new `PubkyAppAlarm` instance and sanitizes it.
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(constructor))]
    pub fn new(
        action: String,
        trigger: String,
        description: Option<String>,
        summary: Option<String>,
        attendees: Option<Vec<String>>,
        repeat: Option<i32>,
        duration: Option<String>,
        attach: Option<Vec<String>>,
        x_pubky_target_uri: String,
    ) -> Self {
        let alarm = PubkyAppAlarm {
            action,
            trigger,
            description,
            summary,
            attendees,
            repeat,
            duration,
            attach,
            x_pubky_target_uri,
        };
        alarm.sanitize()
    }
}

impl TimestampId for PubkyAppAlarm {}

impl HasIdPath for PubkyAppAlarm {
    const PATH_SEGMENT: &'static str = "alarm/";

    fn create_path(id: &str) -> String {
        [PUBLIC_PATH, APP_PATH, Self::PATH_SEGMENT, id].concat()
    }
}

impl Validatable for PubkyAppAlarm {
    fn sanitize(self) -> Self {
        // Sanitize required fields
        let action = self.action.trim().to_uppercase();
        let trigger = self.trigger.trim().to_string();
        
        let x_pubky_target_uri = if let Ok(url) = Url::parse(&self.x_pubky_target_uri) {
            url.to_string()
        } else {
            self.x_pubky_target_uri
        };

        // Sanitize optional text fields
        let description = self.description.map(|s| s.trim().to_string());
        let summary = self.summary.map(|s| s.trim().to_string());
        let duration = self.duration.map(|s| s.trim().to_string());

        // Sanitize attendee URIs
        let attendees = self.attendees.map(|uris| {
            uris.iter()
                .filter_map(|uri| Url::parse(uri).ok().map(|url| url.to_string()))
                .collect()
        });

        // Sanitize attachment URIs
        let attach = self.attach.map(|uris| {
            uris.iter()
                .filter_map(|uri| Url::parse(uri).ok().map(|url| url.to_string()))
                .collect()
        });

        PubkyAppAlarm {
            action,
            trigger,
            description,
            summary,
            attendees,
            repeat: self.repeat,
            duration,
            attach,
            x_pubky_target_uri,
        }
    }

    fn validate(&self, id: Option<&str>) -> Result<(), String> {
        // Validate the alarm ID
        if let Some(id) = id {
            self.validate_id(id)?;
        }

        // Validate required fields
        if self.action.is_empty() {
            return Err("Validation Error: Alarm action cannot be empty".into());
        }

        // Validate action values
        match self.action.as_str() {
            "AUDIO" | "DISPLAY" | "EMAIL" => {}
            _ => {
                return Err(format!(
                    "Validation Error: Invalid alarm action: {}. Must be AUDIO, DISPLAY, or EMAIL",
                    self.action
                ))
            }
        }

        if self.trigger.is_empty() {
            return Err("Validation Error: Alarm trigger cannot be empty".into());
        }

        // Validate action-specific requirements
        match self.action.as_str() {
            "DISPLAY" | "EMAIL" => {
                if self.description.is_none() || self.description.as_ref().unwrap().is_empty() {
                    return Err(format!(
                        "Validation Error: Alarm description is required for {} action",
                        self.action
                    ));
                }
            }
            _ => {}
        }

        if self.action == "EMAIL" {
            if self.summary.is_none() || self.summary.as_ref().unwrap().is_empty() {
                return Err("Validation Error: Alarm summary is required for EMAIL action".into());
            }
            if self.attendees.is_none() || self.attendees.as_ref().unwrap().is_empty() {
                return Err("Validation Error: Alarm attendees are required for EMAIL action".into());
            }
        }

        // Validate repeat/duration combination
        if self.repeat.is_some() && self.duration.is_none() {
            return Err(
                "Validation Error: Alarm duration is required when repeat is specified".into()
            );
        }

        // Validate target URI
        if self.x_pubky_target_uri.is_empty() {
            return Err("Validation Error: Alarm x_pubky_target_uri cannot be empty".into());
        }

        let parsed = Url::parse(&self.x_pubky_target_uri).map_err(|_| {
            format!(
                "Validation Error: Invalid x_pubky_target_uri: {}",
                self.x_pubky_target_uri
            )
        })?;

        if parsed.scheme() != "pubky" {
            return Err(format!(
                "Validation Error: Target URI must use pubky:// scheme: {}",
                self.x_pubky_target_uri
            ));
        }

        // Validate attendee URIs for EMAIL action
        if let Some(attendees) = &self.attendees {
            for uri in attendees {
                Url::parse(uri).map_err(|_| {
                    format!("Validation Error: Invalid attendee URI: {}", uri)
                })?;
            }
        }

        // Validate attachment URIs
        if let Some(attachments) = &self.attach {
            for uri in attachments {
                Url::parse(uri).map_err(|_| {
                    format!("Validation Error: Invalid attachment URI: {}", uri)
                })?;
            }
        }

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::traits::Validatable;

    fn create_test_alarm_display() -> PubkyAppAlarm {
        PubkyAppAlarm::new(
            "DISPLAY".to_string(),
            "-PT15M".to_string(),
            Some("Bitcoin Meetup in 15 minutes".to_string()),
            None,
            None,
            None,
            None,
            None,
            "pubky://satoshi/pub/pubky.app/event/0033SCZXVEPNG".to_string(),
        )
    }

    fn create_test_alarm_email() -> PubkyAppAlarm {
        PubkyAppAlarm::new(
            "EMAIL".to_string(),
            "-PT1H".to_string(),
            Some("You have an upcoming Bitcoin meetup".to_string()),
            Some("Bitcoin Meetup Reminder".to_string()),
            Some(vec!["pubky://alice".to_string()]),
            None,
            None,
            None,
            "pubky://satoshi/pub/pubky.app/event/0033SCZXVEPNG".to_string(),
        )
    }

    #[test]
    fn test_create_id() {
        let alarm = create_test_alarm_display();
        let alarm_id = alarm.create_id();
        println!("Generated Alarm ID: {}", alarm_id);
        assert_eq!(alarm_id.len(), 13);
    }

    #[test]
    fn test_create_path() {
        let alarm = create_test_alarm_display();
        let alarm_id = alarm.create_id();
        let path = PubkyAppAlarm::create_path(&alarm_id);

        let prefix = format!("{}{}alarm/", PUBLIC_PATH, APP_PATH);
        assert!(path.starts_with(&prefix));

        let expected_path_len = prefix.len() + alarm_id.len();
        assert_eq!(path.len(), expected_path_len);
    }

    #[test]
    fn test_validate_display_alarm() {
        let alarm = create_test_alarm_display();
        let id = alarm.create_id();
        let result = alarm.validate(Some(&id));
        assert!(result.is_ok());
    }

    #[test]
    fn test_validate_email_alarm() {
        let alarm = create_test_alarm_email();
        let id = alarm.create_id();
        let result = alarm.validate(Some(&id));
        assert!(result.is_ok());
    }

    #[test]
    fn test_validate_missing_action() {
        let mut alarm = create_test_alarm_display();
        alarm.action = String::new();
        let id = alarm.create_id();
        let result = alarm.validate(Some(&id));
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("action cannot be empty"));
    }

    #[test]
    fn test_validate_invalid_action() {
        let mut alarm = create_test_alarm_display();
        alarm.action = "INVALID".to_string();
        let id = alarm.create_id();
        let result = alarm.validate(Some(&id));
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("Invalid alarm action"));
    }

    #[test]
    fn test_validate_display_requires_description() {
        let mut alarm = create_test_alarm_display();
        alarm.description = None;
        let id = alarm.create_id();
        let result = alarm.validate(Some(&id));
        assert!(result.is_err());
        assert!(result
            .unwrap_err()
            .contains("description is required for DISPLAY"));
    }

    #[test]
    fn test_validate_email_requires_summary() {
        let mut alarm = create_test_alarm_email();
        alarm.summary = None;
        let id = alarm.create_id();
        let result = alarm.validate(Some(&id));
        assert!(result.is_err());
        assert!(result
            .unwrap_err()
            .contains("summary is required for EMAIL"));
    }

    #[test]
    fn test_validate_email_requires_attendees() {
        let mut alarm = create_test_alarm_email();
        alarm.attendees = None;
        let id = alarm.create_id();
        let result = alarm.validate(Some(&id));
        assert!(result.is_err());
        assert!(result
            .unwrap_err()
            .contains("attendees are required for EMAIL"));
    }

    #[test]
    fn test_validate_repeat_requires_duration() {
        let mut alarm = create_test_alarm_display();
        alarm.repeat = Some(3);
        alarm.duration = None;
        let id = alarm.create_id();
        let result = alarm.validate(Some(&id));
        assert!(result.is_err());
        assert!(result
            .unwrap_err()
            .contains("duration is required when repeat"));
    }

    #[test]
    fn test_validate_target_uri_must_be_pubky() {
        let mut alarm = create_test_alarm_display();
        alarm.x_pubky_target_uri = "https://example.com/event/123".to_string();
        let id = alarm.create_id();
        let result = alarm.validate(Some(&id));
        assert!(result.is_err());
        assert!(result
            .unwrap_err()
            .contains("must use pubky:// scheme"));
    }

    #[test]
    fn test_validate_with_repeat_and_duration() {
        let mut alarm = create_test_alarm_display();
        alarm.repeat = Some(3);
        alarm.duration = Some("PT5M".to_string());
        let id = alarm.create_id();
        let result = alarm.validate(Some(&id));
        assert!(result.is_ok());
    }

    #[test]
    fn test_try_from_valid() {
        let alarm_json = r#"
        {
            "action": "DISPLAY",
            "trigger": "-PT15M",
            "description": "Bitcoin Meetup in 15 minutes",
            "x_pubky_target_uri": "pubky://satoshi/pub/pubky.app/event/0033SCZXVEPNG"
        }
        "#;

        let id = create_test_alarm_display().create_id();
        let blob = alarm_json.as_bytes();
        let alarm = <PubkyAppAlarm as Validatable>::try_from(blob, &id).unwrap();

        assert_eq!(alarm.action, "DISPLAY".to_string());
        assert_eq!(alarm.trigger, "-PT15M".to_string());
        assert_eq!(
            alarm.description,
            Some("Bitcoin Meetup in 15 minutes".to_string())
        );
    }
}
