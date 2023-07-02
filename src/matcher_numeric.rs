use crate::error::CustomError;
use protos::matcher::{MatchRequest, MatchType};

pub fn common(request: &MatchRequest) -> Result<bool, CustomError> {
    if request.args.len() != 1 {
        return Err(CustomError::Error(
            "numeric match must have exactly one arg".to_string(),
        ));
    }

    let field: f64 = crate::detective::parse_field(&request.data, &request.path)?;
    let arg = parse_number(&request.args[0])?;

    let result = match request.type_.enum_value().unwrap() {
        MatchType::MATCH_TYPE_NUMERIC_EQUAL_TO => field == arg,
        MatchType::MATCH_TYPE_NUMERIC_GREATER_THAN => field > arg,
        MatchType::MATCH_TYPE_NUMERIC_GREATER_EQUAL => field >= arg,
        MatchType::MATCH_TYPE_NUMERIC_LESS_THAN => field < arg,
        MatchType::MATCH_TYPE_NUMERIC_LESS_EQUAL => field <= arg,

        _ => {
            return Err(CustomError::MatchError(
                "unknown numeric match type".to_string(),
            ))
        }
    };

    if request.negate {
        return Ok(!result);
    }

    Ok(result)
}

fn parse_number(input: &str) -> Result<f64, CustomError> {
    match input.parse() {
        Ok(number) => Ok(number),
        Err(err) => Err(CustomError::Error(format!(
            "failed to parse number: {}",
            err
        ))),
    }
}
