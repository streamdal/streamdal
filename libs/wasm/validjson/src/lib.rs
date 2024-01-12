use protos::sp_wsm::{WASMExitCode, WASMRequest};
use streamdal_gjson;

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
            None,
            WASMExitCode::WASM_EXIT_CODE_INTERNAL_ERROR,
            format!("step validation failed: {}", err),
        );
    }

    let orig_payload = wasm_request.input_payload.as_slice();

    let str_json = match String::from_utf8(orig_payload.to_vec()) {
        Ok(v) => v,
        Err(e) => {
            return common::write_response(
                None,
                None,
                None,
                WASMExitCode::WASM_EXIT_CODE_INTERNAL_ERROR,
                format!("unable to convert input_payload to string: {}", e),
            );
        }
    };

    if streamdal_gjson::valid(str_json.as_str()) {
        common::write_response(
            Some(orig_payload),
            None,
            None,
            WASMExitCode::WASM_EXIT_CODE_SUCCESS,
            "".to_string(),
        )
    } else {
        common::write_response(
            Some(orig_payload),
            None,
            None,
            WASMExitCode::WASM_EXIT_CODE_FAILURE,
            "invalid JSON".to_string(),
        )
    }
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
