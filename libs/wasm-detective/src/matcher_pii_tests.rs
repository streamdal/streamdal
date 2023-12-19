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
            expected: true,
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
            expected: false,
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
            expected: true,
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
            expected: false,
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
            expected: true,
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
            expected: false,
            text: "equal email_unicode_local_invalid".to_string(),
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
            expected: true,
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
            expected: false,
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
            expected: true,
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
            expected: false,
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
            expected: true,
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
            expected: false,
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
            expected: true,
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
            expected: false,
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
            expected: true,
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
            expected: false,
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
            expected: true,
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
            expected: false,
            text: "equal credit_card.jcb.invalid".to_string(),
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
    }"#.as_bytes().to_vec();

    let json_without_field = r#"{
        "object": {
            "ccnum": "foo"
        }
    }"#.as_bytes().to_vec();

    let test_cases = vec![
        crate::test_utils::TestCase {
            request: Request {
                match_type: DetectiveType::DETECTIVE_TYPE_PII_CREDIT_CARD,
                data: &json_with_field,
                path: "".to_string(),
                args: vec![],
                negate: false,
            },
            expected: true,
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
            expected: false,
            text: "".to_string(),
            should_error: false,
        },
    ];

    crate::test_utils::run_tests(&test_cases);
}