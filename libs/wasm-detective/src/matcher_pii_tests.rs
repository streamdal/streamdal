use crate::detective::{plaintext, Request};
#[cfg(test)]
extern crate test;
use protos::sp_steps_detective::DetectiveType;
use protos::sp_steps_detective::DetectiveTypePIIKeywordMode::{DETECTIVE_TYPE_PII_KEYWORD_MODE_ACCURACY, DETECTIVE_TYPE_PII_KEYWORD_MODE_PERFORMANCE, DETECTIVE_TYPE_PII_KEYWORD_MODE_UNSET};
use std::collections::HashMap;
use test::Bencher;
use protos::sp_pipeline::PipelineDataFormat::{PIPELINE_DATA_FORMAT_JSON, PIPELINE_DATA_FORMAT_PLAINTEXT};

#[test]
fn test_email() {
    let sample_json = &crate::test_utils::SAMPLE_JSON.as_bytes().to_vec();

    let test_cases = vec![
        // Equal
        crate::test_utils::TestCase {
            request: Request {
                match_type: DetectiveType::DETECTIVE_TYPE_PII_EMAIL,
                data: sample_json,
                path: "object.email_plain_valid".to_string(),
                args: vec![],
                negate: false,
                mode: DETECTIVE_TYPE_PII_KEYWORD_MODE_UNSET,
                data_format: PIPELINE_DATA_FORMAT_JSON,
            },
            expected_matches: 1,
            text: "equal email_plain_valid".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: Request {
                match_type: DetectiveType::DETECTIVE_TYPE_PII_EMAIL,
                data: sample_json,
                path: "object.email_plain_invalid".to_string(),
                args: vec![],
                negate: false,
                mode: DETECTIVE_TYPE_PII_KEYWORD_MODE_UNSET,
                data_format: PIPELINE_DATA_FORMAT_JSON,
            },
            expected_matches: 0,
            text: "equal email_plain_invalid".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: Request {
                match_type: DetectiveType::DETECTIVE_TYPE_PII_EMAIL,
                data: sample_json,
                path: "object.email_unicode_domain_valid".to_string(),
                args: vec![],
                negate: false,
                mode: DETECTIVE_TYPE_PII_KEYWORD_MODE_UNSET,
                data_format: PIPELINE_DATA_FORMAT_JSON,
            },
            expected_matches: 1,
            text: "equal email_unicode_domain_valid".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: Request {
                match_type: DetectiveType::DETECTIVE_TYPE_PII_EMAIL,
                data: sample_json,
                path: "object.email_unicode_domain_invalid".to_string(),
                args: vec![],
                negate: false,
                mode: DETECTIVE_TYPE_PII_KEYWORD_MODE_UNSET,
                data_format: PIPELINE_DATA_FORMAT_JSON,
            },
            expected_matches: 0,
            text: "equal email_unicode_domain_invalid".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: Request {
                match_type: DetectiveType::DETECTIVE_TYPE_PII_EMAIL,
                data: sample_json,
                path: "object.email_unicode_local_valid".to_string(),
                args: vec![],
                negate: false,
                mode: DETECTIVE_TYPE_PII_KEYWORD_MODE_UNSET,
                data_format: PIPELINE_DATA_FORMAT_JSON,
            },
            expected_matches: 1,
            text: "equal email_unicode_local_valid".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: Request {
                match_type: DetectiveType::DETECTIVE_TYPE_PII_EMAIL,
                data: sample_json,
                path: "object.email_unicode_local_invalid".to_string(),
                args: vec![],
                negate: false,
                mode: DETECTIVE_TYPE_PII_KEYWORD_MODE_UNSET,
                data_format: PIPELINE_DATA_FORMAT_JSON,
            },
            expected_matches: 0,
            text: "equal email_unicode_local_invalid".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: Request {
                match_type: DetectiveType::DETECTIVE_TYPE_PII_EMAIL,
                data: sample_json,
                path: "object.arrays.0.email".to_string(),
                args: vec![],
                negate: false,
                mode: DETECTIVE_TYPE_PII_KEYWORD_MODE_UNSET,
                data_format: PIPELINE_DATA_FORMAT_JSON,
            },
            expected_matches: 1,
            text: "handles objects inside arrays".to_string(),
            should_error: false,
        },
    ];

    crate::test_utils::run_tests(&test_cases);
}

