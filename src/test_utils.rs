use protos::detective::{DetectiveStep, DetectiveType};

pub struct TestCase {
    pub request: DetectiveStep,
    pub expected: bool,
    pub should_error: bool,
    pub text: String,
}

pub fn run_tests(test_cases: &Vec<TestCase>) {
    for case in test_cases {
        let result = crate::detective::Detective::new().matches(&case.request);

        if case.should_error {
            assert_eq!(result.is_err(), true, "{}", case.text);
        } else {
            assert_eq!(result.unwrap(), case.expected, "{}", case.text);
        }
    }
}

pub fn generate_request(
    detective_type: DetectiveType,
    path: &str,
    args: Vec<String>,
    negate: bool,
) -> DetectiveStep {
    let sample_json = r#"{
    "boolean_t": true,
    "boolean_f": false,
    "object": {
        "ipv4_address": "127.0.0.1",
        "ipv6_address": "2001:0db8:85a3:0000:0000:8a2e:0370:7334",
        "mac_address": "00-B0-D0-63-C2-26",
        "uuid_dash": "550e8400-e29b-41d4-a716-446655440000",
        "uuid_colon": "550e8400:e29b:41d4:a716:446655440000",
        "uuid_stripped": "550e8400e29b41d4a716446655440000",
        "number_as_string": "1234",
        "field": "value",
        "empty_string": "",
        "null_field": null,
        "empty_array": []
    },
    "array": [
        "value1",
        "value2"
    ],
    "number_int": 100,
    "number_float": 100.1,
    "timestamp_unix_str": "1614556800",
    "timestamp_unix_num": 1614556800,
    "timestamp_unix_nano_str": "1614556800000000000",
    "timestamp_unix_nano_num": 1614556800000000000,
    "timestamp_rfc3339": "2023-06-29T12:34:56Z",
}"#;

    DetectiveStep {
        input: sample_json.as_bytes().to_vec(),
        path: path.to_string(),
        args,
        negate,
        type_: protobuf::EnumOrUnknown::from(detective_type),
        conditions: vec![],
        special_fields: Default::default(),
    }
}
