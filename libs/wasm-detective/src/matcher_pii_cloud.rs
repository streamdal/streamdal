use crate::detective::Request;
use crate::error::CustomError;
use streamdal_gjson::Value;

// https://awsteele.com/blog/2020/09/26/aws-access-key-format.html
const AWS_PREFIXES: [&str; 12] = [
    "ABIA", "ACCA", "AGPA", "AIDA", "AIPA", "AKIA", "ANPA", "ANVA", "APKA", "AROA", "ASCA", "ASIA",
];

const SLACK_TOKEN_PREFIXES: [&str; 4] = ["xapp-", "xoxa-", "xoxb-", "xoxp-"];

pub fn aws_key_id(_request: &Request, field: Value) -> Result<bool, CustomError> {
    let val: String = field.str().to_uppercase().chars().collect();

    if val.len() != 20 {
        return Ok(false);
    }

    for prefix in AWS_PREFIXES.iter() {
        if val.starts_with(prefix) {
            return Ok(true);
        }
    }

    Ok(false)
}

pub fn slack_token(_request: &Request, field: Value) -> Result<bool, CustomError> {
    let val: String = field.str().trim().to_lowercase();

    for prefix in SLACK_TOKEN_PREFIXES.iter() {
        if val.starts_with(prefix) {
            return Ok(true);
        }
    }

    Ok(false)
}

pub fn stripe_key(_request: &Request, field: Value) -> Result<bool, CustomError> {
    let val: String = field.str().to_lowercase();

    let valid = val.starts_with("pk_") && val.len() == 32;

    Ok(valid)
}

pub fn github_pat(_request: &Request, field: Value) -> Result<bool, CustomError> {
    let val: String = field.str().to_lowercase();

    let valid = val.starts_with("ghp_") && val.len() == 40;

    Ok(valid)
}