#[test]
fn test_credit_card() {
    let sample_json = &crate::test_utils::SAMPLE_JSON.as_bytes().to_vec();

    let test_cases = vec![
        // Visa
        crate::test_utils::TestCase {
            request: Request {
                match_type: DetectiveType::DETECTIVE_TYPE_PII_CREDIT_CARD,
                data: sample_json,
                path: "object.credit_card.visa.valid".to_string(),
                args: vec![],
                negate: false,
                mode: DETECTIVE_TYPE_PII_KEYWORD_MODE_UNSET,
                data_format: PIPELINE_DATA_FORMAT_JSON,
            },
            expected_matches: 1,
            text: "equal credit_card.visa.valid".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: Request {
                match_type: DetectiveType::DETECTIVE_TYPE_PII_CREDIT_CARD,
                data: sample_json,
                path: "object.credit_card.visa.invalid".to_string(),
                args: vec![],
                negate: false,
                mode: DETECTIVE_TYPE_PII_KEYWORD_MODE_UNSET,
                data_format: PIPELINE_DATA_FORMAT_JSON,
            },
            expected_matches: 0,
            text: "equal credit_card.visa.invalid".to_string(),
            should_error: false,
        },
        // Mastercard
        crate::test_utils::TestCase {
            request: Request {
                match_type: DetectiveType::DETECTIVE_TYPE_PII_CREDIT_CARD,
                data: sample_json,
                path: "object.credit_card.mastercard.valid".to_string(),
                args: vec![],
                negate: false,
                mode: DETECTIVE_TYPE_PII_KEYWORD_MODE_UNSET,
                data_format: PIPELINE_DATA_FORMAT_JSON,
            },
            expected_matches: 1,
            text: "equal credit_card.mastercard.valid".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: Request {
                match_type: DetectiveType::DETECTIVE_TYPE_PII_CREDIT_CARD,
                data: sample_json,
                path: "object.credit_card.mastercard.invalid".to_string(),
                args: vec![],
                negate: false,
                mode: DETECTIVE_TYPE_PII_KEYWORD_MODE_UNSET,
                data_format: PIPELINE_DATA_FORMAT_JSON,
            },
            expected_matches: 0,
            text: "equal credit_card.mastercard.invalid".to_string(),
            should_error: false,
        },
        // Discover
        crate::test_utils::TestCase {
            request: Request {
                match_type: DetectiveType::DETECTIVE_TYPE_PII_CREDIT_CARD,
                data: sample_json,
                path: "object.credit_card.discover.valid".to_string(),
                args: vec![],
                negate: false,
                mode: DETECTIVE_TYPE_PII_KEYWORD_MODE_UNSET,
                data_format: PIPELINE_DATA_FORMAT_JSON,
            },
            expected_matches: 1,
            text: "equal credit_card.discover.valid".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: Request {
                match_type: DetectiveType::DETECTIVE_TYPE_PII_CREDIT_CARD,
                data: sample_json,
                path: "object.credit_card.discover.invalid".to_string(),
                args: vec![],
                negate: false,
                mode: DETECTIVE_TYPE_PII_KEYWORD_MODE_UNSET,
                data_format: PIPELINE_DATA_FORMAT_JSON,
            },
            expected_matches: 0,
            text: "equal credit_card.discover.invalid".to_string(),
            should_error: false,
        },
        // American Express
        crate::test_utils::TestCase {
            request: Request {
                match_type: DetectiveType::DETECTIVE_TYPE_PII_CREDIT_CARD,
                data: sample_json,
                path: "object.credit_card.amex.valid".to_string(),
                args: vec![],
                negate: false,
                mode: DETECTIVE_TYPE_PII_KEYWORD_MODE_UNSET,
                data_format: PIPELINE_DATA_FORMAT_JSON,
            },
            expected_matches: 1,
            text: "equal credit_card.amex.valid".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: Request {
                match_type: DetectiveType::DETECTIVE_TYPE_PII_CREDIT_CARD,
                data: sample_json,
                path: "object.credit_card.amex.invalid".to_string(),
                args: vec![],
                negate: false,
                mode: DETECTIVE_TYPE_PII_KEYWORD_MODE_UNSET,
                data_format: PIPELINE_DATA_FORMAT_JSON,
            },
            expected_matches: 0,
            text: "equal credit_card.amex.invalid".to_string(),
            should_error: false,
        },
        // Diners Club
        crate::test_utils::TestCase {
            request: Request {
                match_type: DetectiveType::DETECTIVE_TYPE_PII_CREDIT_CARD,
                data: sample_json,
                path: "object.credit_card.diners_club.valid".to_string(),
                args: vec![],
                negate: false,
                mode: DETECTIVE_TYPE_PII_KEYWORD_MODE_UNSET,
                data_format: PIPELINE_DATA_FORMAT_JSON,
            },
            expected_matches: 1,
            text: "equal credit_card.diners_club.valid".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: Request {
                match_type: DetectiveType::DETECTIVE_TYPE_PII_CREDIT_CARD,
                data: sample_json,
                path: "object.credit_card.diners_club.invalid".to_string(),
                args: vec![],
                negate: false,
                mode: DETECTIVE_TYPE_PII_KEYWORD_MODE_UNSET,
                data_format: PIPELINE_DATA_FORMAT_JSON,
            },
            expected_matches: 0,
            text: "equal credit_card.diners_club.invalid".to_string(),
            should_error: false,
        },
        // JCB
        crate::test_utils::TestCase {
            request: Request {
                match_type: DetectiveType::DETECTIVE_TYPE_PII_CREDIT_CARD,
                data: sample_json,
                path: "object.credit_card.jcb.valid".to_string(),
                args: vec![],
                negate: false,
                mode: DETECTIVE_TYPE_PII_KEYWORD_MODE_UNSET,
                data_format: PIPELINE_DATA_FORMAT_JSON,
            },
            expected_matches: 1,
            text: "equal credit_card.jcb.valid".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: Request {
                match_type: DetectiveType::DETECTIVE_TYPE_PII_CREDIT_CARD,
                data: sample_json,
                path: "object.credit_card.jcb.invalid".to_string(),
                args: vec![],
                negate: false,
                mode: DETECTIVE_TYPE_PII_KEYWORD_MODE_UNSET,
                data_format: PIPELINE_DATA_FORMAT_JSON,
            },
            expected_matches: 0,
            text: "equal credit_card.jcb.invalid".to_string(),
            should_error: false,
        },
        // False positive
        crate::test_utils::TestCase {
            request: Request {
                match_type: DetectiveType::DETECTIVE_TYPE_PII_CREDIT_CARD,
                data: sample_json,
                path: "object.credit_card.false_positive".to_string(),
                args: vec![],
                negate: false,
                mode: DETECTIVE_TYPE_PII_KEYWORD_MODE_UNSET,
                data_format: PIPELINE_DATA_FORMAT_JSON,
            },
            expected_matches: 0,
            text: "credit_card.false_positive should not match".to_string(),
            should_error: false,
        },
    ];

    crate::test_utils::run_tests(&test_cases);
}

