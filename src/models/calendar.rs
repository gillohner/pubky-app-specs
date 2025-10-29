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

/// Represents a calendar collection in the Pubky ecosystem
///
/// Calendars serve as containers for related events. They support features like:
/// - Custom colors and images for visual organization
/// - Multiple administrators for collaborative management
/// - Timezone configuration for proper event display
///
/// URI: `/pub/pubky.app/calendar/:calendar_id`
///
/// Where `:calendar_id` is a Crockford Base32 timestamp-based ID (13 characters)
///
/// # Example URI
///
/// ```text
/// pubky://user_id/pub/pubky.app/calendar/0033RCZXVEPNG
/// ```
///
/// # Example JSON
///
/// ```json
/// {
///   "name": "Bitcoin Switzerland Events",
///   "color": "#F7931A",
///   "timezone": "Europe/Zurich",
///   "description": "Bitcoin events and meetups in Switzerland",
///   "url": "https://bitcoin.ch/events",
///   "image_uri": "pubky://user_id/pub/pubky.app/files/calendar-img",
///   "x_pubky_admins": [
///     "pubky://admin1_id",
///     "pubky://admin2_id"
///   ],
///   "created": 1698753600000000
/// }
/// ```
#[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
#[derive(Serialize, Deserialize, Default, Clone, Debug)]
#[cfg_attr(feature = "openapi", derive(ToSchema))]
pub struct PubkyAppCalendar {
    /// Calendar display name (REQUIRED)
    /// Maps to RFC 7986 X-WR-CALNAME property
    /// Maximum length: 255 characters
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub name: String,
    
    /// IANA timezone identifier (REQUIRED)
    /// Maps to RFC 5545 VTIMEZONE / X-WR-TIMEZONE property
    /// Examples: "Europe/Zurich", "America/New_York", "UTC"
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub timezone: String,
    
    /// CSS color value for visual organization
    /// Maps to RFC 7986 COLOR / X-APPLE-CALENDAR-COLOR property
    /// Format: Hex color (e.g., "#F7931A")
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub color: Option<String>,
    
    /// Calendar description/notes
    /// Maps to RFC 7986 X-WR-CALDESC property
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub description: Option<String>,
    
    /// Calendar homepage URL
    /// Maps to RFC 7986 URL property
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub url: Option<String>,
    
    /// Calendar image/banner URI
    /// Maps to RFC 7986 IMAGE property
    /// Must be a Pubky URI (pubky://...)
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub image_uri: Option<String>,
    
    /// Pubky URIs of additional calendar administrators
    /// Custom Pubky extension (X-PUBKY-ADMINS property)
    /// Creator is implicit from calendar URI path - not included here
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub x_pubky_admins: Option<Vec<String>>,
    
    /// Creation timestamp in Unix microseconds
    /// Maps to RFC 5545 CREATED property
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub created: Option<i64>,
}

