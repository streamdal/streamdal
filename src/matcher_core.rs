use crate::detective;
use crate::error::CustomError;
use chrono::TimeZone;

use gjson::Value;
use protos::detective::{DetectiveStep, DetectiveType};
use regex::Regex;
use std::str;

pub fn string_equal_to(request: &DetectiveStep) -> Result<bool, CustomError> {
    if request.args.len() != 1 {
        return Err(CustomError::Error(
            "string_equal_to requires exactly 1 argument".to_string(),
        ));
    }

    let field: String = detective::parse_field(&request.input, &request.path)?;

    Ok(field == request.args[0])
}

pub fn string_contains_any(request: &DetectiveStep) -> Result<bool, CustomError> {
    if request.args.is_empty() {
        return Err(CustomError::Error(
            "string_contains_any requires at least 1 argument".to_string(),
        ));
    }

    let field: String = detective::parse_field(&request.input, &request.path)?;

    for arg in &request.args {
        if field.contains(arg) {
            return Ok(true);
        }
    }

    Ok(false)
}

pub fn string_contains_all(request: &DetectiveStep) -> Result<bool, CustomError> {
    if request.args.is_empty() {
        return Err(CustomError::Error(
            "string_contains_any requires at least 1 argument".to_string(),
        ));
    }

    let field: String = detective::parse_field(&request.input, &request.path)?;

    for arg in &request.args {
        if !field.contains(arg) {
            return Ok(false);
        }
    }

    Ok(true)
}

pub fn ip_address(request: &DetectiveStep) -> Result<bool, CustomError> {
    let field: String = detective::parse_field(&request.input, &request.path)?;

    match request.type_.enum_value().unwrap() {
        DetectiveType::DETECTIVE_TYPE_IPV4_ADDRESS => {
            let re = Regex::new(
                r"(?:\b25[0-5]|\b2[0-4][0-9]|\b[01]?[0-9][0-9]?)(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}",
            )?;

            Ok(re.is_match(field.as_str()))
        }
        DetectiveType::DETECTIVE_TYPE_IPV6_ADDRESS => {
            let re = Regex::new(
                r"(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))",
            )?;

            Ok(re.is_match(field.as_str()))
        }
        _ => Err(CustomError::MatchError(
            "unknown ip address match type".to_string(),
        )),
    }
}

pub fn mac_address(request: &DetectiveStep) -> Result<bool, CustomError> {
    let field: String = detective::parse_field(&request.input, &request.path)?;

    let re = Regex::new(r"^(?:[0-9A-Fa-f]{2}[:-]){5}(?:[0-9A-Fa-f]{2})$")?;

    Ok(re.is_match(field.as_str()))
}

pub fn uuid(request: &DetectiveStep) -> Result<bool, CustomError> {
    let field: String = detective::parse_field(&request.input, &request.path)?;
    let re = Regex::new(
        r"^[a-fA-F0-9]{8}[:\-]?[a-fA-F0-9]{4}[:\-]?[a-fA-F0-9]{4}[:\-]?[a-fA-F0-9]{4}[:\-]?[a-fA-F0-9]{12}$",
    )?;

    Ok(re.is_match(field.as_str()))
}

pub fn timestamp_rfc3339(request: &DetectiveStep) -> Result<bool, CustomError> {
    let field: String = detective::parse_field(&request.input, &request.path)?;

    Ok(chrono::DateTime::parse_from_rfc3339(field.as_str()).is_ok())
}

pub fn timestamp_unix_nano(request: &DetectiveStep) -> Result<bool, CustomError> {
    let field: String = detective::parse_field(&request.input, &request.path)?;

    if let Ok(ts) = field.parse::<i64>() {
        if let chrono::LocalResult::Single(_) = chrono::Utc.timestamp_opt(ts / 1_000_000_000, 0) {
            return Ok(true);
        }
    }

    Ok(false)
}

pub fn timestamp_unix(request: &DetectiveStep) -> Result<bool, CustomError> {
    let field: String = detective::parse_field(&request.input, &request.path)?;

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

pub fn boolean(request: &DetectiveStep, expected: bool) -> Result<bool, CustomError> {
    let field: bool = detective::parse_field(&request.input, &request.path)?;

    Ok(field == expected)
}

// This is an all inclusive check - it'll return true if field is an empty string,
// empty array or is null.
pub fn is_empty(request: &DetectiveStep) -> Result<bool, CustomError> {
    let field: Value = detective::parse_field(&request.input, &request.path)?;

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

pub fn has_field(request: &DetectiveStep) -> Result<bool, CustomError> {
    let data_as_str = str::from_utf8(&request.input)
        .map_err(|e| CustomError::Error(format!("unable to convert bytes to string: {}", e)))?;

    Ok(gjson::get(data_as_str, &request.path).exists())
}

pub fn is_type(request: &DetectiveStep) -> Result<bool, CustomError> {
    if request.args.len() != 1 {
        return Err(CustomError::Error(
            "is_type requires exactly 1 argument".to_string(),
        ));
    }

    let field: Value = detective::parse_field(&request.input, &request.path)?;

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

pub fn regex(request: &DetectiveStep) -> Result<bool, CustomError> {
    if request.args.len() != 1 {
        return Err(CustomError::Error(
            "regex requires exactly 1 argument".to_string(),
        ));
    }

    let re_pattern = request.args[0].as_str();
    let field: String = detective::parse_field(&request.input, &request.path)?;
    let re = Regex::new(re_pattern)?;

    Ok(re.is_match(field.as_str()))
}
