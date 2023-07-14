use protos::pipeline::{WASMExitCode, WASMRequest};
use protos::transform::TransformType;
use snitch_transform::transform;

#[no_mangle]
pub extern "C" fn f(ptr: *mut u8, length: usize) -> *mut u8 {
    // Read request
    let wasm_request = match common::read_request(ptr, length) {
        Ok(req) => req,
        Err(e) => panic!("unable to read request: {}", e), // TODO: Should write response here
    };

    // Validate request
    if let Err(err) = validate_wasm_request(&wasm_request) {
        panic!("invalid step: {}", err) // TODO: Should write response here
    }

    // Generate snitch-transform request
    let transform_request = generate_transform_request(&wasm_request);

    // Run request against snitch-transform
    let result = match wasm_request.step.transform().type_.unwrap() {
        TransformType::TRANSFORM_TYPE_REPLACE_VALUE => transform::overwrite(&transform_request),
        TransformType::TRANSFORM_TYPE_MASK_VALUE => transform::mask(&transform_request),
        TransformType::TRANSFORM_TYPE_OBFUSCATE_VALUE => transform::obfuscate(&transform_request),
        _ => {
            return common::write_response(
                &wasm_request.input,
                WASMExitCode::WASM_EXIT_CODE_FAILURE,
                "Unknown transform type".to_string(),
            )
        }
    };

    // Inspect result and return potentially transformed payload
    match result {
        Ok(data) => common::write_response(
            &data.into_bytes(),
            WASMExitCode::WASM_EXIT_CODE_SUCCESS,
            "Successfully transformed payload".to_string(),
        ),
        Err(err) => common::write_response(
            &wasm_request.input,
            WASMExitCode::WASM_EXIT_CODE_FAILURE,
            format!("Unable to transform payload: {:?}", err),
        ),
    }
}

fn generate_transform_request(wasm_request: &WASMRequest) -> transform::Request {
    transform::Request {
        data: wasm_request.input.clone(),
        path: wasm_request.step.transform().path.clone(),
        value: wasm_request.step.transform().value.clone(),
    }
}

fn validate_wasm_request(req: &WASMRequest) -> Result<(), String> {
    if req.input.is_empty() {
        return Err("input cannot be empty".to_string());
    }

    if !req.step.has_transform() {
        return Err("transform is required".to_string());
    }

    if req.step.transform().type_.unwrap() == TransformType::TRANSFORM_TYPE_UNKNOWN {
        return Err("transform type cannot be unknown".to_string());
    }

    if req.step.transform().path.is_empty() {
        return Err("transform path cannot be empty".to_string());
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
