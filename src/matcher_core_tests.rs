#[cfg(test)]
use protos::matcher::{MatchRequest, MatchType};

#[test]
fn string_tests() {
    let test_cases = vec![
        // String equals
        crate::test_utils::TestCase {
            request: crate::test_utils::generate_request(
                MatchType::MATCH_TYPE_STRING_EQUAL,
                &"object.field".to_string(),
                vec!["value".to_string()],
                false,
            ),
            expected: true,
            text: "string should equal".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: crate::test_utils::generate_request(
                MatchType::MATCH_TYPE_STRING_EQUAL,
                &"object.field".to_string(),
                vec!["should not match".to_string()],
                false,
            ),
            expected: false,
            text: "string should not equals".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: crate::test_utils::generate_request(
                MatchType::MATCH_TYPE_STRING_EQUAL,
                &"does not exist".to_string(),
                vec!["foo".to_string()],
                false,
            ),
            expected: false,
            text: "bad path should error".to_string(),
            should_error: true,
        },
        // TODO: Should add negation support to all funcs

        // String contains ALL
        crate::test_utils::TestCase {
            request: crate::test_utils::generate_request(
                MatchType::MATCH_TYPE_STRING_CONTAINS_ALL,
                &"object.field".to_string(),
                vec!["va".to_string(), "lue".to_string()],
                false,
            ),
            expected: true,
            text: "string should contain all".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: crate::test_utils::generate_request(
                MatchType::MATCH_TYPE_STRING_CONTAINS_ALL,
                &"object.field".to_string(),
                vec!["va".to_string(), "lueeeeeeee".to_string()],
                false,
            ),
            expected: false,
            text: "string should NOT contain all".to_string(),
            should_error: false,
        },
        // String contains ANY
        crate::test_utils::TestCase {
            request: crate::test_utils::generate_request(
                MatchType::MATCH_TYPE_STRING_CONTAINS_ANY,
                &"object.field".to_string(),
                vec!["va".to_string(), "lueeeeeeee".to_string()],
                false,
            ),
            expected: true,
            text: "string should contain any".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: crate::test_utils::generate_request(
                MatchType::MATCH_TYPE_STRING_CONTAINS_ANY,
                &"object.field".to_string(),
                vec!["vvvva".to_string(), "lueeeeeeee".to_string()],
                false,
            ),
            expected: false,
            text: "string should NOT contain any".to_string(),
            should_error: false,
        },
    ];

    crate::test_utils::run_tests(&test_cases);
}

#[test]
fn is_empty() {
    let test_cases = vec![
        // Is empty
        crate::test_utils::TestCase {
            request: crate::test_utils::generate_request(
                MatchType::MATCH_TYPE_IS_EMPTY,
                &"object.empty_string".to_string(),
                vec![], // is_empty doesn't have any args
                false,
            ),
            expected: true,
            text: "empty string should be empty".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: crate::test_utils::generate_request(
                MatchType::MATCH_TYPE_IS_EMPTY,
                &"object.null_field".to_string(),
                vec![],
                false,
            ),
            expected: true,
            text: "null field should be considered empty".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: crate::test_utils::generate_request(
                MatchType::MATCH_TYPE_IS_EMPTY,
                &"object.empty_array".to_string(),
                vec![],
                false,
            ),
            expected: true,
            text: "empty array should be considered empty".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: crate::test_utils::generate_request(
                MatchType::MATCH_TYPE_IS_EMPTY,
                &"object2.does_not_exist".to_string(),
                vec![],
                false,
            ),
            expected: false,
            text: "non-existent path should error".to_string(),
            should_error: true,
        },
        crate::test_utils::TestCase {
            request: crate::test_utils::generate_request(
                MatchType::MATCH_TYPE_IS_EMPTY,
                &"object.field".to_string(),
                vec![],
                false,
            ),
            expected: false,
            text: "Non-empty string should be false".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: crate::test_utils::generate_request(
                MatchType::MATCH_TYPE_IS_EMPTY,
                &"array".to_string(),
                vec![],
                false,
            ),
            expected: false,
            text: "Non-empty array should be false".to_string(),
            should_error: false,
        },
    ];

    crate::test_utils::run_tests(&test_cases);
}

#[test]
fn has_field() {
    let test_cases = vec![
        crate::test_utils::TestCase {
            request: crate::test_utils::generate_request(
                MatchType::MATCH_TYPE_HAS_FIELD,
                &"object".to_string(),
                vec![], // is_empty doesn't have any args
                false,
            ),
            expected: true,
            text: "field exists, should return true".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: crate::test_utils::generate_request(
                MatchType::MATCH_TYPE_HAS_FIELD,
                &"does not exist".to_string(),
                vec![], // is_empty doesn't have any args
                false,
            ),
            expected: false,
            text: "field does not exist - should return false".to_string(),
            should_error: false,
        },
    ];

    crate::test_utils::run_tests(&test_cases);
}

#[test]
fn is_type() {
    let test_cases = vec![
        crate::test_utils::TestCase {
            request: crate::test_utils::generate_request(
                MatchType::MATCH_TYPE_IS_TYPE,
                &"object.field".to_string(),
                vec!["string".to_string()],
                false,
            ),
            expected: true,
            text: "field should be of string type".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: crate::test_utils::generate_request(
                MatchType::MATCH_TYPE_IS_TYPE,
                &"boolean_t".to_string(),
                vec!["bool".to_string()],
                false,
            ),
            expected: true,
            text: "field should be of boolean type".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: crate::test_utils::generate_request(
                MatchType::MATCH_TYPE_IS_TYPE,
                &"array".to_string(),
                vec!["array".to_string()],
                false,
            ),
            expected: true,
            text: "field should be of array type".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: crate::test_utils::generate_request(
                MatchType::MATCH_TYPE_IS_TYPE,
                &"object".to_string(),
                vec!["object".to_string()],
                false,
            ),
            expected: true,
            text: "field should be of object type".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: crate::test_utils::generate_request(
                MatchType::MATCH_TYPE_IS_TYPE,
                &"number_int".to_string(),
                vec!["number".to_string()],
                false,
            ),
            expected: true,
            text: "field should be of number type".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: crate::test_utils::generate_request(
                MatchType::MATCH_TYPE_IS_TYPE,
                &"array".to_string(),
                vec!["bool".to_string()],
                false,
            ),
            expected: false,
            text: "field should NOT be of boolean type".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: crate::test_utils::generate_request(
                MatchType::MATCH_TYPE_IS_TYPE,
                &"does not exist".to_string(),
                vec!["bool".to_string()],
                false,
            ),
            expected: false,
            text: "non-existent field should error".to_string(),
            should_error: true,
        },
    ];

    crate::test_utils::run_tests(&test_cases);
}