#[cfg(target_arch = "wasm32")]
#[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
impl PubkyAppCalendar {
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn name(&self) -> String {
        self.name.clone()
    }
    
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn timezone(&self) -> String {
        self.timezone.clone()
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn color(&self) -> Option<String> {
        self.color.clone()
    }
    
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn description(&self) -> Option<String> {
        self.description.clone()
    }
    
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn url(&self) -> Option<String> {
        self.url.clone()
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn x_pubky_admins(&self) -> Option<Vec<String>> {
        self.x_pubky_admins.clone()
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn image_uri(&self) -> Option<String> {
        self.image_uri.clone()
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
        name: String,
        timezone: String,
        color: Option<String>,
        description: Option<String>,
        url: Option<String>,
        image_uri: Option<String>,
        x_pubky_admins: Option<Vec<String>>,
        created: Option<i64>,
    ) -> Self {
        let calendar = PubkyAppCalendar {
            name,
            timezone,
            color,
            description,
            url,
            image_uri,
            x_pubky_admins,
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
        // Sanitize name (REQUIRED - trim and limit length)
        let name = self.name.trim().to_string();
        let name = name.chars().take(MAX_NAME_LENGTH).collect::<String>();

        // Sanitize timezone (REQUIRED - trim)
        let timezone = self.timezone.trim().to_string();

        // Sanitize color
        let color = self.color.map(|c| c.trim().to_string());
        
        // Sanitize description
        let description = self.description.map(|d| d.trim().to_string());
        
        // Sanitize URL
        let url = self.url.map(|u| u.trim().to_string());

        // Sanitize admin URIs
        let x_pubky_admins = self.x_pubky_admins.map(|admins| {
            admins
                .into_iter()
                .filter_map(|uri| Url::parse(&uri).ok().map(|url| url.to_string()))
                .collect()
        });

        // Sanitize image URI
        let image_uri = self.image_uri.map(|uri| uri.trim().to_string());

        PubkyAppCalendar {
            name,
            timezone,
            color,
            description,
            url,
            image_uri,
            x_pubky_admins,
            created: self.created,
        }
    }

    fn validate(&self, id: Option<&str>) -> Result<(), String> {
        // Validate the calendar ID
        if let Some(id) = id {
            self.validate_id(id)?;
        }

        // Validate name is required and within length
        if self.name.is_empty() {
            return Err("Validation Error: Calendar name is required and cannot be empty".into());
        }

        if self.name.chars().count() > MAX_NAME_LENGTH {
            return Err(format!(
                "Validation Error: Calendar name exceeds maximum length of {} characters",
                MAX_NAME_LENGTH
            ));
        }
        
        // Validate timezone is required and not empty
        if self.timezone.is_empty() {
            return Err("Validation Error: Calendar timezone is required and cannot be empty".into());
        }

        // Validate admin URIs if present
        if let Some(admins) = &self.x_pubky_admins {
            for uri in admins {
                Url::parse(uri)
                    .map_err(|_| format!("Validation Error: Invalid admin URI: {}", uri))?;
                if !uri.starts_with("pubky://") {
                    return Err(format!("Validation Error: Admin URI must be a Pubky URI: {}", uri));
                }
            }
        }

        // Validate image URI if present
        if let Some(uri) = &self.image_uri {
            if uri.is_empty() {
                return Err("Validation Error: Image URI cannot be empty".into());
            }
            if !uri.starts_with("pubky://") {
                return Err("Validation Error: Image URI must be a Pubky URI".into());
            }
        }
        
        // Validate URL if present
        if let Some(url) = &self.url {
            if url.is_empty() {
                return Err("Validation Error: URL cannot be empty".into());
            }
            Url::parse(url)
                .map_err(|_| format!("Validation Error: Invalid URL: {}", url))?;
        }

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_create_id() {
        let calendar = PubkyAppCalendar::new(
            "Bitcoin Switzerland Events".to_string(),
            "Europe/Zurich".to_string(),
            Some("#F7931A".to_string()),
            Some("Bitcoin events and meetups in Switzerland".to_string()),
            Some("https://bitcoin.ch/events".to_string()),
            Some("pubky://user_id/pub/pubky.app/files/calendar-img".to_string()),
            Some(vec![
                "pubky://admin1".to_string(),
                "pubky://admin2".to_string(),
            ]),
            Some(1698753600000000),
        );

        let calendar_id = calendar.create_id();
        println!("Generated Calendar ID: {}", calendar_id);

        // Assert that the calendar ID is 13 characters long
        assert_eq!(calendar_id.len(), 13);
    }
    
    #[test]
    fn test_validate_valid() {
        let calendar = PubkyAppCalendar::new(
            "Test Calendar".to_string(),
            "Europe/Zurich".to_string(),
            Some("#FF0000".to_string()),
            None,
            None,
            None,
            None,
            Some(1698753600000000),
        );

        let calendar_id = calendar.create_id();
        let result = calendar.validate(Some(&calendar_id));
        assert!(result.is_ok());
    }
    
    #[test]
    fn test_validate_missing_name() {
        let calendar = PubkyAppCalendar {
            name: "".to_string(),
            timezone: "Europe/Zurich".to_string(),
            color: None,
            description: None,
            url: None,
            image_uri: None,
            x_pubky_admins: None,
            created: None,
        };

        let calendar_id = calendar.create_id();
        let result = calendar.validate(Some(&calendar_id));
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("name is required"));
    }
    
    #[test]
    fn test_validate_missing_timezone() {
        let calendar = PubkyAppCalendar {
            name: "Test".to_string(),
            timezone: "".to_string(),
            color: None,
            description: None,
            url: None,
            image_uri: None,
            x_pubky_admins: None,
            created: None,
        };

        let calendar_id = calendar.create_id();
        let result = calendar.validate(Some(&calendar_id));
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("timezone is required"));
    }
}

