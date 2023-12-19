use crate::detective::Request;
#[cfg(test)]
use protos::sp_steps_detective::DetectiveType;

#[test]
fn test_numeric() {
    let sample_json = &crate::test_utils::SAMPLE_JSON.as_bytes().to_vec();

    let test_cases = vec![
        // Equal
        crate::test_utils::TestCase {
            request: Request {
                match_type: DetectiveType::DETECTIVE_TYPE_NUMERIC_EQUAL_TO,
                data: sample_json,
                path: "number_int".to_string(),
                args: vec!["100".to_string()],
                negate: false,
            },
            expected: true,
            text: "equal number_int".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: Request {
                match_type: DetectiveType::DETECTIVE_TYPE_NUMERIC_EQUAL_TO,
                data: sample_json,
                path: "number_float".to_string(),
                args: vec!["100.1".to_string()],
                negate: false,
            },
            expected: true,
            text: "equal number_float".to_string(),
            should_error: false,
        },
        // Greater than
        crate::test_utils::TestCase {
            request: Request {
                match_type: DetectiveType::DETECTIVE_TYPE_NUMERIC_GREATER_THAN,
                data: sample_json,
                path: "number_int".to_string(),
                args: vec!["1".to_string()],
                negate: false,
            },
            expected: true,
            text: "greater than number_int".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: Request {
                match_type: DetectiveType::DETECTIVE_TYPE_NUMERIC_GREATER_THAN,
                data: sample_json,
                path: "number_float".to_string(),
                args: vec!["2".to_string()],
                negate: false,
            },
            expected: true,
            text: "greater than number_float".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: Request {
                match_type: DetectiveType::DETECTIVE_TYPE_NUMERIC_GREATER_THAN,
                data: sample_json,
                path: "number_float".to_string(),
                args: vec!["1000".to_string()],
                negate: false,
            },
            expected: false,
            text: "NOT greater than number_float".to_string(),
            should_error: false,
        },
        // Greater equal
        crate::test_utils::TestCase {
            request: Request {
                match_type: DetectiveType::DETECTIVE_TYPE_NUMERIC_GREATER_EQUAL,
                data: sample_json,
                path: "number_float".to_string(),
                args: vec!["100.1".to_string()],
                negate: false,
            },
            expected: true,
            text: "greater or equal than number_float".to_string(),
            should_error: false,
        },
        // Less than
        crate::test_utils::TestCase {
            request: Request {
                match_type: DetectiveType::DETECTIVE_TYPE_NUMERIC_LESS_THAN,
                data: sample_json,
                path: "number_int".to_string(),
                args: vec!["2000".to_string()],
                negate: false,
            },
            expected: true,
            text: "less than number_int".to_string(),
            should_error: false,
        },
        // Less equal
        crate::test_utils::TestCase {
            request: Request {
                match_type: DetectiveType::DETECTIVE_TYPE_NUMERIC_LESS_EQUAL,
                data: sample_json,
                path: "number_int".to_string(),
                args: vec!["1000".to_string()],
                negate: false,
            },
            expected: true,
            text: "less equal than number_int 1".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: Request {
                match_type: DetectiveType::DETECTIVE_TYPE_NUMERIC_LESS_EQUAL,
                data: sample_json,
                path: "number_int".to_string(),
                args: vec!["999".to_string()],
                negate: false,
            },
            expected: true,
            text: "less equal than number_int 2".to_string(),
            should_error: false,
        },
        // Negate
        crate::test_utils::TestCase {
            request: Request {
                match_type: DetectiveType::DETECTIVE_TYPE_NUMERIC_LESS_EQUAL,
                data: sample_json,
                path: "number_int".to_string(),
                args: vec!["1000".to_string()],
                negate: true,
            },
            expected: false,
            text: "Negate: less equal than number_int".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: Request {
                match_type: DetectiveType::DETECTIVE_TYPE_NUMERIC_EQUAL_TO,
                data: sample_json,
                path: "number_int".to_string().to_owned(),
                args: vec!["100".to_string()],
                negate: true,
            },
            should_error: false,
            expected: false,
            text: "Negate: equal to".to_string(),
        },
        // Error paths
        crate::test_utils::TestCase {
            request: Request {
                match_type: DetectiveType::DETECTIVE_TYPE_NUMERIC_EQUAL_TO,
                data: sample_json,
                path: "number_int".to_string(),
                args: vec!["not a number".to_string()],
                negate: false,
            },
            should_error: true,
            expected: false,
            text: "equal number_int bad arg".to_string(),
        },
        crate::test_utils::TestCase {
            request: Request {
                match_type: DetectiveType::DETECTIVE_TYPE_NUMERIC_EQUAL_TO,
                data: sample_json,
                path: "does_not_exist".to_string(),
                args: vec!["1000".to_string()],
                negate: false,
            },
            should_error: true,
            expected: true,
            text: "equal number_int bad path".to_string(),
        },
    ];

    crate::test_utils::run_tests(&test_cases);
}
