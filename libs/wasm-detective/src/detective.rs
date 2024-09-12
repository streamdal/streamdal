use std::collections::{HashMap, VecDeque};
use std::default::Default;
use std::str;

use any_ascii::any_ascii;
use protos::sp_pipeline::PipelineDataFormat;
use protos::sp_pipeline::PipelineDataFormat::PIPELINE_DATA_FORMAT_JSON;
use protos::sp_steps_detective::{DetectiveStepResultMatch, DetectiveType, DetectiveTypePIIKeywordMode};
use streamdal_gjson as gjson;
use unicode_segmentation::UnicodeSegmentation;

use crate::error::CustomError;
use crate::keywords::config::get_keywords;
use crate::keywords::scanner::{Field, FieldPII};
use crate::matcher_core as core;
use crate::matcher_core::{ip_address, mac_address};
use crate::matcher_numeric as numeric;
use crate::matcher_pii as pii;
use crate::matcher_pii::{canada_sin, email, hashed_password, jwt, ssn, uk_nino, vin_number};
use crate::matcher_pii_cloud as pii_cloud;
use crate::matcher_pii_cloud::aws_key_id;
use crate::matcher_pii_keywords as pii_keywords;
use crate::matcher_pii_payments as pii_payments;
use crate::matcher_pii_payments::credit_card;
use crate::matcher_pii_phone::phone;

type MatcherFunc = fn(&Request, gjson::Value) -> Result<bool, CustomError>;

pub struct Detective {}

// Commented out as wizer is breaking wasm ~MG 2024-06-13
// pub static mut PHONE_NUMBER_REGEX: Option<Regex> = None;
// pub const PHONE_NUMBER_REGEX_STR: &str = r"^\s*(?:\+?(\d{1,3}))?([ -.(]*(\d{3})[-. )]*)?((\d{3})[ -.]*(\d{3,6})(?:[ -.x]*(\d+))?)\s*$";

// This is a special function used by the 'wizer' pre-initializer utility.
//
// After building the wasm binary, we run the 'wizer' tool against the binary
// which will call on this function and write the result into a new wasm binary.
//
// The result is that we are able to avoid a heavy CPU hit for operations like
// compiling regexes on every new request to detective.
//
// https://github.com/bytecodealliance/wizer
// #[export_name = "wizer.initialize"]
// pub fn init() {
//     unsafe {
//         // +919367788755    <- match
//         // 8989829304       <- match
//         // +16308520397     <- match
//         // 786-307-3615     <- match
//         // +44.787644-2401  <- match
//         // +447876442401    <- match
//         // 407.865.2052     <- match
//         // 407-865-2052     <- match
//         // 407 865 2052     <- match
//         // +1 407 123 1231  <- match
//         // (407) 865 2052   <- match
//         // +372 512 3456    <- match (Estonia)
//         // 011 372 512 3456 <- match (Estonia dial out from US)
//         // 1                <- no match
//         // 12               <- no match
//         // 123              <- no match
//         // 1234             <- no match
//         // 12345            <- no match
//         // 123456           <- no match
//         // 1234567          <- match
//         // 12345678         <- match
//         // 123456789        <- match
//         // 1234567890       <- match
//         // 12345678901      <- match
//         // 1-1-1            <- no match
//         // +982             <- no match
//         PHONE_NUMBER_REGEX = Some(Regex::new(PHONE_NUMBER_REGEX_STR).unwrap());
//     }
// }

#[derive(Clone)]
pub struct Request<'a> {
    pub match_type: DetectiveType,
    pub data: &'a Vec<u8>,
    pub path: String,
    pub args: Vec<String>,
    pub negate: bool,
    pub mode: DetectiveTypePIIKeywordMode,
    pub data_format: PipelineDataFormat,
}

#[derive(Debug)]
pub struct EmbeddedJSON {
    pub start_char: i32,
    pub end_char: i32,
    pub cleaned_json: String,
    pub escaped_data: String,
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

        if request.match_type == DetectiveType::DETECTIVE_TYPE_PII_PLAINTEXT_ANY {
            return self.matches_plaintext(request);
        }

        if !request.path.is_empty() {
            // Matching on path value
            self.matches_path(request)
        } else {
            // Matching on any field in the payload
            self.matches_payload(request)
        }
    }

    pub fn matches_plaintext(&self, request: &Request) -> Result<Vec<DetectiveStepResultMatch>, CustomError> {
        let data_as_str = str::from_utf8(request.data)
            .map_err(|e| CustomError::Error(format!("unable to convert bytes to string: {}", e)))?;

        let normalized = any_ascii(data_as_str);

        Ok(self.plaintext(request, normalized.as_str()))
    }

    pub fn matches_keyword(request: &Request) -> Result<Vec<DetectiveStepResultMatch>, CustomError> {
        let data_as_str = str::from_utf8(request.data)
            .map_err(|e| CustomError::Error(format!("unable to convert bytes to string: {}", e)))?;

        let kw = get_keywords();
        let mut scanner = FieldPII::new(kw);
        let results = scanner.scan(data_as_str, request.mode);

        Ok(Self::matches_keyword_results(results))
    }

    /// Recurse through results of the keyword matcher and return Vec<DetectiveStepResultMatch>
    /// This is needed to keep the output from the keyword matcher verbose for future needs,
    /// but flatten things, so we can use them in an InterStepResult message
    fn matches_keyword_results(results: Vec<Field>) -> Vec<DetectiveStepResultMatch> {
        let mut isr: Vec<DetectiveStepResultMatch> = Vec::<DetectiveStepResultMatch>::new();

        for field in results {
            // Add any PII matches from this field
            for pii_match in field.pii_matches {
                let result = DetectiveStepResultMatch {
                    type_: ::protobuf::EnumOrUnknown::new(DetectiveType::DETECTIVE_TYPE_PII_KEYWORD),
                    path: pii_match.path.clone(),
                    value: pii_match.value.into_bytes(),
                    pii_type: pii_match.entity.clone(),
                    ..Default::default()
                };

                isr.push(result)
            }

            isr.append(&mut Self::matches_keyword_results(field.children));
        }

        isr
    }

    pub fn matches_payload(
        &self,
        request: &Request,
    ) -> Result<Vec<DetectiveStepResultMatch>, CustomError> {
        if request.match_type == DetectiveType::DETECTIVE_TYPE_PII_KEYWORD {
            // Recurse through keyword results
            return Self::matches_keyword(request)
        }


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
                            ..Default::default()
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
                            ..Default::default()
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
                        ..Default::default()
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
            DetectiveType::DETECTIVE_TYPE_PII_CREDIT_CARD => pii_payments::credit_card,
            DetectiveType::DETECTIVE_TYPE_PII_SSN => pii::ssn,
            DetectiveType::DETECTIVE_TYPE_PII_EMAIL => pii::email,
            DetectiveType::DETECTIVE_TYPE_PII_PHONE => phone,
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
            DetectiveType::DETECTIVE_TYPE_PII_AWS_KEY_ID => pii_cloud::aws_key_id,
            DetectiveType::DETECTIVE_TYPE_PII_GITHUB_PAT => pii_cloud::github_pat,
            DetectiveType::DETECTIVE_TYPE_PII_SLACK_TOKEN => pii_cloud::slack_token,
            DetectiveType::DETECTIVE_TYPE_PII_STRIPE_KEY => pii_payments::stripe_key,
            DetectiveType::DETECTIVE_TYPE_PII_RSA_KEY => pii::rsa_key,
            DetectiveType::DETECTIVE_TYPE_PII_TITLE => pii::title,
            DetectiveType::DETECTIVE_TYPE_PII_RELIGION => pii::religion,
            DetectiveType::DETECTIVE_TYPE_PII_IBAN => pii_payments::iban,
            DetectiveType::DETECTIVE_TYPE_PII_SWIFT_BIC => pii_payments::swift_bic,
            DetectiveType::DETECTIVE_TYPE_PII_BANK_ROUTING_NUMBER => pii_payments::usa_bank_routing_number,
            DetectiveType::DETECTIVE_TYPE_PII_CRYPTO_ADDRESS => pii_payments::crypto_currency_address,
            DetectiveType::DETECTIVE_TYPE_PII_BRAINTREE_ACCESS_TOKEN => pii_cloud::braintree_access_token,
            DetectiveType::DETECTIVE_TYPE_PII_AWS_MWS_AUTH_TOKEN => pii_cloud::aws_mws_token,
            DetectiveType::DETECTIVE_TYPE_PII_DATABRICKS_PAT => pii_cloud::databricks_pat,
            DetectiveType::DETECTIVE_TYPE_PII_SENDGRID_KEY => pii_cloud::sendgrid_api_key,
            DetectiveType::DETECTIVE_TYPE_PII_JWT => pii::jwt,
            DetectiveType::DETECTIVE_TYPE_PII_DOCKER_SWARM_TOKEN => pii_cloud::docker_swarm_token,
            DetectiveType::DETECTIVE_TYPE_PII_BEARER_TOKEN => pii::bearer_token,
            DetectiveType::DETECTIVE_TYPE_PII_AZURE_SQL_CONN_STRING => pii_cloud::azure_sql_connection_string,
            DetectiveType::DETECTIVE_TYPE_PII_KEYWORD => pii_keywords::keywords,
            DetectiveType::DETECTIVE_TYPE_PII_PLAINTEXT_ANY => todo!(), // skipped on purpose
            DetectiveType::DETECTIVE_TYPE_UK_INSURANCE_NUMBER => pii::uk_nino,
            DetectiveType::DETECTIVE_TYPE_CANADA_SIN => pii::canada_sin,
            DetectiveType::DETECTIVE_TYPE_UNKNOWN => {
                return Err(CustomError::Error(
                    "match type cannot be unknown".to_string(),
                ));
            }
        };

        Ok(f)
    }

    pub fn plaintext(&self, request: &Request, input: &str) -> Vec<DetectiveStepResultMatch> {
        let mut res = Vec::<DetectiveStepResultMatch>::new();

        //let mut string_input = input.to_string();

        // Get any embedded json
        // TODO: extract all of this out to it's own function
        let embedded_jsons = self.get_embedded_json(input);
        if !embedded_jsons.is_empty() {

            // We have embedded JSON, loop through each and run keyword matcher on it
            for embedded_json in embedded_jsons {
                let req = Request {
                    match_type: DetectiveType::DETECTIVE_TYPE_PII_KEYWORD,
                    data: &embedded_json.cleaned_json.as_bytes().to_owned(),
                    path: "".to_string(),
                    args: Vec::new(),
                    negate: false,
                    mode: request.mode,
                    data_format: PIPELINE_DATA_FORMAT_JSON,
                };

                // TODO: Scrapping this for now. I don't think it's worth it since we can
                // TODO: deduplicate the results at the end. ~MG 2024-06-05
                // Remove the embedded JSON from input so that plaintext matcher
                // won't also run on it causing duplicate results. This is perfectly fine
                // since we're not returning the original input
               //  let replacement = "|".repeat(embedded_json.data.len());
               //
               //  // Replace the embedded JSON with a placeholder
               //  string_input = string_input[..embedded_json.start_char as usize].to_string() + replacement.as_str() + &string_input[embedded_json.end_char as usize..].to_string();
               // // string_input = string_input.replace(&embedded_json.data, replacement.as_str());

                match Self::matches_keyword(&req) {
                    Ok(matches) => {
                        if !matches.is_empty() {
                            // The start/end of each match here will be as if it was only
                            // the JSON string. However since we're parsing JSON out of a plaintext
                            // string, we must find where the JSON string starts in the plaintext
                            // and add that offset to the char_index_start and char_index_end
                            for m in matches {
                                let mut corrected = m.clone();

                                // Search for the actual position of the data using the value
                                // We need to do this because we need the location inside the escaped string json
                                // However the keyword search gets performed on unescaped json, so it's start/end
                                // index will be different from where we actually need to find the data in the
                                // escaped string json.
                                let v = String::from_utf8(m.value.clone()).unwrap();
                                let actual_start = &embedded_json.escaped_data.find(v.as_str());
                                if actual_start.is_none() {
                                    // This shouldn't happen, but if it does, just skip this match
                                    // so that we don't mask the incorrect location.
                                    continue;
                                }

                                corrected.char_index_start = actual_start.unwrap() as i32 + embedded_json.start_char;
                                corrected.char_index_end = actual_start.unwrap() as i32 + m.value.len() as i32 + embedded_json.start_char;
                                res.push(corrected);
                            }
                        }
                    }
                    _ => {
                        // Purposefully ignoring any errors here
                    }
                }

            }
        }

        let cleaned = input.replace('\"', " ");

        let sentences = cleaned.split_sentence_bound_indices();

        let scanners = HashMap::from([
            (email as MatcherFunc, "Person"),
            (aws_key_id as MatcherFunc, "AWS"),
            (jwt as MatcherFunc, "JWT"),
            (ssn as MatcherFunc, "Person"),
            (uk_nino as MatcherFunc, "Person"),
            (vin_number as MatcherFunc, "Vehicle_Information"),
            (canada_sin as MatcherFunc, "Person"),
            (credit_card as MatcherFunc, "Billing"),
            (phone as MatcherFunc, "Person"),
            (hashed_password as MatcherFunc, "Credentials"),
            (mac_address as MatcherFunc, "Device"),
            (ip_address as MatcherFunc, "IP_Information"),
        ]);

        let mut found: Vec<Word> = Vec::new();

        for (sentence_start, sentence) in sentences {
            // Trim junk off the end. This won't affect offsets because
            // it's at the end of a sentence
            let new_sentence = sentence.trim_end_matches(['.', ' ']).to_string();
            // Parse sentences into words
            let words = new_sentence.split_word_bound_indices();

            // The splitter lib considers these word bounds, but we don't want to
            // split on them since they might be inside an email, ipv6, macaddr, etc.
            let no_split: HashMap<char, usize> = HashMap::from([('@', 0), (':', 0)]);

            // Ignore these characters so that we can properly find PII inside JSON that is inside a plaintext string
            let ignore_chars = HashMap::from([('"', 0), ('{', 0), ('}', 0), ('\'', 0), ('║', 0), ('\\', 0), (',', 0)]);

            // This is our word-part accumulator and is used to
            // combine "user", "@", "somedomain.com" words into a single word
            let mut accum: Vec<Word> = Vec::new();

            for (word_start, word) in words {

                // Some characters cause the word to be nothing but spaces for some reason
                // Trip the word, and if it's empty, we've reached the end
                let tmp_word = word.trim();
                if tmp_word.is_empty() {
                    // Loop over accumulator and join the string value of each word
                    // and push it to the found vector
                    let combined = accumulate_parts(&mut accum);
                    found.push(combined);
                    accum.clear();
                    continue
                }

                if tmp_word.len() == 1 && ignore_chars.contains_key(&tmp_word.chars().next().unwrap()) {
                    continue;
                }

                // We've reached the end of a word, combine our accumulator into a single Word struct
                if word == " " {
                    // Loop over accumulator and join the string value of each word
                    // and push it to the found vector
                    let combined = accumulate_parts(&mut accum);
                    found.push(combined);
                    accum.clear();
                    continue
                }

                // Push the word the splitter has seen to the accumulator
                accum.push(Word {
                    char_index_start: sentence_start + word_start,
                    char_index_end: sentence_start + word_start + word.chars().count(),
                    word: word.to_string(),
                });

                // If the word is a character we don't want to split on, continue to the next word
                if no_split.contains_key(&word.chars().next().unwrap()) {
                    continue;
                }
            }

            // We might have hit the end of a sentence in the loop above but not triggered the
            // summation of the accumulator. Check if it's empty and if not, combine it into a single word
            if !accum.is_empty() {
                let combined = accumulate_parts(&mut accum);
                found.push(combined);
                accum.clear();
            }
        }


        'words: for found_word in found {
            for (scanner_fn, scanner_name) in &scanners {
                let payload = format!("{{\"key\": \"{}\"}}", found_word.word);
                if let Ok(found) = scanner_fn(request, gjson::parse(&payload).get("key")) {
                    if found {
                        let result = DetectiveStepResultMatch {
                            type_: ::protobuf::EnumOrUnknown::new(DetectiveType::DETECTIVE_TYPE_PII_PLAINTEXT_ANY),
                            path: "".to_string(),
                            value: found_word.word.clone().into_bytes(),
                            pii_type: scanner_name.to_string(),
                            char_index_start: found_word.char_index_start as i32,
                            char_index_end: found_word.char_index_end as i32,
                            ..Default::default()
                        };

                        res.push(result);
                        continue 'words;
                    }
                }
            }
        }

        // Deduplicate results
        res.sort_by(|a, b| a.char_index_start.cmp(&b.char_index_start));
        res.dedup_by(|a, b| a.char_index_start == b.char_index_start && a.char_index_end == b.char_index_end);

        res
    }

    pub fn get_embedded_json(&self, input: &str) -> VecDeque<EmbeddedJSON> {
        let mut bracket_stack = VecDeque::new();
        let mut json_strings: VecDeque<EmbeddedJSON> = VecDeque::new();

        // Loop through chars and find every opening or closing bracket
        for (i, c) in input.char_indices() {
            match c {
                '{' => {
                    // Found opening bracket, record its char index on the stack
                    bracket_stack.push_back(i);
                },
                '}' => {
                    // Grab the closes start index from the queue
                    let start = match bracket_stack.pop_back() {
                        Some(start) => start,
                        None => continue, // No start bracket, continue processing string
                    };

                    // Rename to end for clarity
                    let end = i;

                    // Shouldn't happen, but prevent panics just in case
                    // TODO: do we still need the +1?
                    if end <= start || end+1 > input.len() {
                        continue;
                    }

                    // Grab the possible match from the input string
                    // TODO: change to inclusive ..=?
                    let possible_match = &input[start..end+1];

                    // Unescape quotes in possible_match
                    let possible_match_cleaned = possible_match.trim().replace("\\\"", "\"");

                    // Our current match is not valid JSON, ignore it
                    if !streamdal_gjson::valid(&possible_match_cleaned) {
                        continue;
                    }

                    // We have valid JSON at this point

                    // Wwe may have matched a smaller JSON sub-object already
                    // For example, when processing the following string:
                    //     {"level-1a": {"level-2a": "value"}, "level-1b": {"level-2b": "value"}}
                    // the ending bracket of the level-2a object will be matched first and pushed onto
                    // the results queue. On a subsequent loop iteration, we'll hit the ending bracket
                    // of the level-1a object. We should check the most recent result to see if its start
                    // and end indicies are within the bounds of the current match.
                    // If they are, we should discard the previous level2 match and then push the
                    // entire level1 object onto the queue.
                    while let Some(prev_obj) = json_strings.back() {
                        if prev_obj.start_char > start as i32 && prev_obj.end_char < end as i32 {
                            // Previous match is a sub-object of the current match
                            // Discard the previous match from the queue since we'll push the newer
                            // parent match onto the queue
                            json_strings.pop_back();
                        } else {
                            break;
                        }
                    }

                    // Put our result onto the queue
                    json_strings.push_back(EmbeddedJSON {
                        start_char: start as i32,
                        end_char: end as i32,
                        cleaned_json: possible_match_cleaned.to_string(),
                        escaped_data: possible_match.to_string(),
                    });
                },
                _ => {}
            }
        }

        json_strings
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
                        ..Default::default()
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
            let mut idx = 0;
            val.each(|_, value| {
                let mut cur_path = path.clone();
                cur_path.push(idx.to_string());
                let matches = recurse_field(request, value, f, cur_path.clone());
                if !matches.is_empty() {
                    res.extend(matches);
                }

                idx += 1;

                true
            });

            return res;
        }
        _ => {} // Don't care about nulls
    }

    res
}

#[derive(Default, Clone,Debug)]
pub struct Word {
    char_index_start: usize,
    char_index_end: usize,
    word: String,
}



fn accumulate_parts(accum: &mut [Word]) -> Word {
    let mut combined = Word {
        ..Default::default()
    };


    for (idx, part) in accum.iter().enumerate() {
        if idx == 0 {
            combined.char_index_start = part.char_index_start;
        }

        combined.char_index_end = part.char_index_end;
        combined.word.push_str(part.word.as_str());
    }

    combined
}
