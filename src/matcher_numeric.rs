use protos::matcher::{MatchRequest, MatchType};

pub fn common(request: &MatchRequest) -> Result<bool, String> {
    if request.args.len() != 1 {
        return Err(format!("numeric match must have exactly one arg"));
    }

    let field = crate::detective::parse_field(&request.data, &request.path)?;
    let parsed_number = parse_number(&field)?;
    let arg = parse_number(&request.args[0])?;
    let result;

    match request.type_.enum_value().unwrap() {
        MatchType::MATCH_TYPE_NUMERIC_EQUAL_TO => result = parsed_number == arg,
        MatchType::MATCH_TYPE_NUMERIC_GREATER_THAN => result = parsed_number > arg,
        MatchType::MATCH_TYPE_NUMERIC_GREATER_EQUAL => result = parsed_number >= arg,
        MatchType::MATCH_TYPE_NUMERIC_LESS_THAN => result = parsed_number < arg,
        MatchType::MATCH_TYPE_NUMERIC_LESS_EQUAL => result = parsed_number <= arg,

        _ => return Err(format!("unknown numeric match type")),
    }

    if request.negate {
        return Ok(!result);
    }

    return Ok(result);
}

fn parse_number(field: &String) -> Result<f64, String> {
    match field.parse() {
        Ok(number) => Ok(number),
        Err(err) => Err(format!("field is not a number")),
    }
}