#[test]
fn test_ssn() {
    let sample_json = &crate::test_utils::SAMPLE_JSON.as_bytes().to_vec();

    let test_cases = vec![
        // Visa
        crate::test_utils::TestCase {
            request: Request {
                match_type: DetectiveType::DETECTIVE_TYPE_PII_SSN,
                data: sample_json,
                path: "object.ssn_valid".to_string(),
                args: vec![],
                negate: false,
                mode: DETECTIVE_TYPE_PII_KEYWORD_MODE_UNSET,
                data_format: PIPELINE_DATA_FORMAT_JSON,
            },
            expected_matches: 1,
            text: "equal ssn_valid".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: Request {
                match_type: DetectiveType::DETECTIVE_TYPE_PII_SSN,
                data: sample_json,
                path: "object.ssn_invalid".to_string(),
                args: vec![],
                negate: false,
                mode: DETECTIVE_TYPE_PII_KEYWORD_MODE_UNSET,
                data_format: PIPELINE_DATA_FORMAT_JSON,
            },
            expected_matches: 0,
            text: "equal ssn_invalid".to_string(),
            should_error: false,
        },
    ];

    crate::test_utils::run_tests(&test_cases);
}

#[test]
fn test_uk_insurance_number() {
    let sample_json = &crate::test_utils::SAMPLE_JSON.as_bytes().to_vec();

    let test_cases = vec![
        crate::test_utils::TestCase {
            request: Request {
                match_type: DetectiveType::DETECTIVE_TYPE_UK_INSURANCE_NUMBER,
                data: sample_json,
                path: "uk.insurance_number".to_string(),
                args: vec![],
                negate: false,
                mode: DETECTIVE_TYPE_PII_KEYWORD_MODE_UNSET,
                data_format: PIPELINE_DATA_FORMAT_JSON,
            },
            expected_matches: 1,
            text: "equal uk.insurance_number".to_string(),
            should_error: false,
        },
    ];

    crate::test_utils::run_tests(&test_cases);
}

#[test]
fn test_canada_sin() {
    let sample_json = &crate::test_utils::SAMPLE_JSON.as_bytes().to_vec();

    let test_cases = vec![
        crate::test_utils::TestCase {
            request: Request {
                match_type: DetectiveType::DETECTIVE_TYPE_CANADA_SIN,
                data: sample_json,
                path: "ca.social_insurance_number".to_string(),
                args: vec![],
                negate: false,
                mode: DETECTIVE_TYPE_PII_KEYWORD_MODE_UNSET,
                data_format: PIPELINE_DATA_FORMAT_JSON,
            },
            expected_matches: 1,
            text: "equal ca.social_insurance_number".to_string(),
            should_error: false,
        },
    ];

    crate::test_utils::run_tests(&test_cases);
}

