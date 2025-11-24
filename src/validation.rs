/// Validation utility functions for pubky-app-specs
/// 
/// This module contains shared validation functions used across different model types
/// to ensure data consistency and format compliance.

/// Validates hex color format (#RRGGBB)
/// 
/// # Examples
/// ```
/// use pubky_app_specs::is_valid_hex_color;
/// 
/// assert!(is_valid_hex_color("#3498db"));
/// assert!(is_valid_hex_color("#FFFFFF"));
/// assert!(!is_valid_hex_color("3498db")); // Missing #
/// ```
pub fn is_valid_hex_color(color: &str) -> bool {
    if !color.starts_with('#') || color.len() != 7 {
        return false;
    }
    
    color.chars().skip(1).all(|c| c.is_ascii_hexdigit())
}

/// Basic IANA timezone validation (checks for common patterns)
/// TODO: Could be extended with a full list of timezones if needed
/// 
/// # Examples
/// ```
/// use pubky_app_specs::is_valid_timezone;
/// 
/// assert!(is_valid_timezone("Europe/Zurich"));
/// assert!(is_valid_timezone("UTC"));
/// assert!(!is_valid_timezone("Invalid")); // No slash
/// ```
pub fn is_valid_timezone(tz: &str) -> bool {
    // Basic validation for IANA timezone format
    // Allow UTC and UTC-based offsets as special cases (e.g., "UTC", "UTC+5", "UTC-3")
    if tz == "UTC" || tz.starts_with("UTC+") || tz.starts_with("UTC-") {
        return true;
    }
    
    // Should contain at least one slash and valid characters
    if tz.is_empty() || !tz.contains('/') {
        return false;
    }
    
    // Check for valid characters (letters, numbers, slash, underscore, hyphen, plus)
    tz.chars().all(|c| c.is_alphanumeric() || matches!(c, '/' | '_' | '-' | '+'))
}

/// Validates geographic coordinates in "lat;lon" format
/// 
/// # Examples
/// ```
/// use pubky_app_specs::is_valid_geo;
/// 
/// assert!(is_valid_geo("47.3769;8.5417")); // Zurich coordinates
/// assert!(is_valid_geo("0;0")); // Null Island
/// assert!(!is_valid_geo("91;0")); // Latitude out of bounds
/// ```
pub fn is_valid_geo(geo: &str) -> bool {
    let parts: Vec<&str> = geo.split(';').collect();
    if parts.len() != 2 {
        return false;
    }
    
    // Validate latitude (-90 to 90)
    if let Ok(lat) = parts[0].parse::<f64>() {
        if lat < -90.0 || lat > 90.0 {
            return false;
        }
    } else {
        return false;
    }
    
    // Validate longitude (-180 to 180)
    if let Ok(lon) = parts[1].parse::<f64>() {
        if lon < -180.0 || lon > 180.0 {
            return false;
        }
    } else {
        return false;
    }
    
    true
}

/// Validates ISO 8601 duration format (simplified)
/// 
/// # Examples
/// ```
/// use pubky_app_specs::is_valid_duration;
/// 
/// assert!(is_valid_duration("PT1H30M")); // 1 hour 30 minutes
/// assert!(is_valid_duration("P1DT2H")); // 1 day 2 hours
/// assert!(!is_valid_duration("T1H30M")); // Missing P
/// ```
pub fn is_valid_duration(duration: &str) -> bool {
    // Basic pattern check for ISO 8601 duration
    // Must start with P, can contain T for time part
    if !duration.starts_with('P') {
        return false;
    }
    
    // Should contain valid duration characters
    if !duration.chars().all(|c| {
        c.is_ascii_digit() || matches!(c, 'P' | 'T' | 'Y' | 'M' | 'D' | 'H' | 'S')
    }) {
        return false;
    }
    
    // Ensure numbers are followed by valid units
    // This is a simplified check - a number should be followed by a unit letter
    let chars: Vec<char> = duration.chars().collect();
    let mut i = 1; // Start after 'P'
    while i < chars.len() {
        if chars[i].is_ascii_digit() {
            // Find the end of this number
            let mut j = i;
            while j < chars.len() && chars[j].is_ascii_digit() {
                j += 1;
            }
            // The next character should be a valid unit (not T, P, or another digit)
            if j >= chars.len() || !matches!(chars[j], 'Y' | 'M' | 'D' | 'H' | 'S') {
                return false;
            }
            i = j + 1;
        } else {
            i += 1;
        }
    }
    
    true
}

/// Validates RFC 5545 RRULE format (simplified)
/// 
/// # Examples
/// ```
/// use pubky_app_specs::is_valid_rrule;
/// 
/// assert!(is_valid_rrule("FREQ=DAILY"));
/// assert!(is_valid_rrule("FREQ=WEEKLY;BYDAY=MO,FR"));
/// assert!(!is_valid_rrule("DAILY")); // Missing FREQ=
/// ```
pub fn is_valid_rrule(rrule: &str) -> bool {
    // Basic RRULE validation - should start with FREQ= and have a value after it
    if !rrule.starts_with("FREQ=") || rrule.len() <= 5 {
        return false;
    }
    
    // Check for valid characters
    rrule.chars().all(|c| {
        c.is_alphanumeric() || matches!(c, '=' | ';' | ',' | '+' | '-')
    })
}

