use protos::matcher::{MatchRequest, MatchType};

pub fn common(request: &MatchRequest) -> Result<bool, String> {
    if request.args.len() != 1 {
        return Err(format!("numeric match must have exactly one arg"));
    }

    let field = match crate::detective::parse_field(&request.data, &request.path)?.as_f64() {
        Some(f) => f,
        None => Err(format!("field is not a number (f64)"))?,
    };

    let arg = parse_number(&request.args[0])?;
    let result;

    match request.type_.enum_value().unwrap() {
        MatchType::MATCH_TYPE_NUMERIC_EQUAL_TO => result = field == arg,
        MatchType::MATCH_TYPE_NUMERIC_GREATER_THAN => result = field > arg,
        MatchType::MATCH_TYPE_NUMERIC_GREATER_EQUAL => result = field >= arg,
        MatchType::MATCH_TYPE_NUMERIC_LESS_THAN => result = field < arg,
        MatchType::MATCH_TYPE_NUMERIC_LESS_EQUAL => result = field <= arg,

        _ => return Err(format!("unknown numeric match type")),
    }

    if request.negate {
        return Ok(!result);
    }

    return Ok(result);
}

fn parse_number(input: &String) -> Result<f64, String> {
    match input.parse() {
        Ok(number) => Ok(number),
        Err(err) => Err(format!("input is not a number")),
    }
}
