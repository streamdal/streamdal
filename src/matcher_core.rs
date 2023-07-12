use crate::detective;
use crate::error::CustomError;
use chrono::TimeZone;

use crate::detective::{parse_number, Request};
use gjson::Value;
use protos::detective::DetectiveType;
use regex::Regex;
use std::net::IpAddr;
use std::str;
use std::str::FromStr;
use url::Url;

pub fn string_equal_to(request: &Request) -> Result<bool, CustomError> {
    if request.args.len() != 1 {
        return Err(CustomError::Error(
            "string_equal_to requires exactly 1 argument".to_string(),
        ));
    }

    let field: String = detective::parse_field(request.data, &request.path)?;

    Ok(field == request.args[0])
}

pub fn string_contains_any(request: &Request) -> Result<bool, CustomError> {
    if request.args.is_empty() {
        return Err(CustomError::Error(
            "string_contains_any requires at least 1 argument".to_string(),
        ));
    }

    let field: String = detective::parse_field(request.data, &request.path)?;

    for arg in &request.args {
        if field.contains(arg) {
            return Ok(true);
        }
    }

    Ok(false)
}

pub fn string_contains_all(request: &Request) -> Result<bool, CustomError> {
    if request.args.is_empty() {
        return Err(CustomError::Error(
            "string_contains_any requires at least 1 argument".to_string(),
        ));
    }

    let field: String = detective::parse_field(request.data, &request.path)?;

    for arg in &request.args {
        if !field.contains(arg) {
            return Ok(false);
        }
    }

    Ok(true)
}

pub fn ip_address(request: &Request) -> Result<bool, CustomError> {
    let field: String = detective::parse_field(request.data, &request.path)?;

    match request.match_type {
        DetectiveType::DETECTIVE_TYPE_IPV4_ADDRESS => {
            IpAddr::from_str(field.as_str()).map_or(Ok(false), |i| Ok(i.is_ipv4()))
        }
        DetectiveType::DETECTIVE_TYPE_IPV6_ADDRESS => {
            IpAddr::from_str(field.as_str()).map_or(Ok(false), |i| Ok(i.is_ipv6()))
        }
        _ => Err(CustomError::MatchError(
            "unknown ip address match type".to_string(),
        )),
    }
}

pub fn mac_address(request: &Request) -> Result<bool, CustomError> {
    let field: String = detective::parse_field(request.data, &request.path)?;

    let re = Regex::new(r"^(?:[0-9A-Fa-f]{2}[:-]){5}(?:[0-9A-Fa-f]{2})$")?;

    Ok(re.is_match(field.as_str()))
}

pub fn uuid(request: &Request) -> Result<bool, CustomError> {
    let field: String = detective::parse_field(request.data, &request.path)?;
    let re = Regex::new(
        r"^[a-fA-F0-9]{8}[:\-]?[a-fA-F0-9]{4}[:\-]?[a-fA-F0-9]{4}[:\-]?[a-fA-F0-9]{4}[:\-]?[a-fA-F0-9]{12}$",
    )?;

    Ok(re.is_match(field.as_str()))
}

pub fn timestamp_rfc3339(request: &Request) -> Result<bool, CustomError> {
    let field: String = detective::parse_field(request.data, &request.path)?;

    Ok(chrono::DateTime::parse_from_rfc3339(field.as_str()).is_ok())
}

pub fn timestamp_unix_nano(request: &Request) -> Result<bool, CustomError> {
    let field: String = detective::parse_field(request.data, &request.path)?;

    if let Ok(ts) = field.parse::<i64>() {
        if let chrono::LocalResult::Single(_) = chrono::Utc.timestamp_opt(ts / 1_000_000_000, 0) {
            return Ok(true);
        }
    }

    Ok(false)
}

pub fn timestamp_unix(request: &Request) -> Result<bool, CustomError> {
    let field: String = detective::parse_field(request.data, &request.path)?;

    let ts: i64 = match field.parse() {
        Ok(v) => {
            println!("Parsed timestamp: {}", v);
            v
        }
        Err(_) => {
            println!("Failed to parse timestamp: {}", field);
            return Ok(false);
        }
    };

    if let chrono::LocalResult::Single(_) = chrono::Utc.timestamp_opt(ts, 0) {
        return Ok(true);
    }

    Ok(false)
}

pub fn boolean(request: &Request, expected: bool) -> Result<bool, CustomError> {
    let field: bool = detective::parse_field(request.data, &request.path)?;

    Ok(field == expected)
}

// This is an all inclusive check - it'll return true if field is an empty string,
// empty array or is null.
pub fn is_empty(request: &Request) -> Result<bool, CustomError> {
    let field: Value = detective::parse_field(request.data, &request.path)?;

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

pub fn has_field(request: &Request) -> Result<bool, CustomError> {
    let data_as_str = str::from_utf8(request.data)
        .map_err(|e| CustomError::Error(format!("unable to convert bytes to string: {}", e)))?;

    Ok(gjson::get(data_as_str, request.path.as_str()).exists())
}

pub fn is_type(request: &Request) -> Result<bool, CustomError> {
    if request.args.len() != 1 {
        return Err(CustomError::Error(
            "is_type requires exactly 1 argument".to_string(),
        ));
    }

    let field: Value = detective::parse_field(request.data, &request.path)?;

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

pub fn regex(request: &Request) -> Result<bool, CustomError> {
    if request.args.len() != 1 {
        return Err(CustomError::Error(
            "regex requires exactly 1 argument".to_string(),
        ));
    }

    let re_pattern = request.args[0].as_str();
    let field: String = detective::parse_field(request.data, &request.path)?;
    let re = Regex::new(re_pattern)?;

    Ok(re.is_match(field.as_str()))
}

pub fn url(request: &Request) -> Result<bool, CustomError> {
    let field: String = detective::parse_field(request.data, &request.path)?;
    Url::parse(field.as_str()).map_or(Ok(false), |_| Ok(true))
}

pub fn string_length(request: &Request) -> Result<bool, CustomError> {
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

    let field: String = detective::parse_field(request.data, &request.path)?;
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

pub fn hostname(request: &Request) -> Result<bool, CustomError> {
    fn is_valid_char(byte: u8) -> bool {
        (b'a'..=b'z').contains(&byte)
            || (b'A'..=b'Z').contains(&byte)
            || (b'0'..=b'9').contains(&byte)
            || byte == b'-'
            || byte == b'.'
    }

    let field: String = detective::parse_field(request.data, &request.path)?;
    let hostname = field.as_str();

    // From: https://github.com/pop-os/hostname-validator/blob/master/src/lib.rs
    Ok(!(hostname.bytes().any(|byte| !is_valid_char(byte))
        || hostname.split('.').any(|label| {
            label.is_empty() || label.len() > 63 || label.starts_with('-') || label.ends_with('-')
        })
        || hostname.is_empty()
        || hostname.len() > 253))
}

pub fn semver(request: &Request) -> Result<bool, CustomError> {
    let field: String = detective::parse_field(request.data, &request.path)?;
    semver::Version::parse(field.as_str()).map_or(Ok(false), |_| Ok(true))
}
