use log::debug;
use protos::matcher::MatchType::MATCH_TYPE_UNKNOWN;
use protos::matcher::{MatchRequest, MatchType};

pub struct Detective {}

pub fn usage() {
    println!("Usage: snitch_detective");
}

impl Detective {
    pub fn new() -> Self {
        env_logger::init();

        Detective {}
    }

    // Value can be int, float, string, bool
    pub fn matches(&self, request: &MatchRequest) -> Result<bool, String> {
        validate_match_request(request)?;

        match request.type_.enum_value() {
            Ok(MatchType::MATCH_TYPE_NUMERIC_EQUAL_TO)
            | Ok(MatchType::MATCH_TYPE_NUMERIC_GREATER_EQUAL)
            | Ok(MatchType::MATCH_TYPE_NUMERIC_GREATER_THAN)
            | Ok(MatchType::MATCH_TYPE_NUMERIC_LESS_EQUAL)
            | Ok(MatchType::MATCH_TYPE_NUMERIC_LESS_THAN) => {
                debug!("matched numeric");
                return self.match_numeric(request);
            }
            Ok(_) => {
                debug!("matched string");
                return self.match_string(request);
            }
            Err(_) => {
                return Err(format!(
                    "Error: Unexpected match request type: {:#?}",
                    request.type_
                ))
            }
        }
    }

    fn match_string(&self, request: &MatchRequest) -> Result<bool, String> {
        Err(format!("not implemented"))
    }

    fn match_numeric(&self, request: &MatchRequest) -> Result<bool, String> {
        Err(format!("not implemented"))
    }
}

fn validate_match_request(request: &MatchRequest) -> Result<(), String> {
    match request.type_.enum_value() {
        Ok(value) => {
            if value == MATCH_TYPE_UNKNOWN {
                return Err("Match type cannot be unknown".to_string());
            }
        }
        Err(_) => {
            return Err("Match type cannot be an error".to_string());
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
