use crate::error::CustomError;
use crate::error::CustomError::{Error, MatchError};
use chrono::TimeZone;
use protos::matcher::MatchRequest;
use regex::Regex;
use std::str;

pub fn string_equal_to(request: &MatchRequest) -> Result<bool, CustomError> {
    if request.args.len() != 1 {
        return Err(Error(
            "string_equal_to requires exactly 1 argument".to_string(),
        ));
    }

    let field = crate::detective::parse_field(&request.data, &request.path)?.to_string();

    Ok(field == request.args[0])
}

pub fn string_contains_any(request: &MatchRequest) -> Result<bool, CustomError> {
    if request.args.is_empty() {
        return Err(Error(
            "string_contains_any requires at least 1 argument".to_string(),
        ));
    }

    let field = crate::detective::parse_field(&request.data, &request.path)?.to_string();

    for arg in &request.args {
        if field.contains(arg) {
            return Ok(true);
        }
    }

    Ok(false)
}

pub fn string_contains_all(request: &MatchRequest) -> Result<bool, CustomError> {
    if request.args.is_empty() {
        return Err(Error(
            "string_contains_any requires at least 1 argument".to_string(),
        ));
    }

    let field = crate::detective::parse_field(&request.data, &request.path)?.to_string();

    for arg in &request.args {
        if !field.contains(arg) {
            return Ok(false);
        }
    }

    Ok(true)
}

pub fn ip_address(request: &MatchRequest) -> Result<bool, CustomError> {
    let field = crate::detective::parse_field(&request.data, &request.path)?.to_string();

    match request.type_.enum_value().unwrap() {
        protos::matcher::MatchType::MATCH_TYPE_IPV4_ADDRESS => {
            let re = Regex::new(
                r"(?:\b25[0-5]|\b2[0-4][0-9]|\b[01]?[0-9][0-9]?)(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}",
            )?;

            Ok(re.is_match(field.as_str()))
        }
        protos::matcher::MatchType::MATCH_TYPE_IPV6_ADDRESS => {
            let re = Regex::new(
                r"(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))",
            )?;

            Ok(re.is_match(field.as_str()))
        }
        _ => Err(MatchError("unknown ip address match type".to_string())),
    }
}

pub fn mac_address(request: &MatchRequest) -> Result<bool, CustomError> {
    let field = crate::detective::parse_field(&request.data, &request.path)?.to_string();

    let re = Regex::new(r"^(?:[0-9A-Fa-f]{2}[:-]){5}(?:[0-9A-Fa-f]{2})$")?;

    Ok(re.is_match(field.as_str()))
}

pub fn uuid(request: &MatchRequest) -> Result<bool, CustomError> {
    let field = crate::detective::parse_field(&request.data, &request.path)?.to_string();
    let re = Regex::new(
        r"^[a-fA-F0-9]{8}[:\-]?[a-fA-F0-9]{4}[:\-]?[a-fA-F0-9]{4}[:\-]?[a-fA-F0-9]{4}[:\-]?[a-fA-F0-9]{12}$",
    )?;

    Ok(re.is_match(field.as_str()))
}

pub fn timestamp_rfc3339(request: &MatchRequest) -> Result<bool, CustomError> {
    let field = crate::detective::parse_field(&request.data, &request.path)?.to_string();

    Ok(chrono::DateTime::parse_from_rfc3339(field.as_str()).is_ok())
}

pub fn timestamp_unix_nano(request: &MatchRequest) -> Result<bool, CustomError> {
    let field = crate::detective::parse_field(&request.data, &request.path)?.to_string();

    if let Ok(ts) = field.parse::<i64>() {
        if let chrono::LocalResult::Single(_) = chrono::Utc.timestamp_opt(ts / 1_000_000_000, 0) {
            return Ok(true);
        }
    }

    Ok(false)
}

pub fn timestamp_unix(request: &MatchRequest) -> Result<bool, CustomError> {
    let field = crate::detective::parse_field(&request.data, &request.path)?.to_string();

    let ts: i64 = match field.parse() {
        Ok(ts) => ts,
        Err(_) => return Ok(false),
    };

    if let chrono::LocalResult::Single(_) = chrono::Utc.timestamp_opt(ts, 0) {
        return Ok(true);
    }

    Ok(false)
}

pub fn boolean(request: &MatchRequest, expected: bool) -> Result<bool, CustomError> {
    let field = crate::detective::parse_field(&request.data, &request.path)?;

    if let Some(b) = field.as_bool() {
        return Ok(b == expected);
    }

    Ok(false)
}

// This is an all inclusive check - it'll return true if field is an empty string,
// empty array or is null.
pub fn is_empty(request: &MatchRequest) -> Result<bool, CustomError> {
    let field = crate::detective::parse_field(&request.data, &request.path)?;

    // If the field is null
    if field.is_null() {
        return Ok(true);
    }

    // Maybe it's an array with 0 elements
    if field.is_array() {
        if let Some(arr) = field.as_vec() {
            if arr.len() != 0 {
                return Ok(false);
            }
        }
    }

    // Maybe it's a string
    if field.is_string() {
        if let Some(s) = field.as_str() {
            if s.len() != 0 {
                return Ok(false);
            }
        }
    }

    Ok(true)
}

pub fn has_field(request: &MatchRequest) -> Result<bool, CustomError> {
    let data_as_str = match str::from_utf8(&request.data) {
        Ok(v) => v,
        Err(e) => return Err(Error(format!("unable to convert bytes to string: {}", e))),
    };

    Ok(ajson::get(data_as_str, &request.path)?.is_some()) // TODO: handle unwrap
}

pub fn is_type(request: &MatchRequest) -> Result<bool, CustomError> {
    if request.args.len() != 1 {
        return Err(Error(format!("is_type requires exactly 1 argument")));
    }

    let field = crate::detective::parse_field(&request.data, &request.path)?;

    match request.args[0].as_str() {
        "string" => Ok(field.is_string()),
        "number" => Ok(field.is_number()),
        "boolean" => Ok(field.is_bool()),
        "bool" => Ok(field.is_bool()),
        "array" => Ok(field.is_array()),
        "object" => Ok(field.is_object()),
        "null" => Ok(field.is_null()),
        _ => Err(MatchError(format!("unknown type: {}", request.args[0]))),
    }
}

pub fn regex(request: &MatchRequest) -> Result<bool, CustomError> {
    if request.args.len() != 1 {
        return Err(Error(format!("regex requires exactly 1 argument")));
    }

    let re_pattern = request.args[0].as_str();
    let field = crate::detective::parse_field(&request.data, &request.path)?.to_string();

    // TODO: This can be just a ? soon
    let re = match Regex::new(re_pattern) {
        Ok(re) => re,
        Err(err) => return Err(Error(format!("failed to compile regex: {}", err))),
    };

    Ok(re.is_match(field.as_str()))
}
