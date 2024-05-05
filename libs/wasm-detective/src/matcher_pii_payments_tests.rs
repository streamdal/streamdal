use crate::detective::Request;
#[cfg(test)]
use protos::sp_steps_detective::DetectiveType;
use protos::sp_steps_detective::DetectiveTypePIIKeywordMode::DETECTIVE_TYPE_PII_KEYWORD_MODE_UNSET;

#[test]
pub fn test_stripe_secret() {
    let sample_json = &crate::test_utils::SAMPLE_JSON.as_bytes().to_vec();

    let test_cases = vec![
        crate::test_utils::TestCase {
            request: Request {
                match_type: DetectiveType::DETECTIVE_TYPE_PII_STRIPE_KEY,
                data: sample_json,
                path: "payments.stripe.secret_key".to_string(),
                args: vec![],
                negate: false,
                mode: DETECTIVE_TYPE_PII_KEYWORD_MODE_UNSET,
            },
            expected_matches: 1,
            text: "equal payments.stripe.secret_key".to_string(),
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
                mode: DETECTIVE_TYPE_PII_KEYWORD_MODE_UNSET,
            },
            expected_matches: 1,
            text: "equal payments.iban".to_string(),
            should_error: false,
        }
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
                mode: DETECTIVE_TYPE_PII_KEYWORD_MODE_UNSET,
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
                mode: DETECTIVE_TYPE_PII_KEYWORD_MODE_UNSET,
            },
            expected_matches: 1,
            text: "equal payments.swift_bic".to_string(),
            should_error: false,
        }
    ];

    crate::test_utils::run_tests(&test_cases);
}
