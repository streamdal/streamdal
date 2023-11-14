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