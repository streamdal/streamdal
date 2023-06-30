use crate::matcher_core as core;
use crate::matcher_numeric as numeric;
use crate::matcher_pii as pii;
use ajson::Value;
use protos::matcher::{MatchRequest, MatchType};
use std::str;

pub struct Detective {}

impl Default for Detective {
    fn default() -> Self {
        Detective::new()
    }
}

impl Detective {
    pub fn new() -> Self {
        // env_logger::init();
        Detective {}
    }

    // Value can be int, float, string, bool
    pub fn matches(&self, request: &MatchRequest) -> Result<bool, String> {
        validate_match_request(request)?;

        match request.type_.enum_value().unwrap() {
            // DONE: Numeric matchers
            MatchType::MATCH_TYPE_NUMERIC_EQUAL_TO
            | MatchType::MATCH_TYPE_NUMERIC_GREATER_EQUAL
            | MatchType::MATCH_TYPE_NUMERIC_GREATER_THAN
            | MatchType::MATCH_TYPE_NUMERIC_LESS_EQUAL
            | MatchType::MATCH_TYPE_NUMERIC_LESS_THAN => numeric::common(request),

            // // Core matchers
            MatchType::MATCH_TYPE_STRING_EQUAL => core::string_equal_to(request),
            MatchType::MATCH_TYPE_STRING_CONTAINS_ANY => core::string_contains_any(request),
            MatchType::MATCH_TYPE_STRING_CONTAINS_ALL => core::string_contains_all(request),
            MatchType::MATCH_TYPE_IPV4_ADDRESS | MatchType::MATCH_TYPE_IPV6_ADDRESS => {
                core::ip_address(request)
            }
            MatchType::MATCH_TYPE_REGEX => core::regex(request),
            MatchType::MATCH_TYPE_TIMESTAMP_RFC3339 => core::timestamp_rfc3339(request),
            MatchType::MATCH_TYPE_TIMESTAMP_UNIX_NANO => core::timestamp_unix_nano(request),
            MatchType::MATCH_TYPE_TIMESTAMP_UNIX => core::timestamp_unix(request),
            MatchType::MATCH_TYPE_BOOLEAN_FALSE => core::boolean(request, false),
            MatchType::MATCH_TYPE_BOOLEAN_TRUE => core::boolean(request, true),
            MatchType::MATCH_TYPE_IS_EMPTY => core::is_empty(request),
            MatchType::MATCH_TYPE_HAS_FIELD => core::has_field(request),
            MatchType::MATCH_TYPE_IS_TYPE => core::is_type(request),
            MatchType::MATCH_TYPE_UUID => core::uuid(request),
            MatchType::MATCH_TYPE_MAC_ADDRESS => core::mac_address(request),

            // PII matchers
            MatchType::MATCH_TYPE_PII_ANY => pii::all(request),
            MatchType::MATCH_TYPE_PII_CREDIT_CARD => pii::credit_card(request),
            MatchType::MATCH_TYPE_PII_SSN => pii::ssn(request),
            MatchType::MATCH_TYPE_PII_EMAIL => pii::email(request),
            MatchType::MATCH_TYPE_PII_PHONE => pii::phone(request),
            MatchType::MATCH_TYPE_PII_DRIVER_LICENSE => pii::drivers_license(request),
            MatchType::MATCH_TYPE_PII_PASSPORT_ID => pii::passport_id(request),
            MatchType::MATCH_TYPE_PII_VIN_NUMBER => pii::vin_number(request),
            MatchType::MATCH_TYPE_PII_SERIAL_NUMBER => pii::serial_number(request),
            MatchType::MATCH_TYPE_PII_LOGIN => pii::login(request),
            MatchType::MATCH_TYPE_PII_TAXPAYER_ID => pii::taxpayer_id(request),
            MatchType::MATCH_TYPE_PII_ADDRESS => pii::address(request),
            MatchType::MATCH_TYPE_PII_SIGNATURE => pii::signature(request),
            MatchType::MATCH_TYPE_PII_GEOLOCATION => pii::geolocation(request),
            MatchType::MATCH_TYPE_PII_EDUCATION => pii::education(request),
            MatchType::MATCH_TYPE_PII_FINANCIAL => pii::financial(request),
            MatchType::MATCH_TYPE_PII_HEALTH => pii::health(request),

            // Error cases
            MatchType::MATCH_TYPE_UNKNOWN => return Err(format!("match type cannot be unknown")),

            // Unreachable unless a match is missed/commented out etc.
            #[allow(unreachable_patterns)]
            unhandled_type => Err(format!(
                "unhandled match request type: {:#?}",
                unhandled_type
            )),
        }
    }
}

pub fn parse_field<'a>(data: &'a Vec<u8>, path: &'a String) -> Result<Value<'a>, String> {
    let data_as_str = match str::from_utf8(data) {
        Ok(v) => v,
        Err(e) => return Err(format!("unable to convert bytes to string: {}", e)),
    };

    match ajson::get(data_as_str, path) {
        Ok(Some(value)) => Ok(value),
        Ok(None) => Err(format!("path '{}' not found in data", path)),
        Err(e) => Err(format!("error parsing field: {:?}", e)),
    }
}

fn validate_match_request(request: &MatchRequest) -> Result<(), String> {
    match request.type_.enum_value() {
        Ok(value) => {
            if value == MatchType::MATCH_TYPE_UNKNOWN {
                return Err("match type cannot be unknown".to_string());
            }
        }
        Err(unexpected) => {
            return Err(format!("unexpected match type '{:#?}'", unexpected));
        }
    }

    if request.path.is_empty() {
        return Err("path cannot be empty".to_string());
    }

    if request.data.is_empty() {
        return Err("data cannot be empty".to_string());
    }

    Ok(())
}
