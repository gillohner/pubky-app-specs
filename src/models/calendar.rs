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
const MAX_NAME_LENGTH: usize = 255;

/// Represents a calendar in the Pubky ecosystem
/// URI: /pub/pubky.app/calendar/:calendar_id
/// Where calendar_id is CrockfordBase32 encoding of timestamp
///
/// Example URI:
///
/// `/pub/pubky.app/calendar/0033RCZXVEPNG`
#[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
#[derive(Serialize, Deserialize, Default, Clone, Debug)]
#[cfg_attr(feature = "openapi", derive(ToSchema))]
pub struct PubkyAppCalendar {
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub name: Option<String>, // Calendar display name
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub color: Option<String>, // CSS color value (hex)
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub x_pubky_admins: Option<Vec<String>>, // Pubky URIs of admin users
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub timezone: Option<String>, // IANA timezone ID
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub created: Option<i64>, // Unix microseconds
}

#[cfg(target_arch = "wasm32")]
#[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
impl PubkyAppCalendar {
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn name(&self) -> Option<String> {
        self.name.clone()
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn color(&self) -> Option<String> {
        self.color.clone()
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn x_pubky_admins(&self) -> Option<Vec<String>> {
        self.x_pubky_admins.clone()
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn timezone(&self) -> Option<String> {
        self.timezone.clone()
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn created(&self) -> Option<i64> {
        self.created
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
impl Json for PubkyAppCalendar {}

#[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
impl PubkyAppCalendar {
    /// Creates a new `PubkyAppCalendar` instance and sanitizes it.
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(constructor))]
    pub fn new(
        name: Option<String>,
        color: Option<String>,
        x_pubky_admins: Option<Vec<String>>,
        timezone: Option<String>,
        created: Option<i64>,
    ) -> Self {
        let calendar = PubkyAppCalendar {
            name,
            color,
            x_pubky_admins,
            timezone,
            created,
        };
        calendar.sanitize()
    }
}

impl TimestampId for PubkyAppCalendar {}

impl HasIdPath for PubkyAppCalendar {
    const PATH_SEGMENT: &'static str = "calendar/";

    fn create_path(id: &str) -> String {
        [PUBLIC_PATH, APP_PATH, Self::PATH_SEGMENT, id].concat()
    }
}

impl Validatable for PubkyAppCalendar {
    fn sanitize(self) -> Self {
        // Sanitize name
        let name = self.name.map(|n| {
            let trimmed = n.trim().to_string();
            trimmed.chars().take(MAX_NAME_LENGTH).collect::<String>()
        });

        // Sanitize color
        let color = self.color.map(|c| c.trim().to_string());

        // Sanitize admin URIs
        let x_pubky_admins = self.x_pubky_admins.map(|admins| {
            admins
                .into_iter()
                .filter_map(|uri| Url::parse(&uri).ok().map(|url| url.to_string()))
                .collect()
        });

        // Sanitize timezone
        let timezone = self.timezone.map(|tz| tz.trim().to_string());

        PubkyAppCalendar {
            name,
            color,
            x_pubky_admins,
            timezone,
            created: self.created,
        }
    }

    fn validate(&self, id: Option<&str>) -> Result<(), String> {
        // Validate the calendar ID
        if let Some(id) = id {
            self.validate_id(id)?;
        }

        // Validate name is required and within length
        let name = self
            .name
            .as_ref()
            .ok_or("Validation Error: Calendar name is required")?;
        
        if name.is_empty() {
            return Err("Validation Error: Calendar name cannot be empty".into());
        }

        if name.chars().count() > MAX_NAME_LENGTH {
            return Err(format!(
                "Validation Error: Calendar name exceeds maximum length of {} characters",
                MAX_NAME_LENGTH
            ));
        }

        // Validate admin URIs if present
        if let Some(admins) = &self.x_pubky_admins {
            for uri in admins {
                Url::parse(uri)
                    .map_err(|_| format!("Validation Error: Invalid admin URI: {}", uri))?;
            }
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
        let calendar = PubkyAppCalendar::new(
            Some("Bitcoin Switzerland Events".to_string()),
            Some("#F7931A".to_string()),
            None,
            Some("Europe/Zurich".to_string()),
            Some(1698753600000000),
        );

        let calendar_id = calendar.create_id();
        println!("Generated Calendar ID: {}", calendar_id);

        // Assert that the calendar ID is 13 characters long
        assert_eq!(calendar_id.len(), 13);
    }

    #[test]
    fn test_new() {
        let name = "Bitcoin Switzerland Events".to_string();
        let color = "#F7931A".to_string();
        let calendar = PubkyAppCalendar::new(
            Some(name.clone()),
            Some(color.clone()),
            None,
            Some("Europe/Zurich".to_string()),
            Some(1698753600000000),
        );

        assert_eq!(calendar.name, Some(name));
        assert_eq!(calendar.color, Some(color));
        assert!(calendar.x_pubky_admins.is_none());
    }

    #[test]
    fn test_create_path() {
        let calendar = PubkyAppCalendar::new(
            Some("Test Calendar".to_string()),
            None,
            None,
            None,
            None,
        );

        let calendar_id = calendar.create_id();
        let path = PubkyAppCalendar::create_path(&calendar_id);

        // Check if the path starts with the expected prefix
        let prefix = format!("{}{}calendar/", PUBLIC_PATH, APP_PATH);
        assert!(path.starts_with(&prefix));

        let expected_path_len = prefix.len() + calendar_id.len();
        assert_eq!(path.len(), expected_path_len);
    }

    #[test]
    fn test_sanitize() {
        let name = "  Bitcoin Switzerland Events   ".to_string();
        let calendar = PubkyAppCalendar::new(
            Some(name.clone()),
            Some("  #F7931A  ".to_string()),
            Some(vec!["invalid uri".to_string()]),
            Some("  Europe/Zurich  ".to_string()),
            Some(1698753600000000),
        );

        let sanitized_calendar = calendar.sanitize();
        assert_eq!(
            sanitized_calendar.name,
            Some("Bitcoin Switzerland Events".to_string())
        );
        assert_eq!(sanitized_calendar.color, Some("#F7931A".to_string()));
        assert_eq!(sanitized_calendar.timezone, Some("Europe/Zurich".to_string()));
        // Invalid URIs should be filtered out
        assert!(sanitized_calendar.x_pubky_admins.unwrap().is_empty());
    }

    #[test]
    fn test_validate_valid() {
        let calendar = PubkyAppCalendar::new(
            Some("Bitcoin Switzerland Events".to_string()),
            Some("#F7931A".to_string()),
            None,
            Some("Europe/Zurich".to_string()),
            Some(1698753600000000),
        );

        let id = calendar.create_id();
        let result = calendar.validate(Some(&id));
        assert!(result.is_ok());
    }

    #[test]
    fn test_validate_missing_name() {
        let calendar = PubkyAppCalendar::new(None, None, None, None, None);

        let id = calendar.create_id();
        let result = calendar.validate(Some(&id));
        assert!(result.is_err());
        assert!(result
            .unwrap_err()
            .contains("Calendar name is required"));
    }

    #[test]
    fn test_validate_invalid_id() {
        let calendar = PubkyAppCalendar::new(
            Some("Valid Calendar".to_string()),
            None,
            None,
            None,
            None,
        );

        let invalid_id = "INVALIDID12345";
        let result = calendar.validate(Some(invalid_id));
        assert!(result.is_err());
    }

    #[test]
    fn test_try_from_valid() {
        let calendar_json = r#"
        {
            "name": "Bitcoin Switzerland Events",
            "color": "#F7931A",
            "x_pubky_admins": ["pubky://satoshi", "pubky://adam-back"],
            "timezone": "Europe/Zurich",
            "created": 1698753600000000
        }
        "#;

        let id = PubkyAppCalendar::new(
            Some("Bitcoin Switzerland Events".to_string()),
            Some("#F7931A".to_string()),
            Some(vec![
                "pubky://satoshi".to_string(),
                "pubky://adam-back".to_string(),
            ]),
            Some("Europe/Zurich".to_string()),
            Some(1698753600000000),
        )
        .create_id();

        let blob = calendar_json.as_bytes();
        let calendar = <PubkyAppCalendar as Validatable>::try_from(blob, &id).unwrap();

        assert_eq!(
            calendar.name,
            Some("Bitcoin Switzerland Events".to_string())
        );
        assert_eq!(calendar.color, Some("#F7931A".to_string()));
    }
}