/// Returns the list of valid RSVP status values according to RFC 5545
/// 
/// # Examples
/// ```
/// use pubky_app_specs::valid_rsvp_statuses;
/// 
/// let statuses = valid_rsvp_statuses();
/// assert!(statuses.contains(&"ACCEPTED"));
/// ```
pub fn valid_rsvp_statuses() -> Vec<&'static str> {
    vec![
        "NEEDS-ACTION",
        "ACCEPTED",
        "DECLINED",
        "TENTATIVE",
    ]
}

/// Returns the list of valid event status values according to RFC 5545
/// 
/// # Examples
/// ```
/// use pubky_app_specs::valid_event_statuses;
/// 
/// let statuses = valid_event_statuses();
/// assert!(statuses.contains(&"CONFIRMED"));
/// ```
pub fn valid_event_statuses() -> Vec<&'static str> {
    vec![
        "CONFIRMED",
        "TENTATIVE",
        "CANCELLED",
    ]
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_is_valid_hex_color() {
        assert!(is_valid_hex_color("#3498db"));
        assert!(is_valid_hex_color("#FFFFFF"));
        assert!(is_valid_hex_color("#000000"));
        assert!(!is_valid_hex_color("3498db"));   // Missing #
        assert!(!is_valid_hex_color("#3498"));    // Too short
        assert!(!is_valid_hex_color("#3498dbx"));  // Too long
        assert!(!is_valid_hex_color("#3498gz"));   // Invalid hex chars
    }

    #[test]
    fn test_is_valid_timezone() {
        assert!(is_valid_timezone("Europe/Zurich"));
        assert!(is_valid_timezone("America/New_York"));
        assert!(is_valid_timezone("Asia/Tokyo"));
        assert!(is_valid_timezone("UTC"));
        assert!(is_valid_timezone("UTC+5"));
        assert!(!is_valid_timezone(""));           // Empty
        assert!(!is_valid_timezone("Invalid"));    // No slash
        assert!(!is_valid_timezone("Europe@Zurich")); // Invalid char
    }

    #[test] 
    fn test_is_valid_geo() {
        assert!(is_valid_geo("47.3769;8.5417")); // Zurich
        assert!(is_valid_geo("0;0"));             // Null Island
        assert!(is_valid_geo("-90;-180"));        // Min bounds
        assert!(is_valid_geo("90;180"));          // Max bounds
        assert!(!is_valid_geo("91;0"));           // Lat out of bounds
        assert!(!is_valid_geo("0;181"));          // Lon out of bounds
        assert!(!is_valid_geo("abc;def"));        // Non-numeric
        assert!(!is_valid_geo("47.3769"));        // Missing longitude
        assert!(!is_valid_geo("47.3769;8.5417;extra")); // Too many parts
    }

    #[test]
    fn test_is_valid_duration() {
        assert!(is_valid_duration("PT1H30M"));    // 1.5 hours
        assert!(is_valid_duration("P1DT2H"));     // 1 day 2 hours  
        assert!(is_valid_duration("PT45M"));      // 45 minutes
        assert!(is_valid_duration("P7D"));        // 7 days
        assert!(is_valid_duration("PT30S"));      // 30 seconds
        assert!(!is_valid_duration("T1H30M"));    // Missing P
        assert!(!is_valid_duration("PT1H30"));    // Missing unit
        assert!(!is_valid_duration("PT1X30M"));   // Invalid char
        assert!(!is_valid_duration(""));          // Empty
    }

    #[test]
    fn test_is_valid_rrule() {
        assert!(is_valid_rrule("FREQ=DAILY"));
        assert!(is_valid_rrule("FREQ=WEEKLY;BYDAY=MO,FR"));
        assert!(is_valid_rrule("FREQ=MONTHLY;BYMONTHDAY=1,15"));
        assert!(!is_valid_rrule("DAILY"));        // Missing FREQ=
        assert!(!is_valid_rrule(""));             // Empty
        assert!(!is_valid_rrule("FREQ="));        // No value
    }

    #[test]
    fn test_valid_rsvp_statuses() {
        let statuses = valid_rsvp_statuses();
        assert_eq!(statuses.len(), 4);
        assert!(statuses.contains(&"NEEDS-ACTION"));
        assert!(statuses.contains(&"ACCEPTED"));
        assert!(statuses.contains(&"DECLINED"));
        assert!(statuses.contains(&"TENTATIVE"));
    }

    #[test]
    fn test_valid_event_statuses() {
        let statuses = valid_event_statuses();
        assert_eq!(statuses.len(), 3);
        assert!(statuses.contains(&"CONFIRMED"));
        assert!(statuses.contains(&"TENTATIVE"));
        assert!(statuses.contains(&"CANCELLED"));
    }
}
