use jsonschema_valid::schemas::Draft::*;
use protos::sp_steps_schema_validation::JSONSchemaDraft::*;
use protos::sp_steps_schema_validation::SchemaValidationCondition::*;
use protos::sp_steps_schema_validation::SchemaValidationType::*;
use protos::sp_wsm::{WASMExitCode, WASMRequest};

#[no_mangle]
pub extern "C" fn f(ptr: *mut u8, length: usize) -> u64 {
    // Read request
    let wasm_request = match common::read_request(ptr, length) {
        Ok(req) => req,
        Err(e) => {
            return common::write_response(
                None,
                None,
                None,
                WASMExitCode::WASM_EXIT_CODE_ERROR,
                e.to_string(),
            );
        }
    };

    // Validate request
    if let Err(err) = validate_wasm_request(&wasm_request) {
        return common::write_response(
            Some(wasm_request.input_payload.as_slice()),
            None,
            None,
            WASMExitCode::WASM_EXIT_CODE_ERROR,
            format!("invalid step: {}", err.to_string()),
        );
    };

    return match wasm_request
        .step
        .schema_validation()
        .type_
        .enum_value_or_default()
    {
        SCHEMA_VALIDATION_TYPE_JSONSCHEMA => validate_json_schema(&wasm_request),
        _ => {
            return common::write_response(
                Some(wasm_request.input_payload.as_slice()),
                None,
                None,
                WASMExitCode::WASM_EXIT_CODE_ERROR,
                "schema type is required".to_string(),
            );
        }
    };
}
fn validate_json_schema(wasm_request: &WASMRequest) -> u64 {
    let parsed_json = match serde_json::from_slice(&wasm_request.input_payload) {
        Ok(json) => json,
        Err(err) => {
            return common::write_response(
                Some(wasm_request.input_payload.as_slice()),
                None,
                None,
                WASMExitCode::WASM_EXIT_CODE_ERROR,
                format!("invalid payload json: {}", err),
            );
        }
    };

    let js = wasm_request.step.schema_validation().json_schema();
    let draft = draft_from_proto(js.draft.enum_value_or_default());

    let schema = match serde_json::from_slice(&js.json_schema) {
        Ok(schema) => schema,
        Err(err) => {
            return common::write_response(
                Some(wasm_request.input_payload.as_slice()),
                None,
                None,
                WASMExitCode::WASM_EXIT_CODE_ERROR,
                format!("invalid json schema: {}", err),
            );
        }
    };

    let compiled_schema = match jsonschema_valid::Config::from_schema(&schema, Some(draft)) {
        Ok(schema) => schema,
        Err(err) => {
            return common::write_response(
                Some(wasm_request.input_payload.as_slice()),
                None,
                None,
                WASMExitCode::WASM_EXIT_CODE_ERROR,
                format!("invalid json schema: {}", err),
            );
        }
    };

    let mut err_str = String::new();

    let is_match = match compiled_schema.validate(&parsed_json) {
        Ok(_) => true,
        Err(err) => {
            for error in err {
                err_str.push_str(&format!(
                    "{}: expected type={}; got value={},",
                    &error.instance_path.join("."),
                    &error.schema.unwrap().get("type").unwrap().as_str().unwrap(),
                    &error.instance.unwrap()
                ));
            }

            false
        }
    };

    let condition = wasm_request
        .step
        .schema_validation()
        .condition
        .enum_value_or_default();

    return match condition {
        SCHEMA_VALIDATION_CONDITION_MATCH => {
            if is_match {
                common::write_response(
                    Some(wasm_request.input_payload.as_slice()),
                    None,
                    None,
                    WASMExitCode::WASM_EXIT_CODE_TRUE,
                    "payload matches schema".to_string(),
                )
            } else {
                common::write_response(
                    Some(wasm_request.input_payload.as_slice()),
                    None,
                    None,
                    WASMExitCode::WASM_EXIT_CODE_ERROR,
                    format!(
                        "payload does not match schema, invalid fields: {}",
                        err_str.trim_end_matches(',')
                    ),
                )
            }
        }
        SCHEMA_VALIDATION_CONDITION_NOT_MATCH => {
            if is_match {
                common::write_response(
                    Some(wasm_request.input_payload.as_slice()),
                    None,
                    None,
                    WASMExitCode::WASM_EXIT_CODE_ERROR,
                    "payload matches schema".to_string(),
                )
            } else {
                common::write_response(
                    Some(wasm_request.input_payload.as_slice()),
                    None,
                    None,
                    WASMExitCode::WASM_EXIT_CODE_TRUE,
                    format!(
                        "payload does not match schema, invalid fields: {}",
                        err_str.trim_end_matches(',')
                    ),
                )
            }
        }
        SCHEMA_VALIDATION_CONDITION_UNKNOWN => common::write_response(
            Some(wasm_request.input_payload.as_slice()),
            None,
            None,
            WASMExitCode::WASM_EXIT_CODE_ERROR,
            "schema validation condition is required".to_string(),
        ),
    };
}

fn validate_wasm_request(req: &WASMRequest) -> Result<(), String> {
    if !req.step.has_schema_validation() {
        return Err("schema_validation is required".to_string());
    }

    if req.input_payload.is_empty() {
        return Err("payload cannot be empty".to_string());
    }

    if req.step.schema_validation().type_.enum_value_or_default() == SCHEMA_VALIDATION_TYPE_UNKNOWN
    {
        return Err("schema type is required".to_string());
    }

    // Currently we only support json schema
    match req.step.schema_validation().type_.enum_value_or_default() {
        SCHEMA_VALIDATION_TYPE_JSONSCHEMA => {
            if !req.step.schema_validation().has_json_schema() {
                return Err("json_schema is required".to_string());
            }

            if req
                .step
                .schema_validation()
                .json_schema()
                .draft
                .enum_value_or_default()
                == JSONSCHEMA_DRAFT_UNKNOWN
            {
                return Err("json_schema draft is required".to_string());
            }
        }
        _ => return Err("unsupported schema type".to_string()),
    }

    Ok(())
}

fn draft_from_proto(
    draft: protos::sp_steps_schema_validation::JSONSchemaDraft,
) -> jsonschema_valid::schemas::Draft {
    match draft {
        JSONSCHEMA_DRAFT_04 => Draft4,
        JSONSCHEMA_DRAFT_06 => Draft6,
        JSONSCHEMA_DRAFT_07 => Draft7,
        _ => Draft7,
    }
}

/// # Safety
///
/// This is unsafe because it operates on raw memory; see `common/src/lib.rs`.
#[no_mangle]
pub unsafe extern "C" fn alloc(size: i32) -> *mut u8 {
    common::alloc(size)
}

/// # Safety
///
/// This is unsafe because it operates on raw memory; see `common/src/lib.rs`.
#[no_mangle]
pub unsafe extern "C" fn dealloc(pointer: *mut u8, size: i32) {
    common::dealloc(pointer, size)
}
