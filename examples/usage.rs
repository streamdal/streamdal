use protobuf::EnumOrUnknown;
use protos::matcher::{MatchRequest, MatchType};
use snitch_detective::detective;
// use snitch_detective::protos;
// use snitch_detective::protos::matcher::MatchType;
// use snitch_detective::protos::matcher::MatchType::MATCH_TYPE_BOOLEAN_FALSE;

fn main() {
    // How to create an instance of detective
    let det = detective::Detective::new();

    let sample_json = r#"{
        "field1": {
            "field2": "2"
        }
    }"#;

    let match_request = MatchRequest {
        data: sample_json.as_bytes().to_vec(),
        path: "field1.field2".to_string(),
        args: vec!["1".to_string()],
        negate: false,
        type_: EnumOrUnknown::from(MatchType::MATCH_TYPE_NUMERIC_GREATER_THAN),
        special_fields: Default::default(),
    };

    // println!("At create time: {:#?}", match_request);
    //
    // // How to serialize to bytes
    // let data = Message::write_to_bytes(&match_request).unwrap();
    //
    // // How to deserialize (approach 1)
    // let deserialized: MatchRequest = Message::parse_from_bytes(&data).unwrap();
    //
    // println!("Deserialized: {:#?}", deserialized);
    //
    // // How to deserialize (approach 2)
    // let deserialized_2 = MatchRequest::parse_from_bytes(&data).unwrap();
    //
    // println!("deserialized 2: {:#?}", deserialized_2);
    //
    // // How to print protobuf as JSON
    // let stuff = protobuf_json_mapping::print_to_string(&match_request).unwrap();
    // println!("Stuff: {}", stuff);

    match det.matches(&match_request) {
        Ok(value) => println!("Result: {:#?}", value),
        Err(err) => println!("Error: {:#?}", err),
    }
}
