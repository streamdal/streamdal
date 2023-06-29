#[cfg(test)]
mod tests {
    use protos::matcher::{MatchRequest, MatchType};

    struct TestCase {
        request: MatchRequest,
        expected: bool,
        should_error: bool,
        text: String,
    }

    #[test]
    fn test_numeric() {
        let test_cases = vec![
            // Equal
            TestCase {
                request: generate_request(
                    MatchType::MATCH_TYPE_NUMERIC_EQUAL_TO,
                    &"number_int".to_string(),
                    vec!["100".to_string()],
                    false,
                ),
                expected: true,
                text: "equal number_int".to_string(),
                should_error: false,
            },
            TestCase {
                request: generate_request(
                    MatchType::MATCH_TYPE_NUMERIC_EQUAL_TO,
                    &"number_float".to_string(),
                    vec!["100.1".to_string()],
                    false,
                ),
                expected: true,
                text: "equal number_float".to_string(),
                should_error: false,
            },
            // Greater than
            TestCase {
                request: generate_request(
                    MatchType::MATCH_TYPE_NUMERIC_GREATER_THAN,
                    &"number_int".to_string(),
                    vec!["1".to_string()],
                    false,
                ),
                expected: true,
                text: "greater than number_int".to_string(),
                should_error: false,
            },
            TestCase {
                request: generate_request(
                    MatchType::MATCH_TYPE_NUMERIC_GREATER_THAN,
                    &"number_float".to_string(),
                    vec!["2".to_string()],
                    false,
                ),
                expected: true,
                text: "greater than number_float".to_string(),
                should_error: false,
            },
            TestCase {
                request: generate_request(
                    MatchType::MATCH_TYPE_NUMERIC_GREATER_THAN,
                    &"number_float".to_string(),
                    vec!["1000".to_string()],
                    false,
                ),
                expected: false,
                text: "NOT greater than number_float".to_string(),
                should_error: false,
            },
            // Greater equal
            TestCase {
                request: generate_request(
                    MatchType::MATCH_TYPE_NUMERIC_GREATER_EQUAL,
                    &"number_float".to_string(),
                    vec!["100.1".to_string()],
                    false,
                ),
                expected: true,
                text: "greater or equal than number_float".to_string(),
                should_error: false,
            },
            // Less than
            TestCase {
                request: generate_request(
                    MatchType::MATCH_TYPE_NUMERIC_LESS_THAN,
                    &"number_int".to_string(),
                    vec!["2000".to_string()],
                    false,
                ),
                expected: true,
                text: "less than number_int".to_string(),
                should_error: false,
            },
            // Less equal
            TestCase {
                request: generate_request(
                    MatchType::MATCH_TYPE_NUMERIC_LESS_EQUAL,
                    &"number_int".to_string(),
                    vec!["1000".to_string()],
                    false,
                ),
                expected: true,
                text: "less equal than number_int 1".to_string(),
                should_error: false,
            },
            TestCase {
                request: generate_request(
                    MatchType::MATCH_TYPE_NUMERIC_LESS_EQUAL,
                    &"number_int".to_string(),
                    vec!["999".to_string()],
                    false,
                ),
                expected: true,
                text: "less equal than number_int 2".to_string(),
                should_error: false,
            },
            // Negate
            TestCase {
                request: generate_request(
                    MatchType::MATCH_TYPE_NUMERIC_LESS_EQUAL,
                    &"number_int".to_string(),
                    vec!["99".to_string()],
                    false,
                ),
                expected: false,
                text: "Negate: less equal than number_int".to_string(),
                should_error: false,
            },
            // Error paths
            TestCase {
                request: generate_request(
                    MatchType::MATCH_TYPE_NUMERIC_EQUAL_TO,
                    &"number_int".to_string(),
                    vec!["not a number".to_string()],
                    false,
                ),
                should_error: true,
                expected: false,
                text: "equal number_int bad arg".to_string(),
            },
            TestCase {
                request: generate_request(
                    MatchType::MATCH_TYPE_NUMERIC_EQUAL_TO,
                    &"does_not_exist".to_string(),
                    vec!["1000".to_string()],
                    false,
                ),
                should_error: true,
                expected: true,
                text: "equal number_int bad path".to_string(),
            },
        ];

        for case in test_cases {
            let result = crate::detective::Detective::new().matches(&case.request);

            if case.should_error {
                assert_eq!(result.is_err(), true, "{}", case.text);
            } else {
                assert_eq!(result.unwrap(), case.expected, "{}", case.text);
            }
        }
    }

    fn generate_request(
        match_type: MatchType,
        path: &str,
        args: Vec<String>,
        negate: bool,
    ) -> MatchRequest {
        let sample_json = r#"{
    "boolean_t": true,
    "boolean_f": false,
    "object": {
        "field": "value"
    },
    "array": [
        "value1",
        "value2"
    ],
    "number_int": 100,
    "number_float": 100.1,
}"#;

        MatchRequest {
            data: sample_json.as_bytes().to_vec(),
            path: path.to_string(),
            args: args,
            negate: false,
            type_: protobuf::EnumOrUnknown::from(match_type),
            special_fields: Default::default(),
        }
    }
}
