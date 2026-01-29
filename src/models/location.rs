use crate::traits::Validatable;
use serde::{Deserialize, Serialize};

#[cfg(target_arch = "wasm32")]
use crate::traits::Json;
#[cfg(target_arch = "wasm32")]
use wasm_bindgen::prelude::*;

#[cfg(feature = "openapi")]
use utoipa::ToSchema;

// Validation constants
const MAX_NAME_LENGTH: usize = 500;
const MAX_DESCRIPTION_LENGTH: usize = 2000;
const MAX_STRUCTURED_DATA_LENGTH: usize = 2048;

/// Maximum number of locations per event
pub const MAX_LOCATIONS: usize = 5;

/// RFC 9073 LOCATION-TYPE
#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, Default)]
#[cfg_attr(feature = "openapi", derive(ToSchema))]
#[serde(rename_all = "UPPERCASE")]
pub enum LocationType {
    #[default]
    Physical,
    Online,
}

/// Structured location (RFC 9073 VLOCATION)
///
/// Events can have multiple locations. First is primary.
/// Physical locations can be simple (name only) or full (with OSM link).
///
/// # Examples
///
/// Simple physical location:
/// ```
/// use pubky_app_specs::Location;
///
/// let loc = Location::physical("My backyard");
/// assert_eq!(loc.name, "My backyard");
/// assert!(loc.structured_data.is_none());
/// ```
///
/// Online meeting:
/// ```
/// use pubky_app_specs::Location;
///
/// let loc = Location::online("Weekly Standup", "https://zoom.us/j/123456789");
/// assert_eq!(loc.name, "Weekly Standup");
/// assert_eq!(loc.structured_data.as_deref(), Some("https://zoom.us/j/123456789"));
/// ```
#[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, Default)]
#[cfg_attr(feature = "openapi", derive(ToSchema))]
pub struct Location {
    /// Human-readable location name (required)
    /// Examples: "Hafenbar zur Metzgerhalle", "My backyard", "Zoom Call"
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub name: String,

    /// Additional details or instructions
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub description: Option<String>,

    /// PHYSICAL or ONLINE
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub location_type: LocationType,

    /// URI reference (RFC 9073 STRUCTURED-DATA)
    /// Physical: OSM URL (https://openstreetmap.org/node/123) for BTCMap lookup
    /// Online: Meeting URL (https://zoom.us/j/123)
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(skip))]
    pub structured_data: Option<String>,
}

impl Location {
    /// Simple physical location (just a name, no coordinates)
    pub fn physical(name: impl Into<String>) -> Self {
        Self {
            name: name.into(),
            location_type: LocationType::Physical,
            ..Default::default()
        }
    }

    /// Online location with meeting URL
    pub fn online(name: impl Into<String>, url: impl Into<String>) -> Self {
        Self {
            name: name.into(),
            location_type: LocationType::Online,
            structured_data: Some(url.into()),
            ..Default::default()
        }
    }

    /// Physical location with OSM reference (from Nominatim search)
    pub fn physical_with_osm(name: impl Into<String>, osm_url: impl Into<String>) -> Self {
        Self {
            name: name.into(),
            location_type: LocationType::Physical,
            structured_data: Some(osm_url.into()),
            ..Default::default()
        }
    }

    /// Check if this has an OSM reference (for BTCMap)
    pub fn has_osm_link(&self) -> bool {
        self.structured_data
            .as_ref()
            .map(|u| u.contains("openstreetmap.org"))
            .unwrap_or(false)
    }

    /// Extract OSM type and ID from structured_data
    /// Returns (osm_type, osm_id) e.g., ("node", "1573053883")
    pub fn osm_id(&self) -> Option<(&str, &str)> {
        let uri = self.structured_data.as_ref()?;
        for prefix in ["node/", "way/", "relation/"] {
            if let Some(pos) = uri.find(prefix) {
                let osm_type = prefix.trim_end_matches('/');
                let start = pos + prefix.len();
                let id = uri[start..].split(&['?', '#', '/'][..]).next()?;
                return Some((osm_type, id));
            }
        }
        None
    }
}

