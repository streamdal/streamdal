use protos::detective::DetectiveType;
use snitch_detective::detective;
use snitch_detective::detective::Request;

fn main() {
    let det = detective::Detective::new();

    let sample_json = r#"{
        "field1": {
            "field2": "2"
        }
    }"#;

    let request = Request {
        match_type: DetectiveType::DETECTIVE_TYPE_HAS_FIELD,
        data: sample_json.as_bytes().to_vec(),
        path: "field1".to_string(),
        args: vec!["1".to_string()],
        negate: false,
    };

    match det.matches(&request) {
        Ok(value) => println!("Result: {:#?}", value),
        Err(err) => println!("Error: {:#?}", err),
    }
}
