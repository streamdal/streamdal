use protos::matcher::{MatchRequest, MatchType};

pub struct TestCase {
    pub request: MatchRequest,
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
    match_type: MatchType,
    path: &str,
    args: Vec<String>,
    negate: bool,
) -> MatchRequest {
    let sample_json = r#"{
    "boolean_t": true,
    "boolean_f": false,
    "object": {
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
