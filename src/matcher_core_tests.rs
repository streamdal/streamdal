use crate::test_utils::Request;
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
            request: Request {
                detective_type: DetectiveType::DETECTIVE_TYPE_STRING_EQUAL,
                data: crate::test_utils::SAMPLE_JSON.as_bytes().to_vec(),
                path: "object.field".to_string(),
                args: vec!["value".to_string()],
                negate: false,
            },
            expected: true,
            text: "string should equal".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: Request {
                detective_type: DetectiveType::DETECTIVE_TYPE_STRING_EQUAL,
                data: crate::test_utils::SAMPLE_JSON.as_bytes().to_vec(),
                path: "object.field".to_string(),
                args: vec!["should not match".to_string()],
                negate: false,
            },
            expected: false,
            text: "string should not equals".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: Request {
                detective_type: DetectiveType::DETECTIVE_TYPE_STRING_EQUAL,
                data: crate::test_utils::SAMPLE_JSON.as_bytes().to_vec(),
                path: "does not exist".to_string(),
                args: vec!["foo".to_string()],
                negate: false,
            },
            expected: false,
            text: "bad path should error".to_string(),
            should_error: true,
        },
        // TODO: Should add negation support to all funcs

        // String contains ALL
        crate::test_utils::TestCase {
            request: Request {
                detective_type: DetectiveType::DETECTIVE_TYPE_STRING_CONTAINS_ALL,
                data: crate::test_utils::SAMPLE_JSON.as_bytes().to_vec(),
                path: "object.field".to_string(),
                args: vec!["va".to_string(), "lue".to_string()],
                negate: false,
            },
            expected: true,
            text: "string should contain all".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: Request {
                detective_type: DetectiveType::DETECTIVE_TYPE_STRING_CONTAINS_ALL,
                data: crate::test_utils::SAMPLE_JSON.as_bytes().to_vec(),
                path: "object.field".to_string(),
                args: vec!["va".to_string(), "lueeeeeeee".to_string()],
                negate: false,
            },
            expected: false,
            text: "string should NOT contain all".to_string(),
            should_error: false,
        },
        // String contains ANY
        crate::test_utils::TestCase {
            request: Request {
                detective_type: DetectiveType::DETECTIVE_TYPE_STRING_CONTAINS_ANY,
                data: crate::test_utils::SAMPLE_JSON.as_bytes().to_vec(),
                path: "object.field".to_string(),
                args: vec!["va".to_string(), "lueeeeeeee".to_string()],
                negate: false,
            },
            expected: true,
            text: "string should contain any".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: Request {
                detective_type: DetectiveType::DETECTIVE_TYPE_STRING_CONTAINS_ANY,
                data: crate::test_utils::SAMPLE_JSON.as_bytes().to_vec(),
                path: "object.field".to_string(),
                args: vec!["vvvva".to_string().to_string(), "lueeeeeeee".to_string()],
                negate: false,
            },
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
            request: Request {
                detective_type: DetectiveType::DETECTIVE_TYPE_IS_EMPTY,
                data: crate::test_utils::SAMPLE_JSON.as_bytes().to_vec(),
                path: "object.empty_string".to_string(),
                args: vec![], // is_empty doesn't have any args
                negate: false,
            },
            expected: true,
            text: "empty string should be empty".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: Request {
                detective_type: DetectiveType::DETECTIVE_TYPE_IS_EMPTY,
                data: crate::test_utils::SAMPLE_JSON.as_bytes().to_vec(),
                path: "object.null_field".to_string(),
                args: vec![],
                negate: false,
            },
            expected: true,
            text: "null field should be considered empty".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: Request {
                detective_type: DetectiveType::DETECTIVE_TYPE_IS_EMPTY,
                data: crate::test_utils::SAMPLE_JSON.as_bytes().to_vec(),
                path: "object.empty_array".to_string(),
                args: vec![],
                negate: false,
            },
            expected: true,
            text: "empty array should be considered empty".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: Request {
                detective_type: DetectiveType::DETECTIVE_TYPE_IS_EMPTY,
                data: crate::test_utils::SAMPLE_JSON.as_bytes().to_vec(),
                path: "object2.does_not_exist".to_string(),
                args: vec![],
                negate: false,
            },
            expected: false,
            text: "non-existent path should error".to_string(),
            should_error: true,
        },
        crate::test_utils::TestCase {
            request: Request {
                detective_type: DetectiveType::DETECTIVE_TYPE_IS_EMPTY,
                data: crate::test_utils::SAMPLE_JSON.as_bytes().to_vec(),
                path: "object.field".to_string(),
                args: vec![],
                negate: false,
            },
            expected: false,
            text: "Non-empty string should be false".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: Request {
                detective_type: DetectiveType::DETECTIVE_TYPE_IS_EMPTY,
                data: crate::test_utils::SAMPLE_JSON.as_bytes().to_vec(),
                path: "array".to_string(),
                args: vec![],
                negate: false,
            },
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
            request: Request {
                detective_type: DetectiveType::DETECTIVE_TYPE_HAS_FIELD,
                data: crate::test_utils::SAMPLE_JSON.as_bytes().to_vec(),
                path: "object".to_string(),
                args: vec![], // is_empty doesn't have any args
                negate: false,
            },
            expected: true,
            text: "field exists, should return true".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: Request {
                detective_type: DetectiveType::DETECTIVE_TYPE_HAS_FIELD,
                data: crate::test_utils::SAMPLE_JSON.as_bytes().to_vec(),
                path: "does not exist".to_string(),
                args: vec![], // is_empty doesn't have any args
                negate: false,
            },
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
            request: Request {
                detective_type: DetectiveType::DETECTIVE_TYPE_IS_TYPE,
                data: crate::test_utils::SAMPLE_JSON.as_bytes().to_vec(),
                path: "object.field".to_string(),
                args: vec!["string".to_string()],
                negate: false,
            },
            expected: true,
            text: "field should be of string type".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: Request {
                detective_type: DetectiveType::DETECTIVE_TYPE_IS_TYPE,
                data: crate::test_utils::SAMPLE_JSON.as_bytes().to_vec(),
                path: "boolean_t".to_string(),
                args: vec!["bool".to_string()],
                negate: false,
            },
            expected: true,
            text: "field should be of boolean type".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: Request {
                detective_type: DetectiveType::DETECTIVE_TYPE_IS_TYPE,
                data: crate::test_utils::SAMPLE_JSON.as_bytes().to_vec(),
                path: "array".to_string(),
                args: vec!["array".to_string()],
                negate: false,
            },
            expected: true,
            text: "field should be of array type".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: Request {
                detective_type: DetectiveType::DETECTIVE_TYPE_IS_TYPE,
                data: crate::test_utils::SAMPLE_JSON.as_bytes().to_vec(),
                path: "object".to_string(),
                args: vec!["object".to_string()],
                negate: false,
            },
            expected: true,
            text: "field should be of object type".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: Request {
                detective_type: DetectiveType::DETECTIVE_TYPE_IS_TYPE,
                data: crate::test_utils::SAMPLE_JSON.as_bytes().to_vec(),
                path: "number_int".to_string(),
                args: vec!["number".to_string()],
                negate: false,
            },
            expected: true,
            text: "field should be of number type".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: Request {
                detective_type: DetectiveType::DETECTIVE_TYPE_IS_TYPE,
                data: crate::test_utils::SAMPLE_JSON.as_bytes().to_vec(),
                path: "array".to_string(),
                args: vec!["bool".to_string()],
                negate: false,
            },
            expected: false,
            text: "field should NOT be of boolean type".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: Request {
                detective_type: DetectiveType::DETECTIVE_TYPE_IS_TYPE,
                data: crate::test_utils::SAMPLE_JSON.as_bytes().to_vec(),
                path: "does not exist".to_string(),
                args: vec!["bool".to_string()],
                negate: false,
            },
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
            request: Request {
                detective_type: DetectiveType::DETECTIVE_TYPE_IPV4_ADDRESS,
                data: crate::test_utils::SAMPLE_JSON.as_bytes().to_vec(),
                path: "object.ipv4_address".to_string(),
                args: vec![], // No need for args
                negate: false,
            },
            expected: true,
            text: "field should contain an IPv4 address".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: Request {
                detective_type: DetectiveType::DETECTIVE_TYPE_IPV4_ADDRESS,
                data: crate::test_utils::SAMPLE_JSON.as_bytes().to_vec(),
                path: "object.does_not_exist".to_string(),
                args: vec![], // No need for args
                negate: false,
            },
            expected: false,
            text: "field does not exist should cause an error".to_string(),
            should_error: true,
        },
        crate::test_utils::TestCase {
            request: Request {
                detective_type: DetectiveType::DETECTIVE_TYPE_IPV4_ADDRESS,
                data: crate::test_utils::SAMPLE_JSON.as_bytes().to_vec(),
                path: "object.field".to_string(),
                args: vec![], // No need for args
                negate: false,
            },
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
            request: Request {
                detective_type: DetectiveType::DETECTIVE_TYPE_IPV6_ADDRESS,
                data: crate::test_utils::SAMPLE_JSON.as_bytes().to_vec(),
                path: "object.ipv6_address".to_string(),
                args: vec![], // No need for args
                negate: false,
            },
            expected: true,
            text: "field is an ipv6 address".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: Request {
                detective_type: DetectiveType::DETECTIVE_TYPE_IPV6_ADDRESS,
                data: crate::test_utils::SAMPLE_JSON.as_bytes().to_vec(),
                path: "object.field".to_string(),
                args: vec![], // No need for args
                negate: false,
            },
            expected: false,
            text: "field is not an ipv6 address".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: Request {
                detective_type: DetectiveType::DETECTIVE_TYPE_IPV6_ADDRESS,
                data: crate::test_utils::SAMPLE_JSON.as_bytes().to_vec(),
                path: "object.non-existent-field".to_string(),
                args: vec![], // No need for args
                negate: false,
            },
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
            request: Request {
                detective_type: DetectiveType::DETECTIVE_TYPE_BOOLEAN_TRUE,
                data: crate::test_utils::SAMPLE_JSON.as_bytes().to_vec(),
                path: "boolean_t".to_string(),
                args: vec![], // No need for args
                negate: false,
            },
            expected: true,
            text: "field has a bool true".to_string(),
            should_error: false,
        },
        // crate::test_utils::TestCase {
        //     request: Request {
        //         detective_type: DetectiveType::DETECTIVE_TYPE_BOOLEAN_FALSE,
        //         data: crate::test_utils::SAMPLE_JSON.as_bytes().to_vec(),
        //         path: "boolean_f".to_string(),
        //         args: vec![], // No need for args
        //         negate: false,
        //     },
        //     expected: true,
        //     text: "field has a bool false".to_string(),
        //     should_error: false,
        // },
        // crate::test_utils::TestCase {
        //     request: Request {
        //         detective_type: DetectiveType::DETECTIVE_TYPE_BOOLEAN_FALSE,
        //         data: crate::test_utils::SAMPLE_JSON.as_bytes().to_vec(),
        //         path: "boolean_t".to_string(),
        //         args: vec![], // No need for args
        //         negate: false,
        //     },
        //     expected: false,
        //     text: "incorrect bool check".to_string(),
        //     should_error: false,
        // },
        // crate::test_utils::TestCase {
        //     request: Request {
        //         detective_type: DetectiveType::DETECTIVE_TYPE_BOOLEAN_FALSE,
        //         data: crate::test_utils::SAMPLE_JSON.as_bytes().to_vec(),
        //         path: "object".to_string(),
        //         args: vec![], // No need for args
        //         negate: false,
        //     },
        //     expected: false,
        //     text: "bool check should error on incorrect type".to_string(),
        //     should_error: true,
        // },
        // crate::test_utils::TestCase {
        //     request: Request {
        //         detective_type: DetectiveType::DETECTIVE_TYPE_BOOLEAN_FALSE,
        //         data: crate::test_utils::SAMPLE_JSON.as_bytes().to_vec(),
        //         path: "does-not-exist".to_string(),
        //         args: vec![], // No need for args
        //         negate: false,
        //     },
        //     expected: false,
        //     text: "bool check should error on non-existent field".to_string(),
        //     should_error: true,
        // },
    ];

    crate::test_utils::run_tests(&test_cases);
}

