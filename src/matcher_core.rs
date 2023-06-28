use protos::matcher::MatchRequest;

pub fn string_equal_to(request: &MatchRequest, field: &String) -> Result<bool, String> {
    Err(format!("Not implemented"))
}

pub fn string_contains_any(request: &MatchRequest, field: &String) -> Result<bool, String> {
    Err(format!("Not implemented"))
}

pub fn string_contains_all(request: &MatchRequest, field: &String) -> Result<bool, String> {
    Err(format!("Not implemented"))
}

pub fn ip_address(request: &MatchRequest, field: &String) -> Result<bool, String> {
    Err(format!("Not implemented"))
}

pub fn timestamp_rfc3339(request: &MatchRequest, field: &String) -> Result<bool, String> {
    Err(format!("Not implemented"))
}

pub fn timestamp_unix_nano(request: &MatchRequest, field: &String) -> Result<bool, String> {
    Err(format!("Not implemented"))
}

pub fn timestamp_unix(request: &MatchRequest, field: &String) -> Result<bool, String> {
    Err(format!("Not implemented"))
}

pub fn is_boolean(request: &MatchRequest, field: &String) -> Result<bool, String> {
    Err(format!("Not implemented"))
}

pub fn is_empty(request: &MatchRequest, field: &String) -> Result<bool, String> {
    Err(format!("Not implemented"))
}

pub fn has_field(request: &MatchRequest, field: &String) -> Result<bool, String> {
    Err(format!("Not implemented"))
}

pub fn is_type(request: &MatchRequest, field: &String) -> Result<bool, String> {
    Err(format!("Not implemented"))
}