#[cfg(target_arch = "wasm32")]
#[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
impl Location {
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn name(&self) -> String {
        self.name.clone()
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn description(&self) -> Option<String> {
        self.description.clone()
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn location_type(&self) -> String {
        match self.location_type {
            LocationType::Physical => "PHYSICAL".to_string(),
            LocationType::Online => "ONLINE".to_string(),
        }
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(getter))]
    pub fn structured_data(&self) -> Option<String> {
        self.structured_data.clone()
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
impl Json for Location {}

impl Validatable for Location {
    fn sanitize(self) -> Self {
        Self {
            name: self.name.trim().chars().take(MAX_NAME_LENGTH).collect(),
            description: self
                .description
                .map(|s| s.trim().chars().take(MAX_DESCRIPTION_LENGTH).collect()),
            location_type: self.location_type,
            structured_data: self
                .structured_data
                .map(|s| s.trim().chars().take(MAX_STRUCTURED_DATA_LENGTH).collect()),
        }
    }

    fn validate(&self, _id: Option<&str>) -> Result<(), String> {
        if self.name.is_empty() {
            return Err("Validation Error: Location name is required".into());
        }

        if self.name.chars().count() > MAX_NAME_LENGTH {
            return Err(format!(
                "Validation Error: Location name exceeds {} characters",
                MAX_NAME_LENGTH
            ));
        }

        // Online locations require structured_data (meeting URL)
        if self.location_type == LocationType::Online && self.structured_data.is_none() {
            return Err("Validation Error: Online locations require a meeting URL".into());
        }

        if let Some(ref uri) = self.structured_data {
            if !uri.starts_with("https://") && !uri.starts_with("http://") {
                return Err("Validation Error: structured_data must be a valid URL".into());
            }
        }

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_simple_physical_location() {
        let loc = Location::physical("My backyard");
        assert_eq!(loc.name, "My backyard");
        assert_eq!(loc.location_type, LocationType::Physical);
        assert!(loc.structured_data.is_none());
        assert!(loc.validate(None).is_ok());
    }

    #[test]
    fn test_physical_with_osm() {
        let loc =
            Location::physical_with_osm("Hafenbar", "https://www.openstreetmap.org/node/1573053883");
        assert_eq!(loc.name, "Hafenbar");
        assert!(loc.has_osm_link());
        assert_eq!(loc.osm_id(), Some(("node", "1573053883")));
        assert!(loc.validate(None).is_ok());
    }

    #[test]
    fn test_online_location() {
        let loc = Location::online("Weekly Standup", "https://zoom.us/j/123456789");
        assert_eq!(loc.name, "Weekly Standup");
        assert_eq!(loc.location_type, LocationType::Online);
        assert_eq!(
            loc.structured_data.as_deref(),
            Some("https://zoom.us/j/123456789")
        );
        assert!(loc.validate(None).is_ok());
    }

    #[test]
    fn test_online_requires_url() {
        let loc = Location {
            name: "Meeting".into(),
            location_type: LocationType::Online,
            structured_data: None,
            description: None,
        };
        assert!(loc.validate(None).is_err());
    }

    #[test]
    fn test_empty_name_fails() {
        let loc = Location::physical("");
        assert!(loc.validate(None).is_err());
    }

    #[test]
    fn test_osm_id_extraction() {
        let cases = [
            ("https://www.openstreetmap.org/node/1573053883", Some(("node", "1573053883"))),
            ("https://openstreetmap.org/way/12345", Some(("way", "12345"))),
            ("https://openstreetmap.org/relation/999?mlat=47", Some(("relation", "999"))),
            ("https://zoom.us/j/123", None),
        ];

        for (url, expected) in cases {
            let loc = Location {
                name: "Test".into(),
                structured_data: Some(url.into()),
                ..Default::default()
            };
            assert_eq!(loc.osm_id(), expected, "Failed for URL: {}", url);
        }
    }

    #[test]
    fn test_sanitize() {
        let loc = Location {
            name: "  Trimmed Name  ".into(),
            description: Some("  Trimmed Description  ".into()),
            location_type: LocationType::Physical,
            structured_data: Some("  https://example.com  ".into()),
        };
        let sanitized = loc.sanitize();
        assert_eq!(sanitized.name, "Trimmed Name");
        assert_eq!(sanitized.description.as_deref(), Some("Trimmed Description"));
        assert_eq!(sanitized.structured_data.as_deref(), Some("https://example.com"));
    }

    #[test]
    fn test_serialization() {
        let loc = Location::online("Zoom Call", "https://zoom.us/j/123");
        let json = serde_json::to_string(&loc).unwrap();
        assert!(json.contains("\"location_type\":\"ONLINE\""));
        
        let parsed: Location = serde_json::from_str(&json).unwrap();
        assert_eq!(parsed, loc);
    }
}
