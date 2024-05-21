use protobuf::EnumOrUnknown;
use protos::sp_steps_detective::DetectiveType;
use protos::sp_wsm::inter_step_result::Input_from;
use protos::sp_wsm::{InterStepResult, WASMExitCode, WASMRequest};
use streamdal_wasm_detective::detective::{Detective, Request};

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
            )
        }
    };

    // Validate request
    if let Err(err) = validate_wasm_request(&wasm_request) {
        return common::write_response(
            None,
            None,
            None,
            WASMExitCode::WASM_EXIT_CODE_ERROR,
            format!("invalid wasm request: {}", err),
        )
    }

    // Generate detective request
    let req = generate_detective_request(&wasm_request);

    // Run request against detective
    match Detective::new().matches(&req) {
        Ok(match_result) => {
            if match_result.is_empty() {
                return common::write_response(
                    Some(&req.data),
                    None,
                    None,
                    WASMExitCode::WASM_EXIT_CODE_FALSE,
                    "completed detective run".to_string(),
                )
            }

            let isr = InterStepResult {
                input_from: Some(Input_from::DetectiveResult(
                    protos::sp_steps_detective::DetectiveStepResult {
                        matches: match_result,
                        special_fields: Default::default(),
                    },
                )),
                ..Default::default()
            };

            return common::write_response(
                Some(&req.data),
                None,
                Some(isr),
                WASMExitCode::WASM_EXIT_CODE_TRUE,
                "completed detective run".to_string(),
            )

        },
        Err(e) => common::write_response(
            Some(&req.data),
            None,
            None,
            WASMExitCode::WASM_EXIT_CODE_FALSE,
            e.to_string(),
        )
    }
}

fn generate_detective_request(wasm_request: &WASMRequest) -> Request {
    let path = wasm_request
        .step
        .detective()
        .path
        .clone()
        .unwrap_or_else(|| "".to_string());

    Request {
        data_format: wasm_request.data_format.clone().unwrap(),
        match_type: wasm_request.step.detective().type_.clone().unwrap(),
        data: &wasm_request.input_payload,
        path: path,
        args: wasm_request.step.detective().args.clone(),
        negate: wasm_request.step.detective().negate.clone().unwrap(),
        mode: wasm_request.step.detective().pii_keyword_mode.unwrap_or_default().enum_value_or_default(),
    }
}

fn validate_wasm_request(req: &WASMRequest) -> Result<(), String> {
    if req.input_payload.is_empty() {
        return Err("input cannot be empty".to_string());
    }

    if !req.step.has_detective() {
        return Err("detective is required".to_string());
    }

    if req.step.detective().type_ == EnumOrUnknown::from(DetectiveType::DETECTIVE_TYPE_UNKNOWN) {
        return Err("detective type cannot be unknown".to_string());
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