#[test]
fn test_payload_search() {
    let json_with_field = r#"{
        "object": {
            "ccnum": "378282246310005"
        }
    }"#
    .as_bytes()
    .to_vec();

    let json_without_field = r#"{
        "object": {
            "ccnum": "foo"
        }
    }"#
    .as_bytes()
    .to_vec();

    let test_cases = vec![
        crate::test_utils::TestCase {
            request: Request {
                match_type: DetectiveType::DETECTIVE_TYPE_PII_CREDIT_CARD,
                data: &json_with_field,
                path: "".to_string(),
                args: vec![],
                negate: false,
                mode: DETECTIVE_TYPE_PII_KEYWORD_MODE_UNSET,
                data_format: PIPELINE_DATA_FORMAT_JSON,
            },
            expected_matches: 1,
            text: "e".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: Request {
                match_type: DetectiveType::DETECTIVE_TYPE_PII_CREDIT_CARD,
                data: &json_without_field,
                path: "".to_string(),
                args: vec![],
                negate: false,
                mode: DETECTIVE_TYPE_PII_KEYWORD_MODE_UNSET,
                data_format: PIPELINE_DATA_FORMAT_JSON,
            },
            expected_matches: 0,
            text: "".to_string(),
            should_error: false,
        },
    ];

    crate::test_utils::run_tests(&test_cases);
}

#[test]
fn test_any() {
    let json_with_field = r#"{
        "object": {
            "email": "user1@streamdal.com"
        }
    }"#
    .as_bytes()
    .to_vec();

    let json_without_field = r#"{
        "object": {
            "email": "foo"
        }
    }"#
    .as_bytes()
    .to_vec();

    let test_cases = vec![
        crate::test_utils::TestCase {
            request: Request {
                match_type: DetectiveType::DETECTIVE_TYPE_PII_ANY,
                data: &json_with_field,
                path: "".to_string(),
                args: vec![],
                negate: false,
                mode: DETECTIVE_TYPE_PII_KEYWORD_MODE_UNSET,
                data_format: PIPELINE_DATA_FORMAT_JSON,
            },
            expected_matches: 1,
            text: "find PII in payload".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: Request {
                match_type: DetectiveType::DETECTIVE_TYPE_PII_ANY,
                data: &json_without_field,
                path: "".to_string(),
                args: vec![],
                negate: false,
                mode: DETECTIVE_TYPE_PII_KEYWORD_MODE_UNSET,
                data_format: PIPELINE_DATA_FORMAT_JSON,
            },
            expected_matches: 0,
            text: "don't find PII in payload".to_string(),
            should_error: false,
        },
    ];

    crate::test_utils::run_tests(&test_cases);
}



#[test]
fn test_phone() {
    let sample_json = &crate::test_utils::SAMPLE_JSON.as_bytes().to_vec();

    let test_cases = vec![
        crate::test_utils::TestCase {
            request: Request {
                match_type: DetectiveType::DETECTIVE_TYPE_PII_PHONE,
                data: sample_json,
                path: "personal.phone".to_string(),
                args: vec![],
                negate: false,
                mode: DETECTIVE_TYPE_PII_KEYWORD_MODE_UNSET,
                data_format: PIPELINE_DATA_FORMAT_JSON,
            },
            expected_matches: 1,
            text: "equal personal.phone".to_string(),
            should_error: false,
        }
    ];

    crate::test_utils::run_tests(&test_cases);

}

#[test]
fn test_religion() {
    let sample_json = &crate::test_utils::SAMPLE_JSON.as_bytes().to_vec();

    let test_cases = vec![
        crate::test_utils::TestCase {
            request: Request {
                match_type: DetectiveType::DETECTIVE_TYPE_PII_RELIGION,
                data: sample_json,
                path: "personal.religion".to_string(),
                args: vec![],
                negate: false,
                mode: DETECTIVE_TYPE_PII_KEYWORD_MODE_UNSET,
                data_format: PIPELINE_DATA_FORMAT_JSON,
            },
            expected_matches: 1,
            text: "equal personal.religion".to_string(),
            should_error: false,
        }
    ];

    crate::test_utils::run_tests(&test_cases);

}

#[test]
fn test_title() {
    let sample_json = &crate::test_utils::SAMPLE_JSON.as_bytes().to_vec();

    let test_cases = vec![
        crate::test_utils::TestCase {
            request: Request {
                match_type: DetectiveType::DETECTIVE_TYPE_PII_TITLE,
                data: sample_json,
                path: "personal.title".to_string(),
                args: vec![],
                negate: false,
                mode: DETECTIVE_TYPE_PII_KEYWORD_MODE_UNSET,
                data_format: PIPELINE_DATA_FORMAT_JSON,
            },
            expected_matches: 1,
            text: "equal personal.title".to_string(),
            should_error: false,
        }
    ];

    crate::test_utils::run_tests(&test_cases);
}

