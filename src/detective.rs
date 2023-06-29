use crate::matcher_core as core;
use crate::matcher_numeric as numeric;
use crate::matcher_pii as pii;
use log::debug;
use protos::matcher::{MatchRequest, MatchType};
use std::str;

pub struct Detective {}

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
            MatchType::MATCH_TYPE_IP_ADDRESS => core::ipv4_address(request),
            MatchType::MATCH_TYPE_REGEX => core::regex(request),
            MatchType::MATCH_TYPE_TIMESTAMP_RFC3339 => core::timestamp_rfc3339(request),
            // MatchType::MATCH_TYPE_UUID => core::uuid(request),
            // MatchType::MATCH_TYPE_IPV6_ADDRESS => core::ipv6_address(request),
            // MatchType::MATCH_TYPE_MAC_ADDRESS => core::mac_address(request),
            MatchType::MATCH_TYPE_TIMESTAMP_UNIX_NANO => core::timestamp_unix_nano(request),
            MatchType::MATCH_TYPE_TIMESTAMP_UNIX => core::timestamp_unix(request),
            MatchType::MATCH_TYPE_BOOLEAN_FALSE | MatchType::MATCH_TYPE_BOOLEAN_TRUE => {
                core::is_boolean(request)
            }
            MatchType::MATCH_TYPE_IS_EMPTY => core::is_empty(request),
            MatchType::MATCH_TYPE_HAS_FIELD => core::has_field(request),
            MatchType::MATCH_TYPE_IS_TYPE => core::is_type(request),

            // PII matchers
            MatchType::MATCH_TYPE_PII => pii::all(request),
            MatchType::MATCH_TYPE_PII_CREDIT_CARD => pii::credit_card(request),
            MatchType::MATCH_TYPE_PII_SSN => pii::ssn(request),
            MatchType::MATCH_TYPE_PII_EMAIL => pii::email(request),
            MatchType::MATCH_TYPE_PII_PHONE => pii::phone(request),

            // Error cases
            MatchType::MATCH_TYPE_UNKNOWN => return Err(format!("match type cannot be unknown")),

            // Unreachable unless a match is missed/commented out etc.
            #[allow(unreachable_patterns)]
            unhandled_type => {
                return Err(format!(
                    "unhandled match request type: {:#?}",
                    unhandled_type
                ))
            }
        }
    }
}

pub fn parse_field(data: &Vec<u8>, path: &String) -> Result<String, String> {
    let data_as_str = match str::from_utf8(data) {
        Ok(v) => v,
        Err(e) => return Err(format!("invalid UTF-8 sequence: {}", e)),
    };

    match ajson::get(data_as_str, path) {
        Ok(Some(value)) => {
            debug!("Found value: {}", value);
            Ok(value.to_string())
        }
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
