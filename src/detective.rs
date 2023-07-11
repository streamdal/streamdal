use crate::error::CustomError;
use crate::matcher_numeric as numeric;
use crate::matcher_pii as pii;
use crate::{matcher_core as core, FromValue};

use protos::detective::DetectiveType;
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

    pub fn matches(
        &self,
        match_type: DetectiveType,
        data: &Vec<u8>,
        path: &String,
        args: &Vec<String>,
        negate: bool,
    ) -> Result<bool, CustomError> {
        if match_type == DetectiveType::DETECTIVE_TYPE_UNKNOWN {
            return Err(CustomError::MatchError(format!(
                "unknown match type: {:?}",
                match_type,
            )));
        }

        match match_type {
            DetectiveType::DETECTIVE_TYPE_NUMERIC_EQUAL_TO
            | DetectiveType::DETECTIVE_TYPE_NUMERIC_GREATER_EQUAL
            | DetectiveType::DETECTIVE_TYPE_NUMERIC_GREATER_THAN
            | DetectiveType::DETECTIVE_TYPE_NUMERIC_LESS_EQUAL
            | DetectiveType::DETECTIVE_TYPE_NUMERIC_LESS_THAN => {
                numeric::common(match_type, data, path, args, negate)
            }

            // Core matchers
            DetectiveType::DETECTIVE_TYPE_STRING_EQUAL => {
                core::string_equal_to(data, path, args, negate)
            }
            DetectiveType::DETECTIVE_TYPE_STRING_CONTAINS_ANY => {
                core::string_contains_any(data, path, args, negate)
            }
            DetectiveType::DETECTIVE_TYPE_STRING_CONTAINS_ALL => {
                core::string_contains_all(data, path, args, negate)
            }
            DetectiveType::DETECTIVE_TYPE_IPV4_ADDRESS
            | DetectiveType::DETECTIVE_TYPE_IPV6_ADDRESS => {
                core::ip_address(match_type, data, path, args, negate)
            }
            DetectiveType::DETECTIVE_TYPE_REGEX => core::regex(data, path, args, negate),
            DetectiveType::DETECTIVE_TYPE_TIMESTAMP_RFC3339 => {
                core::timestamp_rfc3339(data, path, args, negate)
            }
            DetectiveType::DETECTIVE_TYPE_TIMESTAMP_UNIX_NANO => {
                core::timestamp_unix_nano(data, path, args, negate)
            }
            DetectiveType::DETECTIVE_TYPE_TIMESTAMP_UNIX => {
                core::timestamp_unix(data, path, args, negate)
            }
            DetectiveType::DETECTIVE_TYPE_BOOLEAN_FALSE => {
                core::boolean(data, path, args, negate, false)
            }
            DetectiveType::DETECTIVE_TYPE_BOOLEAN_TRUE => {
                core::boolean(data, path, args, negate, true)
            }
            DetectiveType::DETECTIVE_TYPE_IS_EMPTY => core::is_empty(data, path, args, negate),
            DetectiveType::DETECTIVE_TYPE_HAS_FIELD => core::has_field(data, path, args, negate),
            DetectiveType::DETECTIVE_TYPE_IS_TYPE => core::is_type(data, path, args, negate),
            DetectiveType::DETECTIVE_TYPE_UUID => core::uuid(data, path, args, negate),
            DetectiveType::DETECTIVE_TYPE_MAC_ADDRESS => {
                core::mac_address(data, path, args, negate)
            }

            // PII matchers
            DetectiveType::DETECTIVE_TYPE_PII_ANY => pii::any(data, path, args, negate),
            DetectiveType::DETECTIVE_TYPE_PII_CREDIT_CARD => {
                pii::credit_card(data, path, args, negate)
            }
            DetectiveType::DETECTIVE_TYPE_PII_SSN => pii::ssn(data, path, args, negate),
            DetectiveType::DETECTIVE_TYPE_PII_EMAIL => pii::email(data, path, args, negate),
            DetectiveType::DETECTIVE_TYPE_PII_PHONE => pii::phone(data, path, args, negate),
            DetectiveType::DETECTIVE_TYPE_PII_DRIVER_LICENSE => {
                pii::drivers_license(data, path, args, negate)
            }
            DetectiveType::DETECTIVE_TYPE_PII_PASSPORT_ID => {
                pii::passport_id(data, path, args, negate)
            }
            DetectiveType::DETECTIVE_TYPE_PII_VIN_NUMBER => {
                pii::vin_number(data, path, args, negate)
            }
            DetectiveType::DETECTIVE_TYPE_PII_SERIAL_NUMBER => {
                pii::serial_number(data, path, args, negate)
            }
            DetectiveType::DETECTIVE_TYPE_PII_LOGIN => pii::login(data, path, args, negate),
            DetectiveType::DETECTIVE_TYPE_PII_TAXPAYER_ID => {
                pii::taxpayer_id(data, path, args, negate)
            }
            DetectiveType::DETECTIVE_TYPE_PII_ADDRESS => pii::address(data, path, args, negate),
            DetectiveType::DETECTIVE_TYPE_PII_SIGNATURE => pii::signature(data, path, args, negate),
            DetectiveType::DETECTIVE_TYPE_PII_GEOLOCATION => {
                pii::geolocation(data, path, args, negate)
            }
            DetectiveType::DETECTIVE_TYPE_PII_EDUCATION => pii::education(data, path, args, negate),
            DetectiveType::DETECTIVE_TYPE_PII_FINANCIAL => pii::financial(data, path, args, negate),
            DetectiveType::DETECTIVE_TYPE_PII_HEALTH => pii::health(data, path, args, negate),

            DetectiveType::DETECTIVE_TYPE_UNKNOWN => Err(CustomError::Error(
                "match type cannot be unknown".to_string(),
            )),
        }
    }
}

pub fn parse_field<'a, T: FromValue<'a>>(
    data: &'a [u8],
    path: &'a String,
) -> Result<T, CustomError> {
    let data_as_str = str::from_utf8(data)
        .map_err(|e| CustomError::Error(format!("unable to convert bytes to string: {}", e)))?;

    let v = gjson::get(data_as_str, path);

    if !v.exists() {
        return Err(CustomError::Error(format!(
            "path '{}' not found in data",
            path
        )));
    }

    T::from_value(v)
}
