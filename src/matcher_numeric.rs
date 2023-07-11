use crate::error::CustomError;
use protos::detective::DetectiveType;

pub fn common(
    match_type: DetectiveType,
    data: &Vec<u8>,
    path: &String,
    args: &Vec<String>,
    negate: bool,
) -> Result<bool, CustomError> {
    if args.len() != 1 {
        return Err(CustomError::Error(
            "numeric match must have exactly one arg".to_string(),
        ));
    }

    let field: f64 = crate::detective::parse_field(data, path)?;
    let arg = parse_number(&args[0])?;

    let result = match match_type {
        DetectiveType::DETECTIVE_TYPE_NUMERIC_EQUAL_TO => field == arg,
        DetectiveType::DETECTIVE_TYPE_NUMERIC_GREATER_THAN => field > arg,
        DetectiveType::DETECTIVE_TYPE_NUMERIC_GREATER_EQUAL => field >= arg,
        DetectiveType::DETECTIVE_TYPE_NUMERIC_LESS_THAN => field < arg,
        DetectiveType::DETECTIVE_TYPE_NUMERIC_LESS_EQUAL => field <= arg,

        _ => {
            return Err(CustomError::MatchError(
                "unknown numeric match type".to_string(),
            ))
        }
    };

    if negate {
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
