use crate::detective::Request;
#[cfg(test)]
use protos::sp_steps_detective::DetectiveType;

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
            },
            expected_matches: 0,
            text: "equal credit_card.jcb.invalid".to_string(),
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
            },
            expected_matches: 0,
            text: "equal ssn_invalid".to_string(),
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
            },
            expected_matches: 0,
            text: "don't find PII in payload".to_string(),
            should_error: false,
        },
    ];

    crate::test_utils::run_tests(&test_cases);
}
