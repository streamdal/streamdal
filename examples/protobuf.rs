use protobuf::{EnumOrUnknown, Message};
use protobuf_json_mapping::PrintOptions;
use protos::matcher::{MatchRequest, MatchType};

fn main() {
    let match_request = MatchRequest {
        data: "test".as_bytes().to_vec(),
        path: "field1.field2".to_string(),
        args: vec![],
        negate: false,
        type_: protobuf::EnumOrUnknown::from(MatchType::MATCH_TYPE_BOOLEAN_FALSE),
        special_fields: Default::default(),
    };

    print("At create time", &match_request);

    // How to serialize to bytes
    let data = Message::write_to_bytes(&match_request).unwrap();

    print("Serialized", &data);

    // How to deserialize (approach 1)
    let deserialized: MatchRequest = Message::parse_from_bytes(&data).unwrap();

    print("Deserialized 1", &deserialized);

    // How to deserialize (approach 2)
    let deserialized_2 = MatchRequest::parse_from_bytes(&data).unwrap();

    print("deserialized 2", &deserialized_2);

    // How to print protobuf as JSON
    let stuff = protobuf_json_mapping::print_to_string(&match_request).unwrap();

    print("As JSON", &stuff);

    let stuff2 = protobuf_json_mapping::print_to_string_with_options(
        &match_request,
        &PrintOptions {
            enum_values_int: true,
            proto_field_name: false,
            always_output_default_values: false,
            _future_options: (),
        },
    )
    .unwrap();

    print("As JSON (with enum as int)", &stuff2);
}

fn print<T: std::fmt::Debug>(msg: &str, val: T) {
    println!("\n\n========={}============\n\n {:#?}", msg, val);
}
