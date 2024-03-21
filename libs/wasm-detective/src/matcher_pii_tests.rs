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

#[test]
fn test_aws_key_id() {
    let sample_json = &crate::test_utils::SAMPLE_JSON.as_bytes().to_vec();

    let test_cases = vec![
        crate::test_utils::TestCase {
            request: Request {
                match_type: DetectiveType::DETECTIVE_TYPE_PII_AWS_KEY_ID,
                data: sample_json,
                path: "cloud.aws.key_id".to_string(),
                args: vec![],
                negate: false,
            },
            expected_matches: 1,
            text: "equal cloud.aws.key_id".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: Request {
                match_type: DetectiveType::DETECTIVE_TYPE_PII_AWS_KEY_ID,
                data: sample_json,
                path: "cloud.github.pat".to_string(),
                args: vec![],
                negate: false,
            },
            expected_matches: 0,
            text: "not equal cloud.github.pat".to_string(),
            should_error: false,
        },
    ];

    crate::test_utils::run_tests(&test_cases);
}

#[test]
fn test_github_pat() {
    let sample_json = &crate::test_utils::SAMPLE_JSON.as_bytes().to_vec();

    let test_cases = vec![
        crate::test_utils::TestCase {
            request: Request {
                match_type: DetectiveType::DETECTIVE_TYPE_PII_GITHUB_PAT,
                data: sample_json,
                path: "cloud.github.pat".to_string(),
                args: vec![],
                negate: false,
            },
            expected_matches: 1,
            text: "equal github_pat_valid".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: Request {
                match_type: DetectiveType::DETECTIVE_TYPE_PII_GITHUB_PAT,
                data: sample_json,
                path: "cloud.aws.key_id".to_string(),
                args: vec![],
                negate: false,
            },
            expected_matches: 0,
            text: "equal github_pat_invalid".to_string(),
            should_error: false,
        },
    ];

    crate::test_utils::run_tests(&test_cases);
}

#[test]
fn test_routing_number() {
    let sample_json = &crate::test_utils::SAMPLE_JSON.as_bytes().to_vec();

    let test_cases = vec![
        crate::test_utils::TestCase {
            request: Request {
                match_type: DetectiveType::DETECTIVE_TYPE_PII_BANK_ROUTING_NUMBER,
                data: sample_json,
                path: "payments.routing_number".to_string(),
                args: vec![],
                negate: false,
            },
            expected_matches: 1,
            text: "equal payments.routing_number".to_string(),
            should_error: false,
        }
    ];

    crate::test_utils::run_tests(&test_cases);
}

#[test]
fn test_swift_bic() {
    let sample_json = &crate::test_utils::SAMPLE_JSON.as_bytes().to_vec();

    let test_cases = vec![
        crate::test_utils::TestCase {
            request: Request {
                match_type: DetectiveType::DETECTIVE_TYPE_PII_SWIFT_BIC,
                data: sample_json,
                path: "payments.swift_bic".to_string(),
                args: vec![],
                negate: false,
            },
            expected_matches: 1,
            text: "equal payments.swift_bic".to_string(),
            should_error: false,
        }
    ];

    crate::test_utils::run_tests(&test_cases);
}

#[test]
fn test_stripe_key() {
    let sample_json = &crate::test_utils::SAMPLE_JSON.as_bytes().to_vec();

    let test_cases = vec![
        crate::test_utils::TestCase {
            request: Request {
                match_type: DetectiveType::DETECTIVE_TYPE_PII_STRIPE_KEY,
                data: sample_json,
                path: "payments.stripe".to_string(),
                args: vec![],
                negate: false,
            },
            expected_matches: 1,
            text: "equal payments.stripe".to_string(),
            should_error: false,
        }
    ];

    crate::test_utils::run_tests(&test_cases);
}

#[test]
fn test_slack_token() {
    let sample_json = &crate::test_utils::SAMPLE_JSON.as_bytes().to_vec();

    let test_cases = vec![
        crate::test_utils::TestCase {
            request: Request {
                match_type: DetectiveType::DETECTIVE_TYPE_PII_SLACK_TOKEN,
                data: sample_json,
                path: "slack".to_string(),
                args: vec![],
                negate: false,
            },
            expected_matches: 1,
            text: "equal slack".to_string(),
            should_error: false,
        }
    ];

    crate::test_utils::run_tests(&test_cases);
}

#[test]
fn test_iban() {
    let sample_json = &crate::test_utils::SAMPLE_JSON.as_bytes().to_vec();

    let test_cases = vec![
        crate::test_utils::TestCase {
            request: Request {
                match_type: DetectiveType::DETECTIVE_TYPE_PII_IBAN,
                data: sample_json,
                path: "payments.iban".to_string(),
                args: vec![],
                negate: false,
            },
            expected_matches: 1,
            text: "equal payments.iban".to_string(),
            should_error: false,
        }
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
            },
            expected_matches: 1,
            text: "equal personal.title".to_string(),
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
            },
            expected_matches: 1,
            text: "equal jwt".to_string(),
            should_error: false,
        }
    ];

    crate::test_utils::run_tests(&test_cases);
}