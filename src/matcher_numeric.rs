use crate::detective::parse_number;
use crate::detective::Request;
use crate::error::CustomError;
use protos::sp_steps_detective::DetectiveType;

pub fn common(request: &Request) -> Result<bool, CustomError> {
    let mut required_len = 1;

    if request.match_type == DetectiveType::DETECTIVE_TYPE_NUMERIC_RANGE {
        required_len = 2;
    }

    if request.args.len() != required_len {
        return Err(CustomError::Error(format!(
            "numeric match must have {} arg",
            required_len
        )));
    }

    let field: f64 = crate::detective::parse_field(request.data, &request.path)?;
    let arg1 = parse_number(&request.args[0])?;

    let result = match request.match_type {
        DetectiveType::DETECTIVE_TYPE_NUMERIC_EQUAL_TO => field == arg1,
        DetectiveType::DETECTIVE_TYPE_NUMERIC_GREATER_THAN
        | DetectiveType::DETECTIVE_TYPE_NUMERIC_MIN => field > arg1,
        DetectiveType::DETECTIVE_TYPE_NUMERIC_GREATER_EQUAL => field >= arg1,
        DetectiveType::DETECTIVE_TYPE_NUMERIC_LESS_THAN
        | DetectiveType::DETECTIVE_TYPE_NUMERIC_MAX => field < arg1,
        DetectiveType::DETECTIVE_TYPE_NUMERIC_LESS_EQUAL => field <= arg1,
        DetectiveType::DETECTIVE_TYPE_NUMERIC_RANGE => {
            let arg2 = parse_number(&request.args[1])?;

            field >= arg1 && field <= arg2
        }

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
