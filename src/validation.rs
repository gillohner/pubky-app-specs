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

/// Validates RFC 5870 geo URI format
/// 
/// Format: "geo:lat,lon" or "geo:lat,lon;u=uncertainty"
/// 
/// # Examples
/// ```
/// use pubky_app_specs::is_valid_geo_uri;
/// 
/// assert!(is_valid_geo_uri("geo:47.3769,8.5417")); // Basic format
/// assert!(is_valid_geo_uri("geo:47.3769,8.5417;u=10")); // With uncertainty
/// assert!(!is_valid_geo_uri("47.3769,8.5417")); // Missing geo: prefix
/// ```
pub fn is_valid_geo_uri(geo_uri: &str) -> bool {
    // Must start with "geo:"
    if !geo_uri.starts_with("geo:") {
        return false;
    }
    
    let content = &geo_uri[4..]; // Skip "geo:"
    
    // Split by semicolon to handle optional parameters like uncertainty
    let main_part = content.split(';').next().unwrap_or("");
    
    // Split by comma for lat,lon
    let parts: Vec<&str> = main_part.split(',').collect();
    if parts.len() < 2 {
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

/// RFC 4589 location types registry
/// 
/// Common location types from the IANA Location Types Registry
pub const LOCATION_TYPES: &[&str] = &[
    // Building/facility types
    "venue",
    "parking",
    "restaurant",
    "bar",
    "hotel",
    "motel",
    "resort",
    "convention-center",
    "stadium",
    "arena",
    "theater",
    "cinema",
    "museum",
    "library",
    "school",
    "university",
    "hospital",
    "church",
    "mosque",
    "synagogue",
    "temple",
    // Transportation
    "airport",
    "train-station",
    "bus-station",
    "subway-station",
    "port",
    "ferry-terminal",
    // Outdoor/recreation
    "park",
    "beach",
    "campground",
    "golf-course",
    "ski-resort",
    "marina",
    // Commercial
    "office",
    "shop",
    "mall",
    "market",
    "bank",
    // Residential
    "residence",
    "apartment",
    "house",
    // Other
    "warehouse",
    "industrial",
    "government",
    "embassy",
    "military",
    "prison",
    "cemetery",
    "other",
];

/// Validates RFC 4589 location type
/// 
/// # Examples
/// ```
/// use pubky_app_specs::is_valid_location_type;
/// 
/// assert!(is_valid_location_type("venue"));
/// assert!(is_valid_location_type("parking"));
/// assert!(!is_valid_location_type("invalid_type"));
/// ```
pub fn is_valid_location_type(location_type: &str) -> bool {
    LOCATION_TYPES.contains(&location_type.to_lowercase().as_str())
}

/// RFC 7986 CONFERENCE FEATURE values
pub const CONFERENCE_FEATURES: &[&str] = &[
    "AUDIO",     // Audio conferencing
    "VIDEO",     // Video conferencing  
    "CHAT",      // Text chat/messaging
    "PHONE",     // Phone dial-in
    "SCREEN",    // Screen sharing
    "MODERATOR", // Moderator controls available
    "FEED",      // Broadcast/streaming feed
];

/// Validates RFC 7986 CONFERENCE FEATURE values
/// 
/// # Examples
/// ```
/// use pubky_app_specs::is_valid_conference_features;
/// 
/// assert!(is_valid_conference_features(&["AUDIO".to_string(), "VIDEO".to_string()]));
/// assert!(!is_valid_conference_features(&["INVALID".to_string()]));
/// ```
pub fn is_valid_conference_features(features: &[String]) -> bool {
    if features.is_empty() {
        return true; // Empty is valid (no features specified)
    }
    
    features.iter().all(|f| CONFERENCE_FEATURES.contains(&f.to_uppercase().as_str()))
}

/// Validates a URI using the url crate
/// 
/// Accepts any valid URI scheme (https, http, tel, sip, etc.)
/// per RFC 7986 permissive approach for CONFERENCE URIs.
/// 
/// # Examples
/// ```
/// use pubky_app_specs::is_valid_uri;
/// 
/// assert!(is_valid_uri("https://zoom.us/j/123456789"));
/// assert!(is_valid_uri("tel:+1-555-123-4567"));
/// assert!(is_valid_uri("sip:meeting@example.com"));
/// assert!(!is_valid_uri("not a valid uri"));
/// ```
pub fn is_valid_uri(uri: &str) -> bool {
    url::Url::parse(uri).is_ok()
}

/// Validates RFC 5545 RRULE (Recurrence Rule) format
/// 
/// Supports standard RRULE components:
/// - FREQ (DAILY, WEEKLY, MONTHLY, YEARLY)
/// - INTERVAL (1-999)
/// - COUNT (1-999)
/// - UNTIL (ISO 8601 datetime)
/// - BYDAY (MO, TU, WE, TH, FR, SA, SU with optional prefix)
/// - BYMONTHDAY (1-31, -31 to -1)
/// - BYMONTH (1-12)
/// - BYSETPOS (-366 to 366, excluding 0)
/// - WKST (MO, TU, WE, TH, FR, SA, SU)
/// 
/// # Examples
/// ```
/// use pubky_app_specs::is_valid_rrule;
/// 
/// assert!(is_valid_rrule("FREQ=DAILY"));
/// assert!(is_valid_rrule("FREQ=WEEKLY;INTERVAL=2;COUNT=10"));
/// assert!(is_valid_rrule("FREQ=MONTHLY;BYDAY=-1TH")); // Last Thursday
/// assert!(is_valid_rrule("FREQ=MONTHLY;BYMONTHDAY=21")); // 21st of month
/// assert!(!is_valid_rrule("INVALID"));
/// ```
pub fn is_valid_rrule(rrule: &str) -> bool {
    if rrule.is_empty() {
        return false;
    }
    
    let parts: Vec<&str> = rrule.split(';').collect();
    let mut has_freq = false;
    let mut has_count = false;
    let mut has_until = false;
    
    for part in parts {
        let kv: Vec<&str> = part.split('=').collect();
        if kv.len() != 2 {
            return false;
        }
        
        let key = kv[0];
        let value = kv[1];
        
        match key {
            "FREQ" => {
                if !matches!(value, "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY") {
                    return false;
                }
                has_freq = true;
            },
            "INTERVAL" => {
                if let Ok(interval) = value.parse::<u32>() {
                    if interval == 0 || interval > 999 {
                        return false;
                    }
                } else {
                    return false;
                }
            },
            "COUNT" => {
                if let Ok(count) = value.parse::<u32>() {
                    if count == 0 || count > 999 {
                        return false;
                    }
                    has_count = true;
                } else {
                    return false;
                }
            },
            "UNTIL" => {
                if !is_valid_datetime(value) {
                    return false;
                }
                has_until = true;
            },
            "BYDAY" => {
                // Validate BYDAY format: [+/-]N?DAY (e.g., MO, -1TH, 2FR)
                for day in value.split(',') {
                    if !is_valid_byday(day) {
                        return false;
                    }
                }
            },
            "BYMONTHDAY" => {
                // Validate BYMONTHDAY: 1-31 or -31 to -1
                for md in value.split(',') {
                    if let Ok(day) = md.parse::<i32>() {
                        if day == 0 || day > 31 || day < -31 {
                            return false;
                        }
                    } else {
                        return false;
                    }
                }
            },
            "BYMONTH" => {
                // Validate BYMONTH: 1-12
                for month in value.split(',') {
                    if let Ok(m) = month.parse::<u32>() {
                        if m == 0 || m > 12 {
                            return false;
                        }
                    } else {
                        return false;
                    }
                }
            },
            "BYSETPOS" => {
                // Validate BYSETPOS: -366 to 366, excluding 0
                for pos in value.split(',') {
                    if let Ok(p) = pos.parse::<i32>() {
                        if p == 0 || p > 366 || p < -366 {
                            return false;
                        }
                    } else {
                        return false;
                    }
                }
            },
            "WKST" => {
                if !matches!(value, "MO" | "TU" | "WE" | "TH" | "FR" | "SA" | "SU") {
                    return false;
                }
            },
            _ => {
                // Unknown RRULE component - reject to be strict
                return false;
            }
        }
    }
    
    // Must have FREQ
    if !has_freq {
        return false;
    }
    
    // Cannot have both COUNT and UNTIL
    if has_count && has_until {
        return false;
    }
    
    true
}

/// Helper function to validate BYDAY component
fn is_valid_byday(byday: &str) -> bool {
    // Format: [+/-]N?DAY where DAY is MO, TU, WE, TH, FR, SA, SU
    // Examples: MO, -1TH, 2FR, +3WE
    
    let weekdays = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];
    
    // Check if it's just a weekday
    if weekdays.contains(&byday) {
        return true;
    }
    
    // Check for prefix number (e.g., -1TH, 2FR)
    let mut chars = byday.chars();
    let mut pos = String::new();
    
    // Handle optional sign
    if let Some(first) = chars.next() {
        if first == '+' || first == '-' {
            pos.push(first);
        } else if first.is_ascii_digit() {
            pos.push(first);
        } else {
            return false;
        }
    }
    
    // Collect remaining digits
    for c in chars.clone() {
        if c.is_ascii_digit() {
            pos.push(c);
        } else {
            break;
        }
    }
    
    // Validate position number (-53 to 53, excluding 0)
    if !pos.is_empty() {
        if let Ok(n) = pos.parse::<i32>() {
            if n == 0 || n > 53 || n < -53 {
                return false;
            }
            // Rest should be a valid weekday
            let day_part = &byday[pos.len()..];
            return weekdays.contains(&day_part);
        }
        return false;
    }
    
    false
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

/// Validates ISO 8601 date-time format (YYYY-MM-DDTHH:MM:SS)
/// Accepts both basic formats and allows optional fractional seconds
/// 
/// # Examples
/// ```
/// use pubky_app_specs::is_valid_datetime;
/// 
/// assert!(is_valid_datetime("2025-11-29T22:35:00"));
/// assert!(is_valid_datetime("2025-01-01T00:00:00"));
/// assert!(!is_valid_datetime("2025-13-01T00:00:00")); // Invalid month
/// assert!(!is_valid_datetime("2025-11-29 22:35:00")); // Missing T separator
/// ```
pub fn is_valid_datetime(datetime: &str) -> bool {
    // Basic format: YYYY-MM-DDTHH:MM:SS
    // Allow optional fractional seconds: YYYY-MM-DDTHH:MM:SS.sss
    
    if datetime.len() < 19 {
        return false; // Minimum length for YYYY-MM-DDTHH:MM:SS
    }
    
    // Split by 'T' to get date and time parts
    let parts: Vec<&str> = datetime.split('T').collect();
    if parts.len() != 2 {
        return false;
    }
    
    let date_part = parts[0];
    let time_part = parts[1];
    
    // Validate date part (YYYY-MM-DD)
    let date_components: Vec<&str> = date_part.split('-').collect();
    if date_components.len() != 3 {
        return false;
    }
    
    // Parse year
    let year = match date_components[0].parse::<i32>() {
        Ok(y) if y >= 1000 && y <= 9999 => y,
        _ => return false,
    };
    
    // Parse month
    let month = match date_components[1].parse::<u32>() {
        Ok(m) if (1..=12).contains(&m) => m,
        _ => return false,
    };
    
    // Parse day
    let day = match date_components[2].parse::<u32>() {
        Ok(d) if (1..=31).contains(&d) => d,
        _ => return false,
    };
    
    // Basic month-day validation
    let max_day = match month {
        2 => {
            // Leap year check
            if (year % 4 == 0 && year % 100 != 0) || (year % 400 == 0) {
                29
            } else {
                28
            }
        },
        4 | 6 | 9 | 11 => 30,
        _ => 31,
    };
    
    if day > max_day {
        return false;
    }
    
    // Validate time part (HH:MM:SS or HH:MM:SS.sss)
    let time_components: Vec<&str> = time_part.split(':').collect();
    if time_components.len() != 3 {
        return false;
    }
    
    // Parse hour
    match time_components[0].parse::<u32>() {
        Ok(h) if h <= 23 => {},
        _ => return false,
    }
    
    // Parse minute
    match time_components[1].parse::<u32>() {
        Ok(m) if m <= 59 => {},
        _ => return false,
    }
    
    // Parse second (may have fractional part)
    let second_str = time_components[2];
    let _second = if second_str.contains('.') {
        // Has fractional seconds
        let sec_parts: Vec<&str> = second_str.split('.').collect();
        if sec_parts.len() != 2 {
            return false;
        }
        match sec_parts[0].parse::<u32>() {
            Ok(s) if s <= 59 => s,
            _ => return false,
        }
    } else {
        match second_str.parse::<u32>() {
            Ok(s) if s <= 59 => s,
            _ => return false,
        }
    };
    
    true
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

    // =====================================================
    // RFC 5870 / RFC 4589 / RFC 7986 - Location Tests
    // =====================================================

    #[test]
    fn test_is_valid_geo_uri() {
        // Valid RFC 5870 geo URIs
        assert!(is_valid_geo_uri("geo:47.3769,8.5417"));        // Zurich
        assert!(is_valid_geo_uri("geo:0,0"));                   // Null Island
        assert!(is_valid_geo_uri("geo:-90,-180"));              // Min bounds
        assert!(is_valid_geo_uri("geo:90,180"));                // Max bounds
        assert!(is_valid_geo_uri("geo:47.3769,8.5417;u=10"));   // With uncertainty
        assert!(is_valid_geo_uri("geo:47.3769,8.5417;u=100"));  // With larger uncertainty
        assert!(is_valid_geo_uri("geo:-33.8688,151.2093"));     // Sydney
        assert!(is_valid_geo_uri("geo:35.6762,139.6503"));      // Tokyo
        
        // Invalid geo URIs
        assert!(!is_valid_geo_uri("47.3769,8.5417"));           // Missing "geo:" prefix
        assert!(!is_valid_geo_uri("geo:47.3769"));              // Missing longitude
        assert!(!is_valid_geo_uri("geo:91,0"));                 // Lat out of bounds
        assert!(!is_valid_geo_uri("geo:0,181"));                // Lon out of bounds
        assert!(!is_valid_geo_uri("geo:invalid,coords"));       // Non-numeric
        assert!(!is_valid_geo_uri("geo:"));                     // Empty coordinates
        assert!(!is_valid_geo_uri(""));                         // Empty string
        assert!(!is_valid_geo_uri("GEO:47.3769,8.5417"));       // Wrong case prefix
    }

    #[test]
    fn test_is_valid_location_type() {
        // Valid RFC 4589 location types
        assert!(is_valid_location_type("venue"));
        assert!(is_valid_location_type("parking"));
        assert!(is_valid_location_type("restaurant"));
        assert!(is_valid_location_type("hotel"));
        assert!(is_valid_location_type("airport"));
        assert!(is_valid_location_type("train-station"));
        assert!(is_valid_location_type("bus-station"));
        assert!(is_valid_location_type("office"));
        assert!(is_valid_location_type("residence"));
        assert!(is_valid_location_type("stadium"));
        assert!(is_valid_location_type("theater"));
        assert!(is_valid_location_type("other"));
        
        // Case insensitivity (should normalize)
        assert!(is_valid_location_type("VENUE"));
        assert!(is_valid_location_type("Parking"));
        assert!(is_valid_location_type("RESTAURANT"));
        
        // Invalid location types
        assert!(!is_valid_location_type("invalid_type"));
        assert!(!is_valid_location_type(""));
        assert!(!is_valid_location_type("custom-location"));
        assert!(!is_valid_location_type("unknown"));
    }

    #[test]
    fn test_is_valid_conference_features() {
        // Valid RFC 7986 CONFERENCE features
        assert!(is_valid_conference_features(&["AUDIO".to_string()]));
        assert!(is_valid_conference_features(&["VIDEO".to_string()]));
        assert!(is_valid_conference_features(&["CHAT".to_string()]));
        assert!(is_valid_conference_features(&["PHONE".to_string()]));
        assert!(is_valid_conference_features(&["SCREEN".to_string()]));
        assert!(is_valid_conference_features(&["MODERATOR".to_string()]));
        assert!(is_valid_conference_features(&["FEED".to_string()]));
        
        // Multiple valid features
        assert!(is_valid_conference_features(&["AUDIO".to_string(), "VIDEO".to_string()]));
        assert!(is_valid_conference_features(&["VIDEO".to_string(), "CHAT".to_string(), "SCREEN".to_string()]));
        assert!(is_valid_conference_features(&["AUDIO".to_string(), "VIDEO".to_string(), "MODERATOR".to_string()]));
        
        // All features combined
        assert!(is_valid_conference_features(&[
            "AUDIO".to_string(), 
            "VIDEO".to_string(), 
            "CHAT".to_string(),
            "PHONE".to_string(),
            "SCREEN".to_string(),
            "MODERATOR".to_string(),
            "FEED".to_string(),
        ]));
        
        // Empty array is valid (no features specified)
        assert!(is_valid_conference_features(&[]));
        
        // Invalid features
        assert!(!is_valid_conference_features(&["INVALID".to_string()]));
        assert!(!is_valid_conference_features(&["AUDIO".to_string(), "INVALID".to_string()]));
        assert!(!is_valid_conference_features(&["WEBCAM".to_string()])); // Not in RFC 7986
        assert!(!is_valid_conference_features(&["RECORDING".to_string()])); // Not in RFC 7986
        
        // Case-insensitive - lowercase is valid (normalized to uppercase)
        assert!(is_valid_conference_features(&["audio".to_string()]));
        assert!(is_valid_conference_features(&["video".to_string()]));
        assert!(is_valid_conference_features(&["Audio".to_string(), "Video".to_string()]));
    }

    #[test]
    fn test_is_valid_uri() {
        // Valid URIs
        assert!(is_valid_uri("https://zoom.us/j/123456789"));
        assert!(is_valid_uri("https://meet.google.com/abc-defg-hij"));
        assert!(is_valid_uri("https://teams.microsoft.com/l/meetup-join/123"));
        assert!(is_valid_uri("tel:+1-555-123-4567"));
        assert!(is_valid_uri("sip:user@example.com"));
        assert!(is_valid_uri("xmpp:room@conference.example.com"));
        assert!(is_valid_uri("http://example.com/meeting"));
        assert!(is_valid_uri("https://www.openstreetmap.org/node/123456"));
        
        // Invalid URIs
        assert!(!is_valid_uri(""));                              // Empty
        assert!(!is_valid_uri("not-a-uri"));                     // No scheme
        assert!(!is_valid_uri("://missing-scheme.com"));         // Missing scheme
        assert!(!is_valid_uri("https://"));                      // Missing host
    }

    #[test]
    fn test_is_valid_datetime() {
        // Valid datetimes
        assert!(is_valid_datetime("2025-11-29T22:35:00"));
        assert!(is_valid_datetime("2025-01-01T00:00:00"));
        assert!(is_valid_datetime("2024-12-31T23:59:59"));
        assert!(is_valid_datetime("2024-02-29T12:00:00")); // Leap year
        
        // Invalid datetimes
        assert!(!is_valid_datetime("2025-13-01T00:00:00")); // Invalid month
        assert!(!is_valid_datetime("2025-00-01T00:00:00")); // Invalid month
        assert!(!is_valid_datetime("2025-11-32T00:00:00")); // Invalid day
        assert!(!is_valid_datetime("2025-11-00T00:00:00")); // Invalid day
        assert!(!is_valid_datetime("2025-02-29T00:00:00")); // Not a leap year
        assert!(!is_valid_datetime("2025-11-29 22:35:00")); // Missing T separator
        assert!(!is_valid_datetime("2025-11-29T24:00:00")); // Invalid hour
        assert!(!is_valid_datetime("2025-11-29T22:60:00")); // Invalid minute
        assert!(!is_valid_datetime("2025-11-29T22:35:60")); // Invalid second
        assert!(!is_valid_datetime("25-11-29T22:35:00"));   // Invalid year format
        assert!(!is_valid_datetime(""));                     // Empty
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
