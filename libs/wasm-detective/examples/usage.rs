use protos::sp_pipeline::PipelineDataFormat::PIPELINE_DATA_FORMAT_JSON;
use protos::sp_steps_detective::DetectiveType;
use streamdal_wasm_detective::detective;
use streamdal_wasm_detective::detective::Request;

use protos::sp_steps_detective::DetectiveTypePIIKeywordMode::DETECTIVE_TYPE_PII_KEYWORD_MODE_UNSET;

fn main() {
    let det = detective::Detective::new();

    let sample_json = r#"{
        "field1": {
            "field2": "2"
        }
    }"#;

    let request = Request {
        match_type: DetectiveType::DETECTIVE_TYPE_HAS_FIELD,
        data: &sample_json.as_bytes().to_vec(),
        path: "field1".to_string(),
        args: vec!["1".to_string()],
        negate: false,
        mode: DETECTIVE_TYPE_PII_KEYWORD_MODE_UNSET,
        data_format: PIPELINE_DATA_FORMAT_JSON,
    };

    match det.matches(&request) {
        Ok(value) => println!("Result: {:#?}", value),
        Err(err) => println!("Error: {:#?}", err),
    }
}