#[test]
fn test_vin() {
    let sample_json = &crate::test_utils::SAMPLE_JSON.as_bytes().to_vec();

    let test_cases = vec![
        crate::test_utils::TestCase {
            request: Request {
                match_type: DetectiveType::DETECTIVE_TYPE_PII_VIN_NUMBER,
                data: sample_json,
                path: "vehicle.vin".to_string(),
                args: vec![],
                negate: false,
                mode: DETECTIVE_TYPE_PII_KEYWORD_MODE_UNSET,
                data_format: PIPELINE_DATA_FORMAT_JSON,
            },
            expected_matches: 1,
            text: "equal vehicle.vin".to_string(),
            should_error: false,
        }
    ];

    crate::test_utils::run_tests(&test_cases);

}

#[test]
fn test_rsa_key() {
    let sample_json = &crate::test_utils::SAMPLE_JSON.as_bytes().to_vec();

    let test_cases = vec![
        crate::test_utils::TestCase {
            request: Request {
                match_type: DetectiveType::DETECTIVE_TYPE_PII_RSA_KEY,
                data: sample_json,
                path: "rsa_key".to_string(),
                args: vec![],
                negate: false,
                mode: DETECTIVE_TYPE_PII_KEYWORD_MODE_UNSET,
                data_format: PIPELINE_DATA_FORMAT_JSON,
            },
            expected_matches: 1,
            text: "equal rsa_key".to_string(),
            should_error: false,
        }
    ];

    crate::test_utils::run_tests(&test_cases);

}

#[test]
fn test_postal_code() {
    let sample_json = &crate::test_utils::SAMPLE_JSON.as_bytes().to_vec();

    let test_cases = vec![
        crate::test_utils::TestCase {
            request: Request {
                match_type: DetectiveType::DETECTIVE_TYPE_PII_ADDRESS,
                data: sample_json,
                path: "address.postal_code.usa".to_string(),
                args: vec![],
                negate: false,
                mode: DETECTIVE_TYPE_PII_KEYWORD_MODE_UNSET,
                data_format: PIPELINE_DATA_FORMAT_JSON,
            },
            expected_matches: 1,
            text: "equal address.postal_code.usa".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: Request {
                match_type: DetectiveType::DETECTIVE_TYPE_PII_ADDRESS,
                data: sample_json,
                path: "address.postal_code.canada".to_string(),
                args: vec![],
                negate: false,
                mode: DETECTIVE_TYPE_PII_KEYWORD_MODE_UNSET,
                data_format: PIPELINE_DATA_FORMAT_JSON,
            },
            expected_matches: 1,
            text: "equal address.postal_code.canada".to_string(),
            should_error: false,
        }
    ];

    crate::test_utils::run_tests(&test_cases);
}

#[test]
fn test_jwt() {
    let sample_json = &crate::test_utils::SAMPLE_JSON.as_bytes().to_vec();

    let test_cases = vec![
        crate::test_utils::TestCase {
            request: Request {
                match_type: DetectiveType::DETECTIVE_TYPE_PII_JWT,
                data: sample_json,
                path: "jwt".to_string(),
                args: vec![],
                negate: false,
                mode: DETECTIVE_TYPE_PII_KEYWORD_MODE_UNSET,
                data_format: PIPELINE_DATA_FORMAT_JSON,
            },
            expected_matches: 1,
            text: "equal jwt".to_string(),
            should_error: false,
        }
    ];

    crate::test_utils::run_tests(&test_cases);
}

struct PIIKeywordResult {
    pii_type: String,
    value: String,
}