#[test]
fn regex() {
    let test_cases = vec![
        crate::test_utils::TestCase {
            request: Request {
                detective_type: DetectiveType::DETECTIVE_TYPE_REGEX,
                data: crate::test_utils::SAMPLE_JSON.as_bytes().to_vec(),
                path: "object.field".to_string(),
                args: vec![r#"^[a-zA-Z0-9]+$"#.to_string()],
                negate: false,
            },
            expected: true,
            text: "should match word".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: Request {
                detective_type: DetectiveType::DETECTIVE_TYPE_REGEX,
                data: crate::test_utils::SAMPLE_JSON.as_bytes().to_vec(),
                path: "object.number_as_string".to_string(),
                args: vec![r#"\d+"#.to_string()],
                negate: false,
            },
            expected: true,
            text: "should match number".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: Request {
                detective_type: DetectiveType::DETECTIVE_TYPE_REGEX,
                data: crate::test_utils::SAMPLE_JSON.as_bytes().to_vec(),
                path: "object.field".to_string(),
                args: vec![r#"\d+"#.to_string()],
                negate: false,
            },
            expected: false,
            text: "should not match number".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: Request {
                detective_type: DetectiveType::DETECTIVE_TYPE_REGEX,
                data: crate::test_utils::SAMPLE_JSON.as_bytes().to_vec(),
                path: "object.field".to_string(),
                args: vec![r#"\d+++]["#.to_string()],
                negate: false,
            },
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
            request: Request {
                detective_type: DetectiveType::DETECTIVE_TYPE_MAC_ADDRESS,
                data: crate::test_utils::SAMPLE_JSON.as_bytes().to_vec(),
                path: "object.mac_address".to_string(),
                args: vec![], // no args needed
                negate: false,
            },
            expected: true,
            text: "should match mac address".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: Request {
                detective_type: DetectiveType::DETECTIVE_TYPE_MAC_ADDRESS,
                data: crate::test_utils::SAMPLE_JSON.as_bytes().to_vec(),
                path: "object.field".to_string(),
                args: vec![], // no args needed
                negate: false,
            },
            expected: false,
            text: "should NOT match mac address".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: Request {
                detective_type: DetectiveType::DETECTIVE_TYPE_MAC_ADDRESS,
                data: crate::test_utils::SAMPLE_JSON.as_bytes().to_vec(),
                path: "object.does_not_exist".to_string(),
                args: vec![], // no args needed
                negate: false,
            },
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
            request: Request {
                detective_type: DetectiveType::DETECTIVE_TYPE_UUID,
                data: crate::test_utils::SAMPLE_JSON.as_bytes().to_vec(),
                path: "object.uuid_dash".to_string(),
                args: vec![], // no args needed
                negate: false,
            },
            expected: true,
            text: "should match uuid with dashes".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: Request {
                detective_type: DetectiveType::DETECTIVE_TYPE_UUID,
                data: crate::test_utils::SAMPLE_JSON.as_bytes().to_vec(),
                path: "object.uuid_colon".to_string(),
                args: vec![], // no args needed
                negate: false,
            },
            expected: true,
            text: "should match uuid with colons".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: Request {
                detective_type: DetectiveType::DETECTIVE_TYPE_UUID,
                data: crate::test_utils::SAMPLE_JSON.as_bytes().to_vec(),
                path: "object.uuid_stripped".to_string(),
                args: vec![], // no args needed
                negate: false,
            },
            expected: true,
            text: "should match uuid with no separators".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: Request {
                detective_type: DetectiveType::DETECTIVE_TYPE_UUID,
                data: crate::test_utils::SAMPLE_JSON.as_bytes().to_vec(),
                path: "object.field".to_string(),
                args: vec![], // no args needed
                negate: false,
            },
            expected: false,
            text: "should NOT match uuid".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: Request {
                detective_type: DetectiveType::DETECTIVE_TYPE_UUID,
                data: crate::test_utils::SAMPLE_JSON.as_bytes().to_vec(),
                path: "object.does_not_exist".to_string(),
                args: vec![], // no args needed
                negate: false,
            },
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
        //     request: Request{     //         DetectiveType::DETECTIVE_TYPE_TIMESTAMP_UNIX,
        //         "timestamp_unix_str",
        //         vec![], // no args needed
        //         false,
        //     ),
        //     expected: true,
        //     text: "timestamp str should be true".to_string(),
        //     should_error: false,
        // },
        crate::test_utils::TestCase {
            request: Request {
                detective_type: DetectiveType::DETECTIVE_TYPE_TIMESTAMP_UNIX,
                data: crate::test_utils::SAMPLE_JSON.as_bytes().to_vec(),
                path: "timestamp_unix_num".to_string(),
                args: vec![], // no args needed
                negate: false,
            },
            expected: true,
            text: "timestamp num should be true".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: Request {
                detective_type: DetectiveType::DETECTIVE_TYPE_TIMESTAMP_UNIX,
                data: crate::test_utils::SAMPLE_JSON.as_bytes().to_vec(),
                path: "object.field".to_string(),
                args: vec![], // no args needed
                negate: false,
            },
            expected: false,
            text: "non-ts field should be false".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: Request {
                detective_type: DetectiveType::DETECTIVE_TYPE_TIMESTAMP_UNIX,
                data: crate::test_utils::SAMPLE_JSON.as_bytes().to_vec(),
                path: "unknown_field_123".to_string(),
                args: vec![], // no args needed
                negate: false,
            },
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
            request: Request {
                detective_type: DetectiveType::DETECTIVE_TYPE_TIMESTAMP_UNIX_NANO,
                data: crate::test_utils::SAMPLE_JSON.as_bytes().to_vec(),
                path: "timestamp_unix_nano_str".to_string(),
                args: vec![], // no args needed
                negate: false,
            },
            expected: true,
            text: "should match nano ts str".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: Request {
                detective_type: DetectiveType::DETECTIVE_TYPE_TIMESTAMP_UNIX_NANO,
                data: crate::test_utils::SAMPLE_JSON.as_bytes().to_vec(),
                path: "timestamp_unix_nano_num".to_string(),
                args: vec![], // no args needed
                negate: false,
            },
            expected: true,
            text: "should match nano ts num".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: Request {
                detective_type: DetectiveType::DETECTIVE_TYPE_TIMESTAMP_UNIX_NANO,
                data: crate::test_utils::SAMPLE_JSON.as_bytes().to_vec(),
                path: "object.field".to_string(),
                args: vec![], // no args needed
                negate: false,
            },
            expected: false,
            text: "should not error on non-ts value".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: Request {
                detective_type: DetectiveType::DETECTIVE_TYPE_TIMESTAMP_UNIX_NANO,
                data: crate::test_utils::SAMPLE_JSON.as_bytes().to_vec(),
                path: "does-not-exist".to_string(),
                args: vec![], // no args needed
                negate: false,
            },
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
            request: Request {
                detective_type: DetectiveType::DETECTIVE_TYPE_TIMESTAMP_RFC3339,
                data: crate::test_utils::SAMPLE_JSON.as_bytes().to_vec(),
                path: "timestamp_rfc3339".to_string(),
                args: vec![], // no args needed
                negate: false,
            },
            expected: true,
            text: "should match rfc3339 ts".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: Request {
                detective_type: DetectiveType::DETECTIVE_TYPE_TIMESTAMP_RFC3339,
                data: crate::test_utils::SAMPLE_JSON.as_bytes().to_vec(),
                path: "timestamp_unix_str".to_string(),
                args: vec![], // no args needed
                negate: false,
            },
            expected: false,
            text: "should not match non-rfc3339 ts".to_string(),
            should_error: false,
        },
        crate::test_utils::TestCase {
            request: Request {
                detective_type: DetectiveType::DETECTIVE_TYPE_TIMESTAMP_RFC3339,
                data: crate::test_utils::SAMPLE_JSON.as_bytes().to_vec(),
                path: "unknown-field-123".to_string(),
                args: vec![], // no args needed
                negate: false,
            },
            expected: false,
            text: "unknown field should error".to_string(),
            should_error: true,
        },
    ];

    crate::test_utils::run_tests(&test_cases);
}
