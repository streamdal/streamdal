use protos::sp_wsm::{WASMExitCode, WASMRequest};
use serde_json;

#[no_mangle]
pub extern "C" fn f(ptr: *mut u8, length: usize) -> u64 {
    // Read request
    let wasm_request = match common::read_request(ptr, length) {
        Ok(req) => req,
        Err(e) => {
            return common::write_response(
                None,
                None,
                WASMExitCode::WASM_EXIT_CODE_INTERNAL_ERROR,
                format!("unable to read request: {}", e),
            );
        }
    };

    // Validate request
    if let Err(err) = validate_wasm_request(&wasm_request) {
        common::write_response(
            None,
            None,
            WASMExitCode::WASM_EXIT_CODE_INTERNAL_ERROR,
            format!("step validation failed: {}", err),
        );
    }

    // Validate JSON
    return match serde_json::from_slice(&wasm_request.input_payload) {
        Ok(json) => {
            common::write_response(
                Some(json),
                None,
                WASMExitCode::WASM_EXIT_CODE_SUCCESS,
                "".to_string(),
            )
        },
        Err(e) => {
            common::write_response(
                None,
                None,
                WASMExitCode::WASM_EXIT_CODE_FAILURE,
                format!("invalid JSON: {}", e),
            )
        }
    };
}

fn validate_wasm_request(req: &WASMRequest) -> Result<(), String> {
    if req.input_payload.is_empty() {
        return Err("input cannot be empty".to_string());
    }

    if !req.step.has_valid_json() {
        return Err("valid_json is required".to_string());
    }

    Ok(())
}