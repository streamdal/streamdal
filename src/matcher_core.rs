use protos::matcher::MatchRequest;

pub fn string_equal_to(request: &MatchRequest) -> Result<bool, String> {
    if request.args.len() != 1 {
        return Err(format!("string_equal_to requires exactly 1 argument"));
    }

    let field = crate::detective::parse_field(&request.data, &request.path)?;

    Ok(field == request.args[0])
}

pub fn string_contains_any(request: &MatchRequest) -> Result<bool, String> {
    if request.args.len() < 1 {
        return Err(format!("string_contains_any requires at least 1 argument"));
    }

    let field = crate::detective::parse_field(&request.data, &request.path)?;

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

    let field = crate::detective::parse_field(&request.data, &request.path)?;

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

pub fn is_empty(request: &MatchRequest) -> Result<bool, String> {
    Err(format!("not implemented"))
}

pub fn has_field(request: &MatchRequest) -> Result<bool, String> {
    Err(format!("not implemented"))
}

pub fn is_type(request: &MatchRequest) -> Result<bool, String> {
    Err(format!("not implemented"))
}

// There is a perf hit every time we run this func because we have to compile
// the pattern every time. It will improve when the SDK's have K/V support so
// we can cache compiled patterns in mem.
pub fn regex(request: &MatchRequest) -> Result<bool, String> {
    Err(format!("not implemented"))
}
