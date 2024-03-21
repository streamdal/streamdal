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

pub fn aws_mws_token(_request: &Request, field: Value) -> Result<bool, CustomError> {
    return Ok(field.str().to_lowercase().starts_with("amzn.mws."))
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

    let old_format = val.len() == 40 && val.starts_with("ghp_");
    if old_format {
        return Ok(true);
    }

    let new_format = val.len() == 78 && val.starts_with("github_pat_");
    Ok(new_format)
}

pub fn braintree_access_token(_request: &Request, field: Value) -> Result<bool, CustomError> {
    let val: String = field.str().to_lowercase();

    let valid = val.starts_with("access_token$");
    Ok(valid)
}

pub fn docker_swarm_token(_request: &Request, field: Value) -> Result<bool, CustomError> {
    let val: String = field.str().to_uppercase();

    // If val starts with SWMTKN- or SWMKEY-, it's a Docker Swarm token
    let valid = val.starts_with("SWMTKN-") || val.starts_with("SWMKEY-");
    Ok(valid)
}

pub fn databricks_pat(_request: &Request, field: Value) -> Result<bool, CustomError> {
    let val: String = field.str().to_lowercase();

    let valid = val.len() == 40 && val.starts_with("dapi");
    Ok(valid)
}

pub fn sendgrid_api_key(_request: &Request, field: Value) -> Result<bool, CustomError> {
    let val: String = field.str().to_lowercase();

    let valid = val.len() == 69 && val.starts_with("sg.");
    Ok(valid)
}

pub fn stripe_secret_key(_request: &Request, field: Value) -> Result<bool, CustomError> {
    let val: String = field.str().to_lowercase();

    let valid = val.len() == 32 && val.starts_with("sk_");
    Ok(valid)
}

pub fn azure_sql_connection_string(_request: &Request, field: Value) -> Result<bool, CustomError> {
    let val: String = field.str().trim().to_lowercase();

    let valid = val.starts_with("server=")
        && val.contains("user id=")
        && val.contains("password=");

    Ok(valid)
}