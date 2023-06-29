use lazy_static::lazy_static;
use protos::matcher::MatchRequest;
use std::str;

// lazy_static! {
//     static ref UUID_REGEX: HashMap<u32, &'static str> = {
//         let mut m = HashMap::new();
//         m.insert(0, "foo");
//         m.insert(1, "bar");
//         m.insert(2, "baz");
//         m
//     };
// }

pub fn string_equal_to(request: &MatchRequest) -> Result<bool, String> {
    if request.args.len() != 1 {
        return Err(format!("string_equal_to requires exactly 1 argument"));
    }

    let field = crate::detective::parse_field(&request.data, &request.path)?.to_string();

    Ok(field == request.args[0])
}

pub fn string_contains_any(request: &MatchRequest) -> Result<bool, String> {
    if request.args.len() < 1 {
        return Err(format!("string_contains_any requires at least 1 argument"));
    }

    let field = crate::detective::parse_field(&request.data, &request.path)?.to_string();

    for arg in &request.args {
        if field.contains(arg) {
            return Ok(true);
        }
    }

    Ok(false)
}

pub fn string_contains_all(request: &MatchRequest) -> Result<bool, String> {
    if request.args.len() < 1 {
        return Err(format!("string_contains_any requires at least 1 argument"));
    }

    let field = crate::detective::parse_field(&request.data, &request.path)?.to_string();

    for arg in &request.args {
        if !field.contains(arg) {
            return Ok(false);
        }
    }

    Ok(true)
}

pub fn ipv4_address(request: &MatchRequest) -> Result<bool, String> {
    Err(format!("not implemented"))
}

pub fn ipv6_address(request: &MatchRequest) -> Result<bool, String> {
    Err(format!("not implemented"))
}

pub fn mac_address(request: &MatchRequest) -> Result<bool, String> {
    Err(format!("not implemented"))
}

pub fn uuid(request: &MatchRequest) -> Result<bool, String> {
    Err(format!("not implemented"))
}

pub fn timestamp_rfc3339(request: &MatchRequest) -> Result<bool, String> {
    Err(format!("not implemented"))
}

pub fn timestamp_unix_nano(request: &MatchRequest) -> Result<bool, String> {
    Err(format!("not implemented"))
}

pub fn timestamp_unix(request: &MatchRequest) -> Result<bool, String> {
    Err(format!("not implemented"))
}

pub fn is_boolean(request: &MatchRequest) -> Result<bool, String> {
    Err(format!("not implemented"))
}

// This is an all inclusive check - it'll return true if field is an empty string,
// empty array or is null.
pub fn is_empty(request: &MatchRequest) -> Result<bool, String> {
    let field = crate::detective::parse_field(&request.data, &request.path)?;

    // If the field is null
    if field.is_null() {
        return Ok(true);
    }

    // Maybe it's an array with 0 elements
    if field.is_array() {
        if let Some(arr) = field.as_vec() {
            println!("arr.len(): {}", arr.len());

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

pub fn has_field(request: &MatchRequest) -> Result<bool, String> {
    let data_as_str = match str::from_utf8(&request.data) {
        Ok(v) => v,
        Err(e) => return Err(format!("unable to convert bytes to string: {}", e)),
    };

    Ok(ajson::get(data_as_str, &request.path).unwrap().is_some()) // TODO: handle unwrap
}

pub fn is_type(request: &MatchRequest) -> Result<bool, String> {
    if request.args.len() != 1 {
        return Err(format!("is_type requires exactly 1 argument"));
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
        _ => Err(format!("unknown type: {}", request.args[0])),
    }
}

// There is a perf hit every time we run this func because we have to compile
// the pattern every time. It will improve when the SDK's have K/V support so
// we can cache compiled patterns in mem.
pub fn regex(request: &MatchRequest) -> Result<bool, String> {
    Err(format!("not implemented"))
}
