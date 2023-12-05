use crate::error::CustomError;
use crate::matcher_numeric as numeric;
use crate::matcher_pii as pii;
use crate::{matcher_core as core};

use protos::sp_steps_detective::DetectiveType;
use std::str;

// TODO: can we get this working
//type MatcherFunc = fn (&Request, gjson::Value) -> Result<bool, CustomError>;

pub struct Detective {}

#[derive(Clone)]
pub struct Request<'a> {
    pub match_type: DetectiveType,
    pub data: &'a Vec<u8>,
    pub path: String,
    pub args: Vec<String>,
    pub negate: bool,
}

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
    pub fn matches(&self, request: &Request) -> Result<bool, CustomError> {
        validate_request(request)?;

        return if !request.path.is_empty() {
            // Matching on path value
            self.matches_path(request)
        } else {
            // Matching on any field in the payload
            self.matches_payload(request)
        }
    }

    pub fn matches_payload(&self, request: &Request) -> Result<bool, CustomError> {
        let data_as_str = str::from_utf8(request.data)
            .map_err(|e| CustomError::Error(format!("unable to convert bytes to string: {}", e)))?;

        let obj = gjson::parse(data_as_str);

        let mut found: bool = false;

        let f = Detective::get_matcher_func(request)?;

        obj.each(|_, value| {
            let res = recurse_field(&request, value, &request.path, &request.args[0], f);
            if res {
                found = true;
            }
            true
        });

        if found {
            return Ok(true);
        } else {
            return Ok(false);
        }
    }

    pub fn matches_path(&self, request: &Request) -> Result<bool, CustomError> {
        let field = parse_field(request.data, &request.path)?;

        let f = Detective::get_matcher_func(request)?;

        return f(request, field);
    }

    fn get_matcher_func(request: &Request) -> Result<fn (&Request, gjson::Value) -> Result<bool, CustomError>, CustomError> {
        let f = match request.match_type {
            DetectiveType::DETECTIVE_TYPE_NUMERIC_EQUAL_TO
            | DetectiveType::DETECTIVE_TYPE_NUMERIC_GREATER_EQUAL
            | DetectiveType::DETECTIVE_TYPE_NUMERIC_GREATER_THAN
            | DetectiveType::DETECTIVE_TYPE_NUMERIC_LESS_EQUAL
            | DetectiveType::DETECTIVE_TYPE_NUMERIC_LESS_THAN
            | DetectiveType::DETECTIVE_TYPE_NUMERIC_MIN
            | DetectiveType::DETECTIVE_TYPE_NUMERIC_MAX
            | DetectiveType::DETECTIVE_TYPE_NUMERIC_RANGE => numeric::common,

            // Core matchers
            DetectiveType::DETECTIVE_TYPE_STRING_EQUAL => core::string_equal_to,
            DetectiveType::DETECTIVE_TYPE_STRING_CONTAINS_ANY => core::string_contains_any,
            DetectiveType::DETECTIVE_TYPE_STRING_CONTAINS_ALL => core::string_contains_all,
            DetectiveType::DETECTIVE_TYPE_STRING_LENGTH_MIN
            | DetectiveType::DETECTIVE_TYPE_STRING_LENGTH_MAX
            | DetectiveType::DETECTIVE_TYPE_STRING_LENGTH_RANGE => core::string_length,
            DetectiveType::DETECTIVE_TYPE_IPV4_ADDRESS
            | DetectiveType::DETECTIVE_TYPE_IPV6_ADDRESS => core::ip_address,
            DetectiveType::DETECTIVE_TYPE_REGEX => core::regex,
            DetectiveType::DETECTIVE_TYPE_TIMESTAMP_RFC3339 => core::timestamp_rfc3339,
            DetectiveType::DETECTIVE_TYPE_TIMESTAMP_UNIX_NANO => core::timestamp_unix_nano,
            DetectiveType::DETECTIVE_TYPE_TIMESTAMP_UNIX => core::timestamp_unix,
            DetectiveType::DETECTIVE_TYPE_BOOLEAN_FALSE => core::boolean_false,
            DetectiveType::DETECTIVE_TYPE_BOOLEAN_TRUE => core::boolean_true,
            DetectiveType::DETECTIVE_TYPE_IS_EMPTY => core::is_empty,
            DetectiveType::DETECTIVE_TYPE_HAS_FIELD => core::has_field,
            DetectiveType::DETECTIVE_TYPE_IS_TYPE => core::is_type,
            DetectiveType::DETECTIVE_TYPE_UUID => core::uuid,
            DetectiveType::DETECTIVE_TYPE_MAC_ADDRESS => core::mac_address,
            DetectiveType::DETECTIVE_TYPE_URL => core::url,
            DetectiveType::DETECTIVE_TYPE_HOSTNAME => core::hostname,
            DetectiveType::DETECTIVE_TYPE_SEMVER => core::semver,

            // PII matchers
            DetectiveType::DETECTIVE_TYPE_PII_ANY => pii::any,
            DetectiveType::DETECTIVE_TYPE_PII_CREDIT_CARD => pii::credit_card,
            DetectiveType::DETECTIVE_TYPE_PII_SSN => pii::ssn,
            DetectiveType::DETECTIVE_TYPE_PII_EMAIL => pii::email,
            DetectiveType::DETECTIVE_TYPE_PII_PHONE => pii::phone,
            DetectiveType::DETECTIVE_TYPE_PII_DRIVER_LICENSE => pii::drivers_license,
            DetectiveType::DETECTIVE_TYPE_PII_PASSPORT_ID => pii::passport_id,
            DetectiveType::DETECTIVE_TYPE_PII_VIN_NUMBER => pii::vin_number,
            DetectiveType::DETECTIVE_TYPE_PII_SERIAL_NUMBER => pii::serial_number,
            DetectiveType::DETECTIVE_TYPE_PII_LOGIN => pii::login,
            DetectiveType::DETECTIVE_TYPE_PII_TAXPAYER_ID => pii::taxpayer_id,
            DetectiveType::DETECTIVE_TYPE_PII_ADDRESS => pii::address,
            DetectiveType::DETECTIVE_TYPE_PII_SIGNATURE => pii::signature,
            DetectiveType::DETECTIVE_TYPE_PII_GEOLOCATION => pii::geolocation,
            DetectiveType::DETECTIVE_TYPE_PII_EDUCATION => pii::education,
            DetectiveType::DETECTIVE_TYPE_PII_FINANCIAL => pii::financial,
            DetectiveType::DETECTIVE_TYPE_PII_HEALTH => pii::health,

            DetectiveType::DETECTIVE_TYPE_UNKNOWN => {
                return Err(CustomError::Error(
                    "match type cannot be unknown".to_string(),
                ))
            },
        };

        return Ok(f);
    }
}

pub fn parse_field<'a>(
    data: &'a [u8],
    path: &'a String,
) -> Result<gjson::Value<'a>, CustomError> {
    let data_as_str = str::from_utf8(data)
        .map_err(|e| CustomError::Error(format!("unable to convert bytes to string: {}", e)))?;

    let v = gjson::get(data_as_str, path);

    if !v.exists() {
        return Err(CustomError::Error(format!(
            "path '{}' not found in data",
            path
        )));
    }

    Ok(v)
}

pub fn parse_number(input: &str) -> Result<f64, CustomError> {
    match input.parse() {
        Ok(number) => Ok(number),
        Err(err) => Err(CustomError::Error(format!(
            "failed to parse number: {}",
            err
        ))),
    }
}

fn validate_request(request: &Request) -> Result<(), CustomError> {
    if request.match_type == DetectiveType::DETECTIVE_TYPE_UNKNOWN {
        return Err(CustomError::MatchError(format!(
            "unknown match type: {:?}",
            request.match_type
        )));
    }

    if request.data.is_empty() {
        return Err(CustomError::Error("data cannot be empty".to_string()));
    }

    Ok(())
}
fn recurse_field(request: &Request, val: gjson::Value, field_name: &str, target_value: &str, f: fn (&Request, gjson::Value) -> Result<bool, CustomError>) -> bool {
    match val.kind() {
        gjson::Kind::String | gjson::Kind::Number | gjson::Kind::True | gjson::Kind::False => {
            if let Ok(res) = f(&request, val) {
                // TODO: fix this
                return res;
            }
        }

        gjson::Kind::Object => {
            let mut found: bool = false;
            val.each(|_, value| {
                if recurse_field(request, value, field_name, target_value, f) {
                    found = true;
                }
                true
            });

            if found {
                return true;
            }
        }
        gjson::Kind::Array => {
            let mut found: bool = false;
            val.each(|_, value| {
                if recurse_field(request,value, field_name, target_value, f) {
                    found = true;
                }
                return true;
            });

            if found {
                return true;
            }
        }
        _ => {} // Don't care about nulls
    }

    false
}