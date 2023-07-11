use protos::detective::DetectiveType;
use snitch_detective::detective;

fn main() {
    let det = detective::Detective::new();

    let sample_json = r#"{
        "field1": {
            "field2": "2"
        }
    }"#;

    match det.matches(
        DetectiveType::DETECTIVE_TYPE_HAS_FIELD,
        &sample_json.as_bytes().to_vec(),
        &"field1".to_string(),
        &vec!["1".to_string()],
        false,
    ) {
        Ok(value) => println!("Result: {:#?}", value),
        Err(err) => println!("Error: {:#?}", err),
    }
}
