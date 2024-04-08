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
            WASMExitCode::WASM_EXIT_CODE_ERROR,
            format!("invalid wasm request: {}", err),
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
                WASMExitCode::WASM_EXIT_CODE_ERROR,
                format!("unable to convert input_payload to string: {}", e),
            );
        }
    };

    println!("Input payload: {}", str_json);
    println!("Input args: {:?}", wasm_request.step.custom().args);

    return common::write_response(
        None,
        None,
        None,
        WASMExitCode::WASM_EXIT_CODE_TRUE,
        "success".to_string(),
    );
}

fn validate_wasm_request(req: &WASMRequest) -> Result<(), String> {
    if req.input_payload.is_empty() {
        return Err("input cannot be empty".to_string());
    }

    if !req.step.has_custom() {
        return Err("custom is required".to_string());
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