#[test]
// This test checks that PII keyword detection identifies expected PII and returns
// expected data; this test ensures that we do not introduce a regression.
//
// WARNING: If you update SAMPLE_JSON_PII_KEYWORD, you will need to update this test
fn test_pii_keyword_accuracy() {

    // This is pretty gross - we should replace this at a later time with something
    // that generates a JSON blob with various permutations of the PII keywords
    // listed in the keywords.toml.
    //
    // NOTE: This does not test arrays (because of laziness)
    let expected = HashMap::from([
        (String::from("object.ipv4_address"), PIIKeywordResult {
            pii_type: "IP_Information".to_string(),
            value: "127.0.0.1".to_string(),
        }),
        (String::from("object.ipv6_address"), PIIKeywordResult {
            pii_type: "IP_Information".to_string(),
            value: "2001:0db8:85a3:0000:0000:8a2e:0370:7334".to_string(),
        }),
        (String::from("object.mac_address"), PIIKeywordResult {
            pii_type: "Device".to_string(),
            value: "00-B0-D0-63-C2-26".to_string(),
        }),
        (String::from("object.email_plain_valid"), PIIKeywordResult {
            pii_type: "Person".to_string(),
            value: "test@example.com".to_string(),
        }),
        (String::from("object.email_plain_invalid"), PIIKeywordResult {
            pii_type: "Person".to_string(),
            value: "test@example".to_string(),
        }),
        (String::from("object.email_unicode_domain_valid"), PIIKeywordResult {
            pii_type: "Person".to_string(),
            value: "test@日本.com".to_string(),
        }),
        (String::from("object.email_unicode_domain_invalid"), PIIKeywordResult {
            pii_type: "Person".to_string(),
            value: "test@日本".to_string(),
        }),
        (String::from("object.email_unicode_local_valid"), PIIKeywordResult {
            pii_type: "Person".to_string(),
            value: "日本@example.com".to_string(),
        }),
        (String::from("object.email_unicode_local_invalid"), PIIKeywordResult {
            pii_type: "Person".to_string(),
            value: "日本@example".to_string(),
        }),
        (String::from("object.credit_card.visa.valid"), PIIKeywordResult {
            pii_type: "Billing".to_string(),
            value: "4111-1111-1111-1111".to_string(),
        }),
        (String::from("object.credit_card.visa.invalid"), PIIKeywordResult {
            pii_type: "Billing".to_string(),
            value: "4111111111111112".to_string(),
        }),
        (String::from("object.credit_card.mastercard.valid"), PIIKeywordResult {
            pii_type: "Billing".to_string(),
            value: "5555 5555 5555 4444".to_string(),
        }),
        (String::from("object.credit_card.mastercard.invalid"), PIIKeywordResult {
            pii_type: "Billing".to_string(),
            value: "5555555555554445".to_string(),
        }),
        (String::from("object.credit_card.amex.valid"), PIIKeywordResult {
            pii_type: "Billing".to_string(),
            value: "378282246310005".to_string(),
        }),
        (String::from("object.credit_card.amex.invalid"), PIIKeywordResult {
            pii_type: "Billing".to_string(),
            value: "378282246310006".to_string(),
        }),
        (String::from("object.credit_card.discover.valid"), PIIKeywordResult {
            pii_type: "Billing".to_string(),
            value: "6011111111111117".to_string(),
        }),
        (String::from("object.credit_card.discover.invalid"), PIIKeywordResult {
            pii_type: "Billing".to_string(),
            value: "6011111111111118".to_string(),
        }),
        (String::from("object.credit_card.diners_club.valid"), PIIKeywordResult {
            pii_type: "Billing".to_string(),
            value: "30569309025904".to_string(),
        }),
        (String::from("object.credit_card.diners_club.invalid"), PIIKeywordResult {
            pii_type: "Billing".to_string(),
            value: "30569309025905".to_string(),
        }),
        (String::from("object.credit_card.jcb.valid"), PIIKeywordResult {
            pii_type: "Billing".to_string(),
            value: "3530111333300000".to_string(),
        }),
        (String::from("object.credit_card.jcb.invalid"), PIIKeywordResult {
            pii_type: "Billing".to_string(),
            value: "3530111333300001".to_string(),
        }),
        (String::from("object.credit_card.unionpay.valid"), PIIKeywordResult {
            pii_type: "Billing".to_string(),
            value: "6200000000000005".to_string(),
        }),
        (String::from("object.credit_card.unionpay.invalid"), PIIKeywordResult {
            pii_type: "Billing".to_string(),
            value: "6200000000000006".to_string(),
        }),
        (String::from("cloud.aws.mws_auth_token"), PIIKeywordResult {
            pii_type: "Credentials".to_string(),
            value: "amzn.mws.4ea38b7b-f563-7709-4bae-87aea15c".to_string(),
        }),
        (String::from("cloud.docker.swarm_join_token"), PIIKeywordResult {
            pii_type: "Credentials".to_string(),
            value: "SWMTKN-1-3pu6hszjas19xyp7ghgosyx9k8atbfcr8p2is99znpy26u2lkl-1awxwuwd3z9j1z3puu7rcgdbx".to_string(),
        }),
        (String::from("cloud.docker.swarm_unlock_token"), PIIKeywordResult {
            pii_type: "Credentials".to_string(),
            value: "SWMKEY-1-7c37Cc8654o6p38HnroywCi19pllOnGtbdZEgtKxZu8".to_string(),
        }),
        (String::from("cloud.paypal.braintree_access_token"), PIIKeywordResult {
            pii_type: "Credentials".to_string(),
            value: "access_token$sandbox$3g3w".to_string(),
        }),
        (String::from("cloud.sendgrid.api_key"), PIIKeywordResult {

            pii_type: "Credentials".to_string(),
            value: "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".to_string(),
        }),
        (String::from("payments.routing_number"), PIIKeywordResult {
            pii_type: "Banking_and_Financial".to_string(),
            value: "122105155".to_string(),
        }),
        (String::from("payments.iban"), PIIKeywordResult {
            pii_type: "Banking_and_Financial".to_string(),
            value: "GB82WEST12345698765432".to_string(),
        }),
        (String::from("payments.stripe.secret_key"), PIIKeywordResult {
            pii_type: "Credentials".to_string(),
            value: "sk_live_4eC39HqLyjWDarjtT1zdp7dc".to_string(),
        }),
        (String::from("address.postal_code.usa"), PIIKeywordResult {
            pii_type: "Address".to_string(),
            value: "12345".to_string(),
        }),
        (String::from("address.postal_code.canada"), PIIKeywordResult {
            pii_type: "Address".to_string(),
            value: "K1A 0B1".to_string(),
        }),
        (String::from("personal.religion"), PIIKeywordResult {
            pii_type: "Person".to_string(),
            value: "Buddhism".to_string(),
        }),
        (String::from("personal.phone"), PIIKeywordResult {
            pii_type: "Person".to_string(),
            value: "+13215781234".to_string(),
        }),
        (String::from("rsa_key"), PIIKeywordResult {
            pii_type: "SSH".to_string(),
            value: "-----BEGIN RSA PRIVATE KEY-----\nMIIBOgIBAAJBAKj34GkxFhD9\n-----END RSA PRIVATE KEY-----".to_string(),
        }),
        (String::from("bearer_token"), PIIKeywordResult {
            pii_type: "Credentials".to_string(),
            value: "Authorization: Bearer testToken123".to_string(),
        }),
        (String::from("eMa_iL"), PIIKeywordResult {
            pii_type: "Person".to_string(),
            value: "foo@bar.com".to_string(),
        }),
        (String::from("lICENSEplate"), PIIKeywordResult {
            pii_type: "Vehicle_Information".to_string(),
            value: "abc123".to_string(),
        }),
        (String::from("123lic32ense_Plate1234"), PIIKeywordResult {
            pii_type: "Vehicle_Information".to_string(),
            value: "def456".to_string(),
        }),
        (String::from("ipV4_address"), PIIKeywordResult {
            pii_type: "IP_Information".to_string(),
            value: "127.0.0.1".to_string(),
        }),
        (String::from("ip_address"), PIIKeywordResult {
            pii_type: "IP_Information".to_string(),
            value: "127.0.0.2".to_string(),
        }),
        (String::from("ipAddReSS"), PIIKeywordResult {
            pii_type: "IP_Information".to_string(),
            value: "127.0.0.3".to_string(),
        }),
        (String::from("1234sEcREt23_k3Ey___"), PIIKeywordResult {
            pii_type: "Credentials".to_string(),
            value: "amzn.mws.4ea38b7b-f563-7709-4bae-87aea15c".to_string(),
        }),
        (String::from("aws_access_key"), PIIKeywordResult {
            pii_type: "AWS".to_string(),
            value: "AKIAIOSFODNN7EXAMPLE1".to_string(),
        }),
        (String::from("123awsAccessKey456"), PIIKeywordResult {
            pii_type: "AWS".to_string(),
            value: "AKIAIOSFODNN7EXAMPLE2".to_string(),
        }),
        (String::from("1234sEcREt_kEy___"), PIIKeywordResult {
            pii_type: "Credentials".to_string(),
            value: "amzn.mws.4ea38b7b-f563-7709-4bae-87aea15c".to_string(),
        }),
    ]);

    let sample_json = &crate::test_utils::SAMPLE_JSON_PII_KEYWORD.as_bytes().to_vec();

    let request = Request {
        match_type: DetectiveType::DETECTIVE_TYPE_PII_KEYWORD,
        data: sample_json,
        path: "".to_string(), // scan whole payload
        args: vec![],
        negate: false,
        mode: DETECTIVE_TYPE_PII_KEYWORD_MODE_ACCURACY,
        data_format: PIPELINE_DATA_FORMAT_JSON,
    };

    let result = crate::detective::Detective::new().matches(&request);

    assert_eq!(result.is_ok(), true);

    for r in result.unwrap() {
        println!("testing if result path {:?} exists in expected", &r.path);
        println!("testing if result value {:?} exists in expected", String::from_utf8(r.value.clone()).unwrap());
        println!("testing if result pii_type {:?} exists in expected", &r.pii_type);

        assert!(expected.contains_key(&r.path));
        assert_eq!(expected.get(&r.path).unwrap().pii_type, r.pii_type);
        assert_eq!(expected.get(&r.path).unwrap().value, String::from_utf8(r.value).unwrap());
    }
}

