use protobuf::EnumOrUnknown;
use protos::detective::{DetectiveStep, DetectiveType};
use snitch_detective::detective;
// use snitch_detective::protos;
// use snitch_detective::protos::detective::DetectiveType;
// use snitch_detective::protos::detective::DetectiveType::DETECTIVE_TYPE_BOOLEAN_FALSE;

fn main() {
    // How to create an instance of detective
    let det = detective::Detective::new();

    let sample_json = r#"{
        "field1": {
            "field2": "2"
        }
    }"#;

    let detective_step = DetectiveStep {
        input: sample_json.as_bytes().to_vec(),
        path: "*".to_string(),
        args: vec!["1".to_string()],
        negate: false,
        type_: EnumOrUnknown::from(DetectiveType::DETECTIVE_TYPE_PII_ANY),
        conditions: vec![],
        special_fields: Default::default(),
    };

    // println!("At create time: {:#?}", detective_step);
    //
    // // How to serialize to bytes
    // let data = Message::write_to_bytes(&detective_step).unwrap();
    //
    // // How to deserialize (approach 1)
    // let deserialized: DetectiveStep = Message::parse_from_bytes(&data).unwrap();
    //
    // println!("Deserialized: {:#?}", deserialized);
    //
    // // How to deserialize (approach 2)
    // let deserialized_2 = DetectiveStep::parse_from_bytes(&data).unwrap();
    //
    // println!("deserialized 2: {:#?}", deserialized_2);
    //
    // // How to print protobuf as JSON
    // let stuff = protobuf_json_mapping::print_to_string(&detective_step).unwrap();
    // println!("Stuff: {}", stuff);

    match det.matches(&detective_step) {
        Ok(value) => println!("Result: {:#?}", value),
        Err(err) => println!("Error: {:#?}", err),
    }
}
