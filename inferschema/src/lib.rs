use std::str::from_utf8;
use protos::sp_wsm::{WASMExitCode, WASMRequest};
use infers_jsonschema::infer;

#[no_mangle]
pub extern "C" fn f(ptr: *mut u8, length: usize) -> *mut u8 {
    // Read request
    let wasm_request = match common::read_request(ptr, length) {
        Ok(req) => req,
        Err(e) => {
            return common::write_response(
                None,
                None,
                WASMExitCode::WASM_EXIT_CODE_FAILURE,
                e.to_string(),
            );
        }
    };

    // Validate request
    if let Err(err) = validate_wasm_request(&wasm_request) {
        return common::write_response(
            Some(wasm_request.input_payload.as_slice()),
            None,
            WASMExitCode::WASM_EXIT_CODE_FAILURE,
            format!("invalid step: {}", err.to_string()),
        );
    };

    let payload = match from_utf8(wasm_request.input_payload.as_slice()) {
        Ok(json) => json,
        Err(err) => {
            return common::write_response(
                Some(wasm_request.input_payload.as_slice()),
                None,
                WASMExitCode::WASM_EXIT_CODE_FAILURE,
                format!("invalid json: {}", err.to_string()),
            );
        }
    };

    let parsed_json = match serde_json::from_str(payload) {
        Ok(json) => json,
        Err(err) => {
            return common::write_response(
                Some(wasm_request.input_payload.as_slice()),
                None,
                WASMExitCode::WASM_EXIT_CODE_FAILURE,
                format!("invalid json: {}", err.to_string()),
            );
        }
    };

    let payload_schema = infer(&parsed_json);

    // If no previous schema is provided, infer and return the generated schema
    if wasm_request.step.infer_schema().current_schema.is_empty() {
        return common::write_response(
            Some(wasm_request.input_payload.as_slice()),
            Some(payload_schema.to_string().as_bytes()),
            WASMExitCode::WASM_EXIT_CODE_SUCCESS,
            "inferred fresh schema".to_string(),
        );
    }

    let current_schema_data = match from_utf8(wasm_request.step.infer_schema().current_schema.as_slice()) {
        Ok(json) => json,
        Err(err) => {
            return common::write_response(
                Some(wasm_request.input_payload.as_slice()),
                None,
                WASMExitCode::WASM_EXIT_CODE_FAILURE,
                format!("unable to parse: {}", err.to_string()),
            );
        }
    };

    let current_schema = match serde_json::from_str(current_schema_data) {
        Ok(json) => json,
        Err(err) => {
            return common::write_response(
                Some(wasm_request.input_payload.as_slice()),
                None,
                WASMExitCode::WASM_EXIT_CODE_FAILURE,
                format!("unable to parse: {}", err.to_string()),
            );
        }
    };

    // Perform diff
    let diff = serde_json_diff::values(
        payload_schema.clone(),
        current_schema,
    );

    if diff.is_some() {
        return common::write_response(
            Some(wasm_request.input_payload.as_slice()),
            Some(payload_schema.clone().to_string().as_bytes()),
            WASMExitCode::WASM_EXIT_CODE_SUCCESS,
            "schema has changed".to_string(),
        )
    }

    return common::write_response(
        Some(wasm_request.input_payload.as_slice()),
        None,
        WASMExitCode::WASM_EXIT_CODE_SUCCESS,
        "schema has not changed".to_string(),
    )
}

fn validate_wasm_request(req: &WASMRequest) -> Result<(), String> {
    if !req.step.has_infer_schema() {
        return Err("httprequest is required".to_string());
    }

    if req.input_payload.is_empty() {
        return Err("payload cannot be empty".to_string());
    }

    Ok(())
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
