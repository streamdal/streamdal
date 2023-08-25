use protobuf::EnumOrUnknown;
use protos::sp_steps_detective::DetectiveType;
use protos::sp_wsm::{WASMExitCode, WASMRequest};
use snitch_detective::detective::{Detective, Request};

#[no_mangle]
pub extern "C" fn f(ptr: *mut u8, length: usize) -> *mut u8 {
    // Read request
    let wasm_request = match common::read_request(ptr, length, true) {
        Ok(req) => req,
        Err(e) => panic!("unable to read request: {}", e), // TODO: Should write response here
    };

    // Validate request
    if let Err(err) = validate_wasm_request(&wasm_request) {
        panic!("invalid step: {}", err) // TODO: Should write response here
    }

    // Generate detective request
    let req = generate_detective_request(&wasm_request);

    // Run request against detective
    match Detective::new().matches(&req) {
        Ok(match_result) => {
            let mut exit_code = WASMExitCode::WASM_EXIT_CODE_FAILURE;

            if match_result {
                exit_code = WASMExitCode::WASM_EXIT_CODE_SUCCESS;
            }

            common::write_response(&req.data, exit_code, "completed detective run".to_string())
        }
        Err(e) => common::write_response(
            &req.data,
            WASMExitCode::WASM_EXIT_CODE_INTERNAL_ERROR,
            e.to_string(),
        ),
    }
}

fn generate_detective_request(wasm_request: &WASMRequest) -> Request {
    Request {
        match_type: wasm_request.step.detective().type_.clone().unwrap(),
        data: &wasm_request.input,
        path: wasm_request.step.detective().path.clone().unwrap(),
        args: wasm_request.step.detective().args.clone(),
        negate: wasm_request.step.detective().negate.clone().unwrap(),
    }
}

fn validate_wasm_request(req: &WASMRequest) -> Result<(), String> {
    if req.input.is_empty() {
        return Err("input cannot be empty".to_string());
    }

    if !req.step.has_detective() {
        return Err("detective is required".to_string());
    }

    if req.step.detective().type_ == EnumOrUnknown::from(DetectiveType::DETECTIVE_TYPE_UNKNOWN) {
        return Err("detective type cannot be unknown".to_string());
    }

    if req.step.detective().path.clone().unwrap() == "" {
        return Err("detective path cannot be empty".to_string());
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
