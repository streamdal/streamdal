use crate::detective::Request;
use lazy_static::lazy_static;
use protos::sp_steps_detective::DetectiveType;

pub const SAMPLE_JSON: &str = r#"{
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
        "empty_array": [],
        "semver": "1.2.3",
        "valid_hostname": "example.com",
        "invalid_hostname": "-example.com."
        "email_plain_valid": "test@example.com",
        "email_plain_invalid": "test@example",
        "email_unicode_domain_valid": "test@日本.com",
        "email_unicode_domain_invalid": "test@日本",
        "email_unicode_local_valid": "日本@example.com",
        "email_unicode_local_invalid": "日本@example",
        "credit_card": {
            "visa": {
                "valid": "4111111111111111",
                "invalid": "4111111111111112",
            },
            "mastercard": {
                "valid": "5555555555554444",
                "invalid": "5555555555554445",
            },
            "amex": {
                "valid": "378282246310005",
                "invalid": "378282246310006",
            },
            "discover": {
                "valid": "6011111111111117",
                "invalid": "6011111111111118",
            },
            "diners_club": {
                "valid": "30569309025904",
                "invalid": "30569309025905",
            },
            "jcb": {
                "valid": "3530111333300000",
                "invalid": "3530111333300001",
            },
            "unionpay": {
                "valid": "6200000000000005",
                "invalid": "6200000000000006",
            }
        }
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

lazy_static! {
    pub static ref SAMPLE_JSON_BYTES: Vec<u8> = SAMPLE_JSON.as_bytes().to_vec();
}

pub struct TestCase<'a> {
    pub request: Request<'a>,
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

pub fn generate_request_for_bench(
    detective_type: DetectiveType,
    path: &str,
    args: Vec<String>,
) -> Request {
    Request {
        match_type: detective_type,
        data: &SAMPLE_JSON_BYTES,
        path: path.to_string(),
        args,
        negate: false,
    }
}
