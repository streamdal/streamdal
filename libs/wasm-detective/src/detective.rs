use crate::error::CustomError;
use crate::matcher_core as core;
use crate::matcher_numeric as numeric;
use crate::matcher_pii as pii;

use protos::sp_steps_detective::{DetectiveStepResultMatch, DetectiveType};
use std::str;

type MatcherFunc = fn(&Request, gjson::Value) -> Result<bool, CustomError>;

pub struct Detective {}

#[derive(Clone)]
pub struct Request<'a> {
    pub match_type: DetectiveType,
    pub data: &'a Vec<u8>,
    pub path: String,
    pub args: Vec<String>,
    pub negate: bool,
}

impl Default for Detective {
    fn default() -> Self {
        Detective::new()
    }
}

impl Detective {
    pub fn new() -> Self {
        // env_logger::init();
        Detective {}
    }
    pub fn matches(&self, request: &Request) -> Result<Vec<DetectiveStepResultMatch>, CustomError> {
        validate_request(request)?;

        if !request.path.is_empty() {
            // Matching on path value
            self.matches_path(request)
        } else {
            // Matching on any field in the payload
            self.matches_payload(request)
        }
    }

    pub fn matches_payload(
        &self,
        request: &Request,
    ) -> Result<Vec<DetectiveStepResultMatch>, CustomError> {
        let data_as_str = str::from_utf8(request.data)
            .map_err(|e| CustomError::Error(format!("unable to convert bytes to string: {}", e)))?;

        let obj = gjson::parse(data_as_str);

        let mut res = Vec::<DetectiveStepResultMatch>::new();

        let f = Detective::get_matcher_func(request)?;

        obj.each(|key, value| {
            // Since we're recursing through the whole payload, we need to keep track of where we are
            // This value should be cloned for each recursive call.
            let cur_path = vec![key.to_string()];

            let matches = recurse_field(request, value, f, cur_path);
            if !matches.is_empty() {
                res.extend(matches);
            }

            true
        });

        Ok(res)
    }

    pub fn matches_path(
        &self,
        request: &Request,
    ) -> Result<Vec<DetectiveStepResultMatch>, CustomError> {
        // parse_field() will return an error if the path is not found
        // but for this single check, we don't want to error out
        let field: gjson::Value = if request.match_type == DetectiveType::DETECTIVE_TYPE_HAS_FIELD {
            gjson::Value::default()
        } else {
            parse_field(request.data, &request.path)?
        };

        let f = Detective::get_matcher_func(request)?;

        // Don't iterate over these types
        let ignore_array: Vec<DetectiveType> = vec![
            DetectiveType::DETECTIVE_TYPE_HAS_FIELD,
            DetectiveType::DETECTIVE_TYPE_IS_EMPTY,
            DetectiveType::DETECTIVE_TYPE_IS_TYPE,
        ];
        if ignore_array.contains(&request.match_type) {
            // Avoiding borrow, gjson::Value does not support cloning
            let v = gjson::parse(field.json());

            match f(request, v) {
                Ok(found) => {
                    if found {
                        let result = DetectiveStepResultMatch {
                            type_: ::protobuf::EnumOrUnknown::new(request.match_type),
                            path: request.path.clone(),
                            value: field.str().to_owned().into_bytes(),
                            special_fields: Default::default(),
                        };

                        return Ok(vec![result]);
                    }
                }
                Err(e) => return Err(e),
            }

            return Ok(Vec::new());
        }

        // We've received multiple results, probably from a wildcard query
        // so we need to iterate over each one and check if any of them match
        if field.kind() == gjson::Kind::Array {
            let mut results = Vec::<DetectiveStepResultMatch>::new();

            field.each(|_, value| {
                if let Ok(found) = f(request, value) {
                    if found {
                        let result = DetectiveStepResultMatch {
                            type_: ::protobuf::EnumOrUnknown::new(request.match_type),
                            path: request.path.clone(),
                            value: field.str().to_owned().into_bytes(),
                            special_fields: Default::default(),
                        };

                        results.push(result);

                        return false; // Don't need to iterate further
                    }
                }
                true
            });

            return Ok(results);
        }

        // Avoiding borrow, gjson::Value does not support cloning
        let v = gjson::parse(field.json());

        match f(request, v) {
            Ok(found) => {
                if found {
                    let result = DetectiveStepResultMatch {
                        type_: ::protobuf::EnumOrUnknown::new(request.match_type),
                        path: request.path.clone(),
                        value: field.str().to_owned().into_bytes(),
                        special_fields: Default::default(),
                    };

                    return Ok(vec![result]);
                }

                Ok(Vec::new())
            }
            Err(e) => Err(e),
        }
    }

    fn get_matcher_func(request: &Request) -> Result<MatcherFunc, CustomError> {
        let f: MatcherFunc = match request.match_type {
            DetectiveType::DETECTIVE_TYPE_NUMERIC_EQUAL_TO
            | DetectiveType::DETECTIVE_TYPE_NUMERIC_GREATER_EQUAL
            | DetectiveType::DETECTIVE_TYPE_NUMERIC_GREATER_THAN
            | DetectiveType::DETECTIVE_TYPE_NUMERIC_LESS_EQUAL
            | DetectiveType::DETECTIVE_TYPE_NUMERIC_LESS_THAN
            | DetectiveType::DETECTIVE_TYPE_NUMERIC_MIN
            | DetectiveType::DETECTIVE_TYPE_NUMERIC_MAX
            | DetectiveType::DETECTIVE_TYPE_NUMERIC_RANGE => numeric::common,

            // Core matchers
            DetectiveType::DETECTIVE_TYPE_STRING_EQUAL => core::string_equal_to,
            DetectiveType::DETECTIVE_TYPE_STRING_CONTAINS_ANY => core::string_contains_any,
            DetectiveType::DETECTIVE_TYPE_STRING_CONTAINS_ALL => core::string_contains_all,
            DetectiveType::DETECTIVE_TYPE_STRING_LENGTH_MIN
            | DetectiveType::DETECTIVE_TYPE_STRING_LENGTH_MAX
            | DetectiveType::DETECTIVE_TYPE_STRING_LENGTH_RANGE => core::string_length,
            DetectiveType::DETECTIVE_TYPE_IPV4_ADDRESS
            | DetectiveType::DETECTIVE_TYPE_IPV6_ADDRESS => core::ip_address,
            DetectiveType::DETECTIVE_TYPE_REGEX => core::regex,
            DetectiveType::DETECTIVE_TYPE_TIMESTAMP_RFC3339 => core::timestamp_rfc3339,
            DetectiveType::DETECTIVE_TYPE_TIMESTAMP_UNIX_NANO => core::timestamp_unix_nano,
            DetectiveType::DETECTIVE_TYPE_TIMESTAMP_UNIX => core::timestamp_unix,
            DetectiveType::DETECTIVE_TYPE_BOOLEAN_FALSE => core::boolean_false,
            DetectiveType::DETECTIVE_TYPE_BOOLEAN_TRUE => core::boolean_true,
            DetectiveType::DETECTIVE_TYPE_IS_EMPTY => core::is_empty,
            DetectiveType::DETECTIVE_TYPE_HAS_FIELD => core::has_field,
            DetectiveType::DETECTIVE_TYPE_IS_TYPE => core::is_type,
            DetectiveType::DETECTIVE_TYPE_UUID => core::uuid,
            DetectiveType::DETECTIVE_TYPE_MAC_ADDRESS => core::mac_address,
            DetectiveType::DETECTIVE_TYPE_URL => core::url,
            DetectiveType::DETECTIVE_TYPE_HOSTNAME => core::hostname,
            DetectiveType::DETECTIVE_TYPE_SEMVER => core::semver,

            // PII matchers
            DetectiveType::DETECTIVE_TYPE_PII_ANY => pii::any,
            DetectiveType::DETECTIVE_TYPE_PII_CREDIT_CARD => pii::credit_card,
            DetectiveType::DETECTIVE_TYPE_PII_SSN => pii::ssn,
            DetectiveType::DETECTIVE_TYPE_PII_EMAIL => pii::email,
            DetectiveType::DETECTIVE_TYPE_PII_PHONE => pii::phone,
            DetectiveType::DETECTIVE_TYPE_PII_DRIVER_LICENSE => pii::drivers_license,
            DetectiveType::DETECTIVE_TYPE_PII_PASSPORT_ID => pii::passport_id,
            DetectiveType::DETECTIVE_TYPE_PII_VIN_NUMBER => pii::vin_number,
            DetectiveType::DETECTIVE_TYPE_PII_SERIAL_NUMBER => pii::serial_number,
            DetectiveType::DETECTIVE_TYPE_PII_LOGIN => pii::login,
            DetectiveType::DETECTIVE_TYPE_PII_TAXPAYER_ID => pii::taxpayer_id,
            DetectiveType::DETECTIVE_TYPE_PII_ADDRESS => pii::address,
            DetectiveType::DETECTIVE_TYPE_PII_SIGNATURE => pii::signature,
            DetectiveType::DETECTIVE_TYPE_PII_GEOLOCATION => pii::geolocation,
            DetectiveType::DETECTIVE_TYPE_PII_EDUCATION => pii::education,
            DetectiveType::DETECTIVE_TYPE_PII_FINANCIAL => pii::financial,
            DetectiveType::DETECTIVE_TYPE_PII_HEALTH => pii::health,

            DetectiveType::DETECTIVE_TYPE_UNKNOWN => {
                return Err(CustomError::Error(
                    "match type cannot be unknown".to_string(),
                ))
            }
        };

        Ok(f)
    }
}

pub fn parse_field<'a>(data: &'a [u8], path: &'a String) -> Result<gjson::Value<'a>, CustomError> {
    let data_as_str = str::from_utf8(data)
        .map_err(|e| CustomError::Error(format!("unable to convert bytes to string: {}", e)))?;

    let v = gjson::get(data_as_str, path);

    if !v.exists() {
        return Err(CustomError::Error(format!(
            "path '{}' not found in data",
            path
        )));
    }

    Ok(v)
}

pub fn parse_number(input: &str) -> Result<f64, CustomError> {
    match input.parse() {
        Ok(number) => Ok(number),
        Err(err) => Err(CustomError::Error(format!(
            "failed to parse number: {}",
            err
        ))),
    }
}

fn validate_request(request: &Request) -> Result<(), CustomError> {
    if request.match_type == DetectiveType::DETECTIVE_TYPE_UNKNOWN {
        return Err(CustomError::MatchError(format!(
            "unknown match type: {:?}",
            request.match_type
        )));
    }

    if request.data.is_empty() {
        return Err(CustomError::Error("data cannot be empty".to_string()));
    }

    Ok(())
}
fn recurse_field(
    request: &Request,
    val: gjson::Value,
    f: MatcherFunc,
    path: Vec<String>,
) -> Vec<DetectiveStepResultMatch> {
    let mut res: Vec<DetectiveStepResultMatch> = Vec::new();

    match val.kind() {
        gjson::Kind::String | gjson::Kind::Number | gjson::Kind::True | gjson::Kind::False => {
            // Avoiding borrow, gjson::Value does not support cloning
            let v = gjson::parse(val.json());

            if let Ok(found) = f(request, v) {
                if found {
                    let result = DetectiveStepResultMatch {
                        type_: ::protobuf::EnumOrUnknown::new(request.match_type),
                        path: path.join("."),
                        value: val.str().to_owned().into_bytes(),
                        special_fields: Default::default(),
                    };

                    res.push(result);
                }
            }
        }

        gjson::Kind::Object => {
            val.each(|key, value| {
                let mut cur_path = path.clone();
                cur_path.push(key.to_string());

                let matches = recurse_field(request, value, f, cur_path.clone());
                if !matches.is_empty() {
                    res.extend(matches);
                }
                true
            });
        }
        gjson::Kind::Array => {
            let mut cur_path = path.clone();
            cur_path.push("#".to_string());

            val.each(|_, value| {
                let matches = recurse_field(request, value, f, cur_path.clone());
                if !matches.is_empty() {
                    res.extend(matches);
                }

                true
            });

            return res;
        }
        _ => {} // Don't care about nulls
    }

    res
}
