use protos::matcher::{MatchRequest, MatchType};

pub fn common(request: &MatchRequest, field: &String) -> Result<bool, String> {
    let field = parse_number(field)?;

    if request.args.len() != 1 {
        return Err(format!("numeric match must have exactly one arg"));
    }

    let arg = parse_number(&request.args[0])?;

    let result;

    match request.type_.enum_value().unwrap() {
        MatchType::MATCH_TYPE_NUMERIC_EQUAL_TO => result = field == arg,
        MatchType::MATCH_TYPE_NUMERIC_LESS_THAN => result = field < arg,
        MatchType::MATCH_TYPE_NUMERIC_GREATER_THAN => result = field > arg,
        MatchType::MATCH_TYPE_NUMERIC_LESS_EQUAL => result = field <= arg,
        MatchType::MATCH_TYPE_NUMERIC_GREATER_EQUAL => result = field >= arg,
        _ => return Err(format!("unknown numeric match type")),
    }

    if request.negate {
        return Ok(!result);
    }

    return Ok(result);
}

fn parse_number(field: &String) -> Result<f64, String> {
    println!("attempting to parse arg: {}", field);

    match field.parse() {
        Ok(number) => Ok(number),
        Err(err) => Err(format!("field is not a number")),
    }
}