#[test]
fn test_plaintext() {
    let sample_text = "Hello my name is Mark, my email is mark@streamdal.com and the vin of my car is 4T1G11AKXRU906563. I have AA000000B as my NHS number. My credit card is 4111111111111111";

    let request = &Request {
        match_type: DetectiveType::DETECTIVE_TYPE_PII_PLAINTEXT_ANY,
        data: &sample_text.as_bytes().to_vec(),
        path: "".to_string(),
        args: Vec::new(),
        negate: false,
        mode: DETECTIVE_TYPE_PII_KEYWORD_MODE_PERFORMANCE,
        data_format: PIPELINE_DATA_FORMAT_PLAINTEXT,
    };

    let results = crate::detective::Detective::new().matches(&request).unwrap();

    // This should match 4 PII types: email, vin, nhs number, and credit card
    assert_eq!(results.len(), 4);

    // assert_eq!(&results[0].pii_type, "Person");
    // assert_eq!(&results[1].pii_type, "Vehicle_Information");
    // assert_eq!(&results[2].pii_type, "Health");
    // assert_eq!(&results[3].pii_type, "Billing");
}

#[test]
fn test_plaintext_mixed() {
    let sample_text = "2024-04-29T15:59:41.60221515Z stdout Exporting data {\"user\": {\"ccnum\": \"4111111111111111\"}} to billing service";

    let request = &Request {
        match_type: DetectiveType::DETECTIVE_TYPE_PII_PLAINTEXT_ANY,
        data: &sample_text.as_bytes().to_vec(),
        path: "".to_string(),
        args: Vec::new(),
        negate: false,
        mode: DETECTIVE_TYPE_PII_KEYWORD_MODE_PERFORMANCE,
        data_format: PIPELINE_DATA_FORMAT_JSON,
    };

    let results = crate::detective::Detective::new().matches(&request).unwrap();

    assert_eq!(results.len(), 1);

}

