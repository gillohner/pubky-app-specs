use crate::{
    common::timestamp,
    traits::{HasIdPath, HashId, Validatable},
    validation::{is_valid_hex_color, is_valid_timezone},
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
const MIN_NAME_LENGTH: usize = 1;
const MAX_NAME_LENGTH: usize = 100;
const MAX_DESCRIPTION_LENGTH: usize = 10_000;
const MAX_ADMINS: usize = 20;

/// Represents styled description with metadata for rich content
#[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
#[cfg_attr(feature = "openapi", derive(ToSchema))]
pub struct StyledDescription {
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub content: String,     // Raw content
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub format: String,      // Format type: "markdown", "html", "plain"
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub attachments: Option<Vec<String>>, // URI references to attached files
}

#[cfg(target_arch = "wasm32")]
#[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
impl StyledDescription {
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(constructor))]
    pub fn new(content: String, format: String, attachments: Option<Vec<String>>) -> Self {
        StyledDescription {
            content,
            format,
            attachments,
        }
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn content(&self) -> String {
        self.content.clone()
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn format(&self) -> String {
        self.format.clone()
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn attachments(&self) -> Option<Vec<String>> {
        self.attachments.clone()
    }
}

/// Calendar container - collection of events
/// URI: /pub/pubky.app/calendars/:calendar_id
/// Where calendar_id is a hash-based ID similar to feeds
#[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
#[derive(Serialize, Deserialize, Debug, Clone)]
#[cfg_attr(feature = "openapi", derive(ToSchema))]
pub struct PubkyAppCalendar {
    // RFC 7986 - Calendar Properties
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub name: String,                      // REQUIRED - calendar display name
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub color: Option<String>,             // CSS color value (hex format #RRGGBB)
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub image_uri: Option<String>,         // Calendar image/logo URI (pubky:// or https)

    // RFC 5545 - Calendar Metadata
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub timezone: String,                  // REQUIRED - IANA timezone ID (e.g., "Europe/Zurich")
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub description: Option<String>,       // Calendar description
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub url: Option<String>,               // Calendar homepage/details URL
    pub created: Option<i64>,              // Creation timestamp (Unix microseconds)

    // Pubky Extensions (all custom fields use x_pubky_ prefix)
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub x_pubky_admins: Option<Vec<String>>,  // Pubky URIs of admin users
}

impl PubkyAppCalendar {
    /// Creates a new `PubkyAppCalendar` instance with required fields and sensible defaults.
    pub fn new(name: String, timezone: String) -> Self {
        let created = Some(timestamp());
        Self {
            name,
            timezone,
            // Sensible defaults for optional fields
            color: None,
            image_uri: None,
            description: None,
            url: None,
            created,
            x_pubky_admins: None,
        }
        .sanitize()
    }

    /// Helper methods for setting optional fields
    pub fn with_color(mut self, color: String) -> Self {
        self.color = Some(color);
        self.sanitize()
    }

    pub fn with_description(mut self, description: String) -> Self {
        self.description = Some(description);
        self.sanitize()
    }

    pub fn with_image_uri(mut self, image_uri: String) -> Self {
        self.image_uri = Some(image_uri);
        self.sanitize()
    }

    pub fn with_url(mut self, url: String) -> Self {
        self.url = Some(url);
        self.sanitize()
    }

    pub fn with_admins(mut self, admins: Vec<String>) -> Self {
        self.x_pubky_admins = Some(admins);
        self.sanitize()
    }
}

#[cfg(target_arch = "wasm32")]
#[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
impl PubkyAppCalendar {
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn name(&self) -> String {
        self.name.clone()
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn color(&self) -> Option<String> {
        self.color.clone()
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn image_uri(&self) -> Option<String> {
        self.image_uri.clone()
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn timezone(&self) -> String {
        self.timezone.clone()
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn description(&self) -> Option<String> {
        self.description.clone()
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn url(&self) -> Option<String> {
        self.url.clone()
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter, js_name = "getCreated"))]
    pub fn created(&self) -> Option<i64> {
        self.created
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn x_pubky_admins(&self) -> Option<Vec<String>> {
        self.x_pubky_admins.clone()
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

impl HashId for PubkyAppCalendar {
    /// Generates an ID based on the serialized calendar data (excluding timestamp).
    fn get_id_data(&self) -> String {
        // Create a version without timestamp for consistent hashing
        let data = serde_json::json!({
            "name": self.name,
            "timezone": self.timezone,
            "color": self.color,
            "image_uri": self.image_uri,
            "description": self.description,
            "url": self.url,
            "x_pubky_admins": self.x_pubky_admins
        });
        serde_json::to_string(&data).unwrap_or_default()
    }
}

impl HasIdPath for PubkyAppCalendar {
    const PATH_SEGMENT: &'static str = "calendars/";

    fn create_path(id: &str) -> String {
        [PUBLIC_PATH, APP_PATH, Self::PATH_SEGMENT, id].concat()
    }
}

impl Validatable for PubkyAppCalendar {
    fn sanitize(self) -> Self {
        // Sanitize name
        let name = self.name.trim().chars().take(MAX_NAME_LENGTH).collect();
        
        // Sanitize timezone
        let timezone = self.timezone.trim().to_string();
        
        // Sanitize description
        let description = self.description.map(|desc| {
            desc.trim().chars().take(MAX_DESCRIPTION_LENGTH).collect()
        });
        
        // Sanitize color (keep only valid hex colors)
        let color = self.color.and_then(|c| {
            let c = c.trim().to_lowercase();
            if is_valid_hex_color(&c) {
                Some(c)
            } else {
                None
            }
        });
        
        // Sanitize image_uri and url
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
        
        // Sanitize admin URIs
        let x_pubky_admins = self.x_pubky_admins.map(|admins| {
            admins.into_iter()
                .take(MAX_ADMINS)
                .filter_map(|admin_uri| {
                    match Url::parse(&admin_uri.trim()) {
                        Ok(url) => Some(url.to_string()),
                        Err(_) => None,
                    }
                })
                .collect::<Vec<_>>()
        }).filter(|admins| !admins.is_empty());
        
        Self {
            name,
            color,
            image_uri,
            timezone,
            description,
            url,
            created: self.created,
            x_pubky_admins,
        }
    }

    fn validate(&self, id: Option<&str>) -> Result<(), String> {
        // Validate the calendar ID
        if let Some(id) = id {
            self.validate_id(id)?;
        }

        // Validate name
        let name_length = self.name.chars().count();
        if !(MIN_NAME_LENGTH..=MAX_NAME_LENGTH).contains(&name_length) {
            return Err("Validation Error: Calendar name length must be between 1 and 100 characters".into());
        }

        // Validate timezone
        if self.timezone.trim().is_empty() {
            return Err("Validation Error: Timezone is required".into());
        }
        
        if !is_valid_timezone(&self.timezone) {
            return Err("Validation Error: Invalid timezone format. Must be a valid IANA timezone ID".into());
        }

        // Validate description length
        if let Some(desc) = &self.description {
            if desc.chars().count() > MAX_DESCRIPTION_LENGTH {
                return Err("Validation Error: Description exceeds maximum length".into());
            }
        }

        // Validate color format
        if let Some(color) = &self.color {
            if !is_valid_hex_color(color) {
                return Err("Validation Error: Color must be a valid hex color (#RRGGBB)".into());
            }
        }

        // Validate admin count
        if let Some(admins) = &self.x_pubky_admins {
            if admins.len() > MAX_ADMINS {
                return Err("Validation Error: Too many admin users".into());
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

    #[test]
    fn test_new() {
        let calendar = PubkyAppCalendar::new(
            "Work Calendar".to_string(),
            "Europe/Zurich".to_string(),
        )
        .with_color("#3498db".to_string())
        .with_description("My work events".to_string());

        assert_eq!(calendar.name, "Work Calendar");
        assert_eq!(calendar.timezone, "Europe/Zurich");
        assert_eq!(calendar.color, Some("#3498db".to_string()));
        assert_eq!(calendar.description, Some("My work events".to_string()));
        assert!(calendar.created.is_some());
        
        // Check that created timestamp is recent
        let now = timestamp();
        assert!(calendar.created.unwrap() <= now && calendar.created.unwrap() >= now - 1_000_000);
    }

    #[test]
    fn test_create_id() {
        let calendar = PubkyAppCalendar::new(
            "Work Calendar".to_string(),
            "Europe/Zurich".to_string(),
        )
        .with_color("#3498db".to_string())
        .with_description("My work events".to_string());

        let calendar_id = calendar.create_id();
        println!("Generated Calendar ID: {}", calendar_id);

        // The ID should not be empty
        assert!(!calendar_id.is_empty());
    }

    #[test]
    fn test_create_path() {
        let calendar = PubkyAppCalendar::new(
            "Work Calendar".to_string(),
            "Europe/Zurich".to_string(),
        );

        let calendar_id = calendar.create_id();
        let path = PubkyAppCalendar::create_path(&calendar_id);

        // Check if the path starts with the expected prefix
        let prefix = format!("{}{}calendars/", PUBLIC_PATH, APP_PATH);
        assert!(path.starts_with(&prefix));

        let expected_path_len = prefix.len() + calendar_id.len();
        assert_eq!(path.len(), expected_path_len);
    }

    #[test]
    fn test_validate_valid() {
        let calendar = PubkyAppCalendar::new(
            "Work Calendar".to_string(),
            "Europe/Zurich".to_string(),
        )
        .with_color("#3498db".to_string())
        .with_description("My work events".to_string());

        let id = calendar.create_id();
        let result = calendar.validate(Some(&id));
        assert!(result.is_ok());
    }

    #[test]
    fn test_validate_invalid_name() {
        let calendar = PubkyAppCalendar::new(
            "".to_string(), // Empty name
            "Europe/Zurich".to_string(),
        );

        let id = calendar.create_id();
        let result = calendar.validate(Some(&id));
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("Calendar name length"));
    }

    #[test]
    fn test_validate_invalid_timezone() {
        let calendar = PubkyAppCalendar::new(
            "Work Calendar".to_string(),
            "invalid_timezone".to_string(), // Invalid timezone
        );

        let id = calendar.create_id();
        let result = calendar.validate(Some(&id));
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("Invalid timezone format"));
    }

    #[test]
    fn test_validate_invalid_color() {
        let mut calendar = PubkyAppCalendar::new(
            "Work Calendar".to_string(),
            "Europe/Zurich".to_string(),
        );
        
        // Manually set invalid color after creation to bypass sanitization
        calendar.color = Some("invalid_color".to_string());

        let id = calendar.create_id();
        let result = calendar.validate(Some(&id));
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("valid hex color"));
    }

    #[test]
    fn test_sanitize() {
        let calendar = PubkyAppCalendar::new(
            "  Work Calendar  ".to_string(),
            " Europe/Zurich ".to_string(),
        )
        .with_color("  #3498DB  ".to_string())
        .with_image_uri("invalid_url".to_string())
        .with_description("  Description  ".to_string())
        .with_admins(vec!["invalid_uri".to_string()]);

        assert_eq!(calendar.name, "Work Calendar");
        assert_eq!(calendar.timezone, "Europe/Zurich");
        assert_eq!(calendar.color, Some("#3498db".to_string()));
        assert!(calendar.image_uri.is_none()); // Invalid URL sanitized out
        assert_eq!(calendar.description, Some("Description".to_string()));
        assert!(calendar.x_pubky_admins.is_none()); // Invalid URIs filtered out
    }

    #[test]
    fn test_try_from_valid() {
        let calendar_json = r##"
        {
            "name": "Work Calendar",
            "color": "#3498db",
            "image_uri": null,
            "timezone": "Europe/Zurich",
            "description": "My work events",
            "url": null,
            "created": 1700000000,
            "x_pubky_admins": null
        }
        "##;

        let calendar = PubkyAppCalendar::new(
            "Work Calendar".to_string(),
            "Europe/Zurich".to_string(),
        )
        .with_color("#3498db".to_string())
        .with_description("My work events".to_string());
        let id = calendar.create_id();

        let blob = calendar_json.as_bytes();
        let calendar_parsed = <PubkyAppCalendar as Validatable>::try_from(blob, &id).unwrap();

        assert_eq!(calendar_parsed.name, "Work Calendar");
        assert_eq!(calendar_parsed.timezone, "Europe/Zurich");
        assert_eq!(calendar_parsed.color, Some("#3498db".to_string()));
        assert_eq!(calendar_parsed.description, Some("My work events".to_string()));
    }
}