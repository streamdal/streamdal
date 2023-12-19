use crate::error::CustomError;
use chrono::TimeZone;
use crate::detective::{parse_number, Request};
use gjson::Value;
use protos::sp_steps_detective::DetectiveType;
use regex::Regex;
use std::net::IpAddr;
use std::str;
use std::str::FromStr;
use url::Url;
use uuid::Uuid;

pub fn string_equal_to(request: &Request, field: Value) -> Result<bool, CustomError> {
    if request.args.len() != 1 {
        return Err(CustomError::Error(
            "string_equal_to requires exactly 1 argument".to_string(),
        ));
    }

    Ok(field.str() == request.args[0])
}

pub fn string_contains_any(request: &Request, field: Value) -> Result<bool, CustomError> {
    if request.args.is_empty() {
        return Err(CustomError::Error(
            "string_contains_any requires at least 1 argument".to_string(),
        ));
    }

    for arg in &request.args {
        if field.str().contains(arg) {
            return Ok(true);
        }
    }

    Ok(false)
}

pub fn string_contains_all(request: &Request, field: Value) -> Result<bool, CustomError> {
    if request.args.is_empty() {
        return Err(CustomError::Error(
            "string_contains_any requires at least 1 argument".to_string(),
        ));
    }

    for arg in &request.args {
        if !field.str().contains(arg) {
            return Ok(false);
        }
    }

    Ok(true)
}

pub fn ip_address(request: &Request, field: Value) -> Result<bool, CustomError> {
    match request.match_type {
        DetectiveType::DETECTIVE_TYPE_IPV4_ADDRESS => {
            IpAddr::from_str(field.str()).map_or(Ok(false), |i| Ok(i.is_ipv4()))
        }
        DetectiveType::DETECTIVE_TYPE_IPV6_ADDRESS => {
            IpAddr::from_str(field.str()).map_or(Ok(false), |i| Ok(i.is_ipv6()))
        }
        _ => Err(CustomError::MatchError(
            "unknown ip address match type".to_string(),
        )),
    }
}

pub fn mac_address(_request: &Request, f: Value) -> Result<bool, CustomError> {
    let field = f.str();
    // Check if the string has the correct length
    if field.len() != 17 {
        return Ok(false);
    }

    let s = str::replace(field, "-", ":");

    // Iterate through each character and check if it's a valid MAC address character
    for (i, c) in s.chars().enumerate() {
        if i % 3 == 2 {
            if c != ':' {
                return Ok(false);
            }
        } else if !c.is_ascii_hexdigit() {
            return Ok(false);
        }
    }

    Ok(true)
}

pub fn uuid(_request: &Request, field: Value) -> Result<bool, CustomError> {
    let val = field.str().replace(':', "-");
    Ok(Uuid::parse_str(val.as_str()).is_ok())
}

pub fn timestamp_rfc3339(_request: &Request, field: Value) -> Result<bool, CustomError> {
    Ok(chrono::DateTime::parse_from_rfc3339(field.str()).is_ok())
}

pub fn timestamp_unix_nano(_request: &Request, field: Value) -> Result<bool, CustomError> {
    if field.str().chars().any(|c| !c.is_ascii_digit()) {
        return Ok(false);
    }

    if let chrono::LocalResult::Single(_) = chrono::Utc.timestamp_opt(field.i64() / 1_000_000_000, 0) {
        return Ok(true);
    }

    Ok(false)
}

pub fn timestamp_unix(_request: &Request, field: Value) -> Result<bool, CustomError> {
    if field.str().chars().any(|c| !c.is_ascii_digit()) {
        return Ok(false);
    }

    if let chrono::LocalResult::Single(_) = chrono::Utc.timestamp_opt(field.i64(), 0) {
        return Ok(true);
    }

    Ok(false)
}

pub fn boolean_true(_request: &Request, field: Value) -> Result<bool, CustomError> {
    if field.kind() != gjson::Kind::True && field.kind() != gjson::Kind::False {
        return Err(CustomError::Error(format!("field is not a boolean: {}", field)));
    }

    Ok(field.bool())
}

pub fn boolean_false(_request: &Request, field: Value) -> Result<bool, CustomError> {
    if field.kind() != gjson::Kind::False && field.kind() != gjson::Kind::True{
        return Err(CustomError::Error(format!("field is not a boolean: {}", field)));
    }

    Ok(!field.bool())
}

// This is an all inclusive check - it'll return true if field is an empty string,
// empty array or is null.
pub fn is_empty(_request: &Request, field: Value) -> Result<bool, CustomError> {
    match field.kind() {
        // Null field
        gjson::Kind::Null => Ok(true),
        // Maybe it's an array with 0 elements
        gjson::Kind::Array => Ok(field.array().len() == 0),
        // Maybe an empty string?
        gjson::Kind::String => Ok(field.to_string().len() == 0),
        _ => Ok(false),
    }
}

pub fn has_field(request: &Request, _field: Value) -> Result<bool, CustomError> {
    let data_as_str = str::from_utf8(request.data)
        .map_err(|e| CustomError::Error(format!("unable to convert bytes to string: {}", e)))?;

    Ok(gjson::get(data_as_str, request.path.as_str()).exists())
}

pub fn is_type(request: &Request, field: Value) -> Result<bool, CustomError> {
    if request.args.len() != 1 {
        return Err(CustomError::Error(
            "is_type requires exactly 1 argument".to_string(),
        ));
    }

    match request.args[0].as_str() {
        "string" => Ok(field.kind() == gjson::Kind::String),
        "number" => Ok(field.kind() == gjson::Kind::Number),
        "boolean" => Ok(field.kind() == gjson::Kind::True || field.kind() == gjson::Kind::False),
        "bool" => Ok(field.kind() == gjson::Kind::True || field.kind() == gjson::Kind::False),
        "array" => Ok(field.kind() == gjson::Kind::Array),
        "object" => Ok(field.kind() == gjson::Kind::Object),
        "null" => Ok(field.kind() == gjson::Kind::Null),
        _ => Err(CustomError::MatchError(format!(
            "unknown type: {}",
            request.args[0]
        ))),
    }
}

pub fn regex(request: &Request, field: Value) -> Result<bool, CustomError> {
    if request.args.len() != 1 {
        return Err(CustomError::Error(
            "regex requires exactly 1 argument".to_string(),
        ));
    }

    let re_pattern = request.args[0].as_str();
    let re = Regex::new(re_pattern)?;

    Ok(re.is_match(field.str()))
}

pub fn url(_request: &Request, field: Value) -> Result<bool, CustomError> {
    Url::parse(field.str()).map_or(Ok(false), |_| Ok(true))
}

pub fn string_length(request: &Request, f: Value) -> Result<bool, CustomError> {
    let mut required_args = 1;

    if request.match_type == DetectiveType::DETECTIVE_TYPE_STRING_LENGTH_RANGE {
        required_args = 2;
    }

    if request.args.len() != required_args {
        return Err(CustomError::Error(format!(
            "string length requires {} arg(s)",
            required_args
        )));
    }

    let field = f.str();
    let arg1: f64 = parse_number(&request.args[0])?;

    match request.match_type {
        DetectiveType::DETECTIVE_TYPE_STRING_LENGTH_MIN => Ok(field.len() >= arg1 as usize),
        DetectiveType::DETECTIVE_TYPE_STRING_LENGTH_MAX => Ok(field.len() <= arg1 as usize),
        DetectiveType::DETECTIVE_TYPE_STRING_LENGTH_RANGE => {
            let arg2: f64 = parse_number(&request.args[1])?;
            Ok(field.len() >= arg1 as usize && field.len() <= arg2 as usize)
        }
        _ => Err(CustomError::Error(format!(
            "unknown match type: {:?}",
            request.match_type
        ))),
    }
}

pub fn hostname(_request: &Request, field: Value) -> Result<bool, CustomError> {
    fn is_valid_char(byte: u8) -> bool {
        byte.is_ascii_lowercase()
            || byte.is_ascii_uppercase()
            || byte.is_ascii_digit()
            || byte == b'-'
            || byte == b'.'
    }

    let hostname = field.str();

    // From: https://github.com/pop-os/hostname-validator/blob/master/src/lib.rs
    Ok(!(hostname.bytes().any(|byte| !is_valid_char(byte))
        || hostname.split('.').any(|label| {
            label.is_empty() || label.len() > 63 || label.starts_with('-') || label.ends_with('-')
        })
        || hostname.is_empty()
        || hostname.len() > 253))
}

pub fn semver(_request: &Request, field: Value) -> Result<bool, CustomError> {
    semver::Version::parse(field.str()).map_or(Ok(false), |_| Ok(true))
}