#[test]
fn test_plaintext_pipes() {
    let sample_text = std::fs::read_to_string("./stacktrace.log").unwrap();

    let request = &Request {
        match_type: DetectiveType::DETECTIVE_TYPE_PII_PLAINTEXT_ANY,
        data: &sample_text.as_bytes().to_vec(),
        path: "".to_string(),
        args: Vec::new(),
        negate: false,
        mode: DETECTIVE_TYPE_PII_KEYWORD_MODE_PERFORMANCE,
        data_format: PIPELINE_DATA_FORMAT_PLAINTEXT,
    };

    let results = crate::detective::Detective::new().matches(&request).unwrap();

    assert_eq!(results.len(), 2);
    assert_eq!(String::from_utf8(results[0].value.clone()).unwrap(), "fmaghull6m@webeden.co.uk".to_string());
    assert_eq!(String::from_utf8(results[1].value.clone()).unwrap(), "fmaghull6m@webeden.co.uk".to_string());
}

#[test]
fn test_plaintext_embedded_json() {
    let sample_text = std::fs::read_to_string("./assets/test-payloads/escaped_json_logs.txt");

    let request = &Request {
        match_type: DetectiveType::DETECTIVE_TYPE_PII_PLAINTEXT_ANY,
        data: &sample_text.unwrap().as_bytes().to_vec(),
        path: "".to_string(),
        args: Vec::new(),
        negate: false,
        mode: DETECTIVE_TYPE_PII_KEYWORD_MODE_PERFORMANCE,
        data_format: PIPELINE_DATA_FORMAT_PLAINTEXT,
    };

    let results = crate::detective::Detective::new().matches(&request).unwrap();

    assert_eq!(results.len(), 11);
}

#[bench]
fn bench_plaintext(b: &mut Bencher) {
    b.iter(|| {
        let sample_text = "Hello my name is Mark, my email is mark@streamdal.com and the vin of my car is 4T1G11AKXRU906563. I have AA000000B as my NHS number. My credit card is 4111111111111111.";

        let req = &Request {
            match_type: DetectiveType::DETECTIVE_TYPE_PII_ANY,
            data: &&sample_text.as_bytes().to_vec(),
            path: "".to_string(),
            args: Vec::new(),
            negate: false,
            mode: DETECTIVE_TYPE_PII_KEYWORD_MODE_PERFORMANCE,
            data_format: PIPELINE_DATA_FORMAT_JSON,
        };

        let _ = plaintext(&req, sample_text);
    });
}