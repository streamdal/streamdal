#[cfg(test)]
use protos::detective::DetectiveType;

// Q: Is there a community-agreed-upon test framework that people use?
// Q: How do folks feel about table driven tests?
// Q: How do you usually handle setup() and teardown()?
// Q: Where do benchmarks usually go? Test file? Separate file?

#[test]
fn string_tests() {
    let test_cases = vec![
        // String equals
        crate::test_utils::TestCase {
            request: crate::test_utils::generate_request(
                DetectiveType::DETECTIVE_TYPE_STRING_EQUAL,
                "object.field",
                vec!["value".to_string()],
                false,
            ),
            expected: true,
            text: "string should equal".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: crate::test_utils::generate_request(
                DetectiveType::DETECTIVE_TYPE_STRING_EQUAL,
                "object.field",
                vec!["should not match".to_string()],
                false,
            ),
            expected: false,
            text: "string should not equals".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: crate::test_utils::generate_request(
                DetectiveType::DETECTIVE_TYPE_STRING_EQUAL,
                "does not exist",
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
                DetectiveType::DETECTIVE_TYPE_STRING_CONTAINS_ALL,
                "object.field",
                vec!["va".to_string(), "lue".to_string()],
                false,
            ),
            expected: true,
            text: "string should contain all".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: crate::test_utils::generate_request(
                DetectiveType::DETECTIVE_TYPE_STRING_CONTAINS_ALL,
                "object.field",
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
                DetectiveType::DETECTIVE_TYPE_STRING_CONTAINS_ANY,
                "object.field",
                vec!["va".to_string(), "lueeeeeeee".to_string()],
                false,
            ),
            expected: true,
            text: "string should contain any".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: crate::test_utils::generate_request(
                DetectiveType::DETECTIVE_TYPE_STRING_CONTAINS_ANY,
                "object.field",
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
                DetectiveType::DETECTIVE_TYPE_IS_EMPTY,
                "object.empty_string",
                vec![], // is_empty doesn't have any args
                false,
            ),
            expected: true,
            text: "empty string should be empty".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: crate::test_utils::generate_request(
                DetectiveType::DETECTIVE_TYPE_IS_EMPTY,
                "object.null_field",
                vec![],
                false,
            ),
            expected: true,
            text: "null field should be considered empty".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: crate::test_utils::generate_request(
                DetectiveType::DETECTIVE_TYPE_IS_EMPTY,
                "object.empty_array",
                vec![],
                false,
            ),
            expected: true,
            text: "empty array should be considered empty".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: crate::test_utils::generate_request(
                DetectiveType::DETECTIVE_TYPE_IS_EMPTY,
                "object2.does_not_exist",
                vec![],
                false,
            ),
            expected: false,
            text: "non-existent path should error".to_string(),
            should_error: true,
        },
        crate::test_utils::TestCase {
            request: crate::test_utils::generate_request(
                DetectiveType::DETECTIVE_TYPE_IS_EMPTY,
                "object.field",
                vec![],
                false,
            ),
            expected: false,
            text: "Non-empty string should be false".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: crate::test_utils::generate_request(
                DetectiveType::DETECTIVE_TYPE_IS_EMPTY,
                "array",
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
                DetectiveType::DETECTIVE_TYPE_HAS_FIELD,
                "object",
                vec![], // is_empty doesn't have any args
                false,
            ),
            expected: true,
            text: "field exists, should return true".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: crate::test_utils::generate_request(
                DetectiveType::DETECTIVE_TYPE_HAS_FIELD,
                "does not exist",
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
                DetectiveType::DETECTIVE_TYPE_IS_TYPE,
                "object.field",
                vec!["string".to_string()],
                false,
            ),
            expected: true,
            text: "field should be of string type".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: crate::test_utils::generate_request(
                DetectiveType::DETECTIVE_TYPE_IS_TYPE,
                "boolean_t",
                vec!["bool".to_string()],
                false,
            ),
            expected: true,
            text: "field should be of boolean type".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: crate::test_utils::generate_request(
                DetectiveType::DETECTIVE_TYPE_IS_TYPE,
                "array",
                vec!["array".to_string()],
                false,
            ),
            expected: true,
            text: "field should be of array type".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: crate::test_utils::generate_request(
                DetectiveType::DETECTIVE_TYPE_IS_TYPE,
                "object",
                vec!["object".to_string()],
                false,
            ),
            expected: true,
            text: "field should be of object type".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: crate::test_utils::generate_request(
                DetectiveType::DETECTIVE_TYPE_IS_TYPE,
                "number_int",
                vec!["number".to_string()],
                false,
            ),
            expected: true,
            text: "field should be of number type".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: crate::test_utils::generate_request(
                DetectiveType::DETECTIVE_TYPE_IS_TYPE,
                "array",
                vec!["bool".to_string()],
                false,
            ),
            expected: false,
            text: "field should NOT be of boolean type".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: crate::test_utils::generate_request(
                DetectiveType::DETECTIVE_TYPE_IS_TYPE,
                "does not exist",
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

#[test]
fn ipv4_address() {
    let test_cases = vec![
        crate::test_utils::TestCase {
            request: crate::test_utils::generate_request(
                DetectiveType::DETECTIVE_TYPE_IPV4_ADDRESS,
                "object.ipv4_address",
                vec![], // No need for args
                false,
            ),
            expected: true,
            text: "field should contain an IPv4 address".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: crate::test_utils::generate_request(
                DetectiveType::DETECTIVE_TYPE_IPV4_ADDRESS,
                "object.does_not_exist",
                vec![], // No need for args
                false,
            ),
            expected: false,
            text: "field does not exist should cause an error".to_string(),
            should_error: true,
        },
        crate::test_utils::TestCase {
            request: crate::test_utils::generate_request(
                DetectiveType::DETECTIVE_TYPE_IPV4_ADDRESS,
                "object.field",
                vec![], // No need for args
                false,
            ),
            expected: false,
            text: "field exists but does not contain an IP address".to_string(),
            should_error: false,
        },
    ];

    crate::test_utils::run_tests(&test_cases);
}

#[test]
fn ipv6_address() {
    let test_cases = vec![
        crate::test_utils::TestCase {
            request: crate::test_utils::generate_request(
                DetectiveType::DETECTIVE_TYPE_IPV6_ADDRESS,
                "object.ipv6_address",
                vec![], // No need for args
                false,
            ),
            expected: true,
            text: "field is an ipv6 address".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: crate::test_utils::generate_request(
                DetectiveType::DETECTIVE_TYPE_IPV6_ADDRESS,
                "object.field",
                vec![], // No need for args
                false,
            ),
            expected: false,
            text: "field is not an ipv6 address".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: crate::test_utils::generate_request(
                DetectiveType::DETECTIVE_TYPE_IPV6_ADDRESS,
                "object.non-existent-field",
                vec![], // No need for args
                false,
            ),
            expected: false,
            text: "field does not exist".to_string(),
            should_error: true,
        },
    ];

    crate::test_utils::run_tests(&test_cases);
}

#[test]
fn boolean() {
    let test_cases = vec![
        crate::test_utils::TestCase {
            request: crate::test_utils::generate_request(
                DetectiveType::DETECTIVE_TYPE_BOOLEAN_TRUE,
                "boolean_t",
                vec![], // No need for args
                false,
            ),
            expected: true,
            text: "field has a bool true".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: crate::test_utils::generate_request(
                DetectiveType::DETECTIVE_TYPE_BOOLEAN_FALSE,
                "boolean_f",
                vec![], // No need for args
                false,
            ),
            expected: true,
            text: "field has a bool false".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: crate::test_utils::generate_request(
                DetectiveType::DETECTIVE_TYPE_BOOLEAN_FALSE,
                "boolean_t",
                vec![], // No need for args
                false,
            ),
            expected: false,
            text: "incorrect bool check".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: crate::test_utils::generate_request(
                DetectiveType::DETECTIVE_TYPE_BOOLEAN_FALSE,
                "object",
                vec![], // No need for args
                false,
            ),
            expected: false,
            text: "bool check should error on incorrect type".to_string(),
            should_error: true,
        },
        crate::test_utils::TestCase {
            request: crate::test_utils::generate_request(
                DetectiveType::DETECTIVE_TYPE_BOOLEAN_FALSE,
                "does-not-exist",
                vec![], // No need for args
                false,
            ),
            expected: false,
            text: "bool check should error on non-existent field".to_string(),
            should_error: true,
        },
    ];

    crate::test_utils::run_tests(&test_cases);
}

#[test]
fn regex() {
    let test_cases = vec![
        crate::test_utils::TestCase {
            request: crate::test_utils::generate_request(
                DetectiveType::DETECTIVE_TYPE_REGEX,
                "object.field",
                vec![r#"^[a-zA-Z0-9]+$"#.to_string()],
                false,
            ),
            expected: true,
            text: "should match word".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: crate::test_utils::generate_request(
                DetectiveType::DETECTIVE_TYPE_REGEX,
                "object.number_as_string",
                vec![r#"\d+"#.to_string()],
                false,
            ),
            expected: true,
            text: "should match number".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: crate::test_utils::generate_request(
                DetectiveType::DETECTIVE_TYPE_REGEX,
                "object.field",
                vec![r#"\d+"#.to_string()],
                false,
            ),
            expected: false,
            text: "should not match number".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: crate::test_utils::generate_request(
                DetectiveType::DETECTIVE_TYPE_REGEX,
                "object.field",
                vec![r#"\d+++]["#.to_string()],
                false,
            ),
            expected: false,
            text: "bad regex should error".to_string(),
            should_error: true,
        },
    ];

    crate::test_utils::run_tests(&test_cases);
}

#[test]
fn mac_address() {
    let test_cases = vec![
        crate::test_utils::TestCase {
            request: crate::test_utils::generate_request(
                DetectiveType::DETECTIVE_TYPE_MAC_ADDRESS,
                "object.mac_address",
                vec![], // no args needed
                false,
            ),
            expected: true,
            text: "should match mac address".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: crate::test_utils::generate_request(
                DetectiveType::DETECTIVE_TYPE_MAC_ADDRESS,
                "object.field",
                vec![], // no args needed
                false,
            ),
            expected: false,
            text: "should NOT match mac address".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: crate::test_utils::generate_request(
                DetectiveType::DETECTIVE_TYPE_MAC_ADDRESS,
                "object.does_not_exist",
                vec![], // no args needed
                false,
            ),
            expected: false,
            text: "mac_address should error for non-existing field".to_string(),
            should_error: true,
        },
    ];

    crate::test_utils::run_tests(&test_cases);
}

#[test]
fn uuid() {
    let test_cases = vec![
        crate::test_utils::TestCase {
            request: crate::test_utils::generate_request(
                DetectiveType::DETECTIVE_TYPE_UUID,
                "object.uuid_dash",
                vec![], // no args needed
                false,
            ),
            expected: true,
            text: "should match uuid with dashes".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: crate::test_utils::generate_request(
                DetectiveType::DETECTIVE_TYPE_UUID,
                "object.uuid_colon",
                vec![], // no args needed
                false,
            ),
            expected: true,
            text: "should match uuid with colons".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: crate::test_utils::generate_request(
                DetectiveType::DETECTIVE_TYPE_UUID,
                "object.uuid_stripped",
                vec![], // no args needed
                false,
            ),
            expected: true,
            text: "should match uuid with no separators".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: crate::test_utils::generate_request(
                DetectiveType::DETECTIVE_TYPE_UUID,
                "object.field",
                vec![], // no args needed
                false,
            ),
            expected: false,
            text: "should NOT match uuid".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: crate::test_utils::generate_request(
                DetectiveType::DETECTIVE_TYPE_UUID,
                "object.does_not_exist",
                vec![], // no args needed
                false,
            ),
            expected: false,
            text: "should error when field does not exist".to_string(),
            should_error: true,
        },
    ];

    crate::test_utils::run_tests(&test_cases);
}

#[test]
fn timestamp_unix() {
    let test_cases = vec![
        // crate::test_utils::TestCase {
        //     request: crate::test_utils::generate_request(
        //         DetectiveType::DETECTIVE_TYPE_TIMESTAMP_UNIX,
        //         "timestamp_unix_str",
        //         vec![], // no args needed
        //         false,
        //     ),
        //     expected: true,
        //     text: "timestamp str should be true".to_string(),
        //     should_error: false,
        // },
        crate::test_utils::TestCase {
            request: crate::test_utils::generate_request(
                DetectiveType::DETECTIVE_TYPE_TIMESTAMP_UNIX,
                "timestamp_unix_num",
                vec![], // no args needed
                false,
            ),
            expected: true,
            text: "timestamp num should be true".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: crate::test_utils::generate_request(
                DetectiveType::DETECTIVE_TYPE_TIMESTAMP_UNIX,
                "object.field",
                vec![], // no args needed
                false,
            ),
            expected: false,
            text: "non-ts field should be false".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: crate::test_utils::generate_request(
                DetectiveType::DETECTIVE_TYPE_TIMESTAMP_UNIX,
                "unknown_field_123",
                vec![], // no args needed
                false,
            ),
            expected: false,
            text: "bad ts field should throw error".to_string(),
            should_error: true,
        },
    ];

    crate::test_utils::run_tests(&test_cases);
}

#[test]
fn timestamp_unix_nano() {
    let test_cases = vec![
        crate::test_utils::TestCase {
            request: crate::test_utils::generate_request(
                DetectiveType::DETECTIVE_TYPE_TIMESTAMP_UNIX_NANO,
                "timestamp_unix_nano_str",
                vec![], // no args needed
                false,
            ),
            expected: true,
            text: "should match nano ts str".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: crate::test_utils::generate_request(
                DetectiveType::DETECTIVE_TYPE_TIMESTAMP_UNIX_NANO,
                "timestamp_unix_nano_num",
                vec![], // no args needed
                false,
            ),
            expected: true,
            text: "should match nano ts num".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: crate::test_utils::generate_request(
                DetectiveType::DETECTIVE_TYPE_TIMESTAMP_UNIX_NANO,
                "object.field",
                vec![], // no args needed
                false,
            ),
            expected: false,
            text: "should not error on non-ts value".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: crate::test_utils::generate_request(
                DetectiveType::DETECTIVE_TYPE_TIMESTAMP_UNIX_NANO,
                "does-not-exist",
                vec![], // no args needed
                false,
            ),
            expected: false,
            text: "should error with unknown field".to_string(),
            should_error: true,
        },
    ];

    crate::test_utils::run_tests(&test_cases);
}

#[test]
fn timestamp_rfc3339() {
    let test_cases = vec![
        crate::test_utils::TestCase {
            request: crate::test_utils::generate_request(
                DetectiveType::DETECTIVE_TYPE_TIMESTAMP_RFC3339,
                "timestamp_rfc3339",
                vec![], // no args needed
                false,
            ),
            expected: true,
            text: "should match rfc3339 ts".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: crate::test_utils::generate_request(
                DetectiveType::DETECTIVE_TYPE_TIMESTAMP_RFC3339,
                "timestamp_unix_str",
                vec![], // no args needed
                false,
            ),
            expected: false,
            text: "should not match non-rfc3339 ts".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: crate::test_utils::generate_request(
                DetectiveType::DETECTIVE_TYPE_TIMESTAMP_RFC3339,
                "unknown-field-123",
                vec![], // no args needed
                false,
            ),
            expected: false,
            text: "unknown field should error".to_string(),
            should_error: true,
        },
    ];

    crate::test_utils::run_tests(&test_cases);
}
