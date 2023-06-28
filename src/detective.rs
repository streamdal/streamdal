use crate::matcher_core as core;
use crate::matcher_numeric as numeric;
use crate::matcher_pii as pii;
use log::debug;
use protos::matcher::{MatchRequest, MatchType};

pub struct Detective {}

impl Detective {
    pub fn new() -> Self {
        env_logger::init();

        Detective {}
    }

    // Value can be int, float, string, bool
    pub fn matches(&self, request: &MatchRequest) -> Result<bool, String> {
        validate_match_request(request)?;
        let field = self.parse_field(&request.data, &request.path)?;

        match request.type_.enum_value().unwrap() {
            // Numeric matchers
            MatchType::MATCH_TYPE_NUMERIC_EQUAL_TO
            | MatchType::MATCH_TYPE_NUMERIC_GREATER_EQUAL
            | MatchType::MATCH_TYPE_NUMERIC_GREATER_THAN
            | MatchType::MATCH_TYPE_NUMERIC_LESS_EQUAL
            | MatchType::MATCH_TYPE_NUMERIC_LESS_THAN => return numeric::common(&field, &request),

            // Core matchers
            MatchType::MATCH_TYPE_STRING_EQUAL => core::string_equal_to(request, &field),
            MatchType::MATCH_TYPE_STRING_CONTAINS_ANY => core::string_contains_any(request, &field),
            MatchType::MATCH_TYPE_STRING_CONTAINS_ALL => core::string_contains_all(request, &field),
            MatchType::MATCH_TYPE_IP_ADDRESS => core::ip_address(request, &field),
            MatchType::MATCH_TYPE_REGEX => match_regex(request, &field),
            MatchType::MATCH_TYPE_TIMESTAMP_RFC3339 => core::timestamp_rfc3339(request, &field),
            MatchType::MATCH_TYPE_TIMESTAMP_UNIX_NANO => core::timestamp_unix_nano(request, &field),
            MatchType::MATCH_TYPE_TIMESTAMP_UNIX => core::timestamp_unix(request, &field),
            MatchType::MATCH_TYPE_BOOLEAN_FALSE | MatchType::MATCH_TYPE_BOOLEAN_TRUE => {
                core::is_boolean(request, &field)
            }
            MatchType::MATCH_TYPE_IS_EMPTY => core::is_empty(request, &field),
            MatchType::MATCH_TYPE_HAS_FIELD => core::has_field(request, &field),
            MatchType::MATCH_TYPE_IS_TYPE => core::is_type(request, &field),

            // PII matchers
            MatchType::MATCH_TYPE_PII => pii::all(request, &field),
            MatchType::MATCH_TYPE_PII_CREDIT_CARD => pii::credit_card(request, &field),
            MatchType::MATCH_TYPE_PII_SSN => pii::ssn(request, &field),
            MatchType::MATCH_TYPE_PII_EMAIL => pii::email(request, &field),
            MatchType::MATCH_TYPE_PII_PHONE => pii::phone(request, &field),

            // Error cases
            MatchType::MATCH_TYPE_UNKNOWN => return Err(format!("Match type cannot be unknown")),
            unhandled_type => {
                return Err(format!(
                    "Error: Unhandled match request type: {:#?}",
                    unhandled_type
                ))
            }
        }
    }
}

fn validate_match_request(request: &MatchRequest) -> Result<(), String> {
    match request.type_.enum_value() {
        Ok(value) => {
            if value == MatchType::MATCH_TYPE_UNKNOWN {
                return Err("Match type cannot be unknown".to_string());
            }
        }
        Err(unexpected) => {
            return Err(format!("Unexpected match type '{:#?}'", unexpected));
        }
    }

    if request.path.is_empty() {
        return Err("Path cannot be empty".to_string());
    }

    if request.data.is_empty() {
        return Err("Data cannot be empty".to_string());
    }

    Ok(())
}
