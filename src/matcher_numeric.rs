use crate::error::CustomError;
use crate::error::CustomError::{Error, MatchError};
use protos::matcher::{MatchRequest, MatchType};

pub fn common(request: &MatchRequest) -> Result<bool, CustomError> {
    if request.args.len() != 1 {
        return Err(Error("numeric match must have exactly one arg".to_string()));
    }

    // TODO: This can be simplified with ?
    let field = match crate::detective::parse_field(&request.data, &request.path)?.as_f64() {
        Some(f) => f,
        None => return Err(Error("field is not a number (f64)".to_string())),
    };

    let arg = parse_number(&request.args[0])?;

    let result = match request.type_.enum_value().unwrap() {
        MatchType::MATCH_TYPE_NUMERIC_EQUAL_TO => field == arg,
        MatchType::MATCH_TYPE_NUMERIC_GREATER_THAN => field > arg,
        MatchType::MATCH_TYPE_NUMERIC_GREATER_EQUAL => field >= arg,
        MatchType::MATCH_TYPE_NUMERIC_LESS_THAN => field < arg,
        MatchType::MATCH_TYPE_NUMERIC_LESS_EQUAL => field <= arg,

        _ => return Err(MatchError("unknown numeric match type".to_string())),
    };

    if request.negate {
        return Ok(!result);
    }

    Ok(result)
}

fn parse_number(input: &String) -> Result<f64, CustomError> {
    match input.parse() {
        Ok(number) => Ok(number),
        Err(err) => Err(Error(format!("failed to parse number: {}", err))),
    }
}
