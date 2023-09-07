use common::write_response;
use protobuf::{EnumOrUnknown, Message};
use protos::sp_kv::KVAction;
use protos::sp_steps_kv::{KVMode, KVStatus, KVStepResponse};
use protos::sp_wsm::{WASMExitCode, WASMRequest};

extern "C" {
    fn kvExists(ptr: *mut u8, length: usize) -> *mut u8;
}

#[no_mangle]
pub extern "C" fn f(ptr: *mut u8, length: usize) -> *mut u8 {
    // Read request
    let wasm_request = match common::read_request(ptr, length, false) {
        Ok(req) => req,
        Err(e) => {
            return common::write_response(
                &[0u8; 0],
                WASMExitCode::WASM_EXIT_CODE_INTERNAL_ERROR,
                format!("unable to parse request: {}", e.to_string()),
            );
        }
    };

    // Validate request
    if let Err(err) = validate_wasm_request(&wasm_request) {
        return common::write_response(
            &[0u8; 0],
            WASMExitCode::WASM_EXIT_CODE_INTERNAL_ERROR,
            format!("unable to validate wasm request: {}", err.to_string()),
        );
    }

    // Serialize step
    let mut step_bytes = match wasm_request.step.kv().write_to_bytes() {
        Ok(bytes) => bytes,
        Err(e) => {
            return common::write_response(
                &[0u8; 0],
                WASMExitCode::WASM_EXIT_CODE_INTERNAL_ERROR,
                format!("unable to serialize step: {}", e.to_string()),
            );
        }
    };

    // Get pointer to serialized bytes
    let req_ptr = step_bytes.as_mut_ptr();

    // Determine which host func we'll execute (I think it's ok to unwrap() here?)
    let kv_func = match wasm_request.step.kv().action.unwrap() {
        KVAction::KV_ACTION_EXISTS => kvExists,
        _ => {
            return common::write_response(
                &[0u8; 0],
                WASMExitCode::WASM_EXIT_CODE_INTERNAL_ERROR,
                format!("invalid action: {:?}", wasm_request.step.kv().action),
            );
        }
    };

    // Handle "static" or "dynamic" mode
    let mut key;

    if wasm_request.step.kv().mode == EnumOrUnknown::from(KVMode::KV_MODE_STATIC) {
        key = wasm_request.step.kv().key.clone();
    } else {
        // Lookup key by finding the path
        key =
            // TODO: This should use detective.parse_field()
            match common::get_value_in_json(wasm_request.step.kv().key.clone(), wasm_request.input)
            {
                Ok(key_contents) => key_contents,
                Err(err) => {
                    return common::write_response(
                        &[0u8; 0],
                        WASMExitCode::WASM_EXIT_CODE_FAILURE, // TODO: Is it possible to have an internal failure here?
                        format!("unable to complete dynamic key lookup: {}", err.to_string()),
                    );
                }
            }
    }

    let res_ptr: *mut u8;

    // Call host func
    unsafe {
        res_ptr = kv_func(req_ptr, step_bytes.len());
    }

    // Need to read memory at res_ptr and return a response
    let kv_resp_bytes = common::read_memory_until_terminator(res_ptr);

    // Deallocate request memory
    unsafe {
        dealloc(req_ptr, length as i32);
    }

    // TODO: Got back a KVStepResponse - parse it
    let kv_step_response: KVStepResponse = match Message::parse_from_bytes(kv_resp_bytes.as_slice())
    {
        Ok(resp) => resp,
        Err(e) => {
            return common::write_response(
                &[0u8; 0],
                WASMExitCode::WASM_EXIT_CODE_INTERNAL_ERROR,
                format!("unable to parse kv step response: {}", e.to_string()),
            );
        }
    };

    // Validate KVResp
    if let err = validate_kv_step_response(&kv_step_response) {
        return common::write_response(
            &[0u8; 0],
            WASMExitCode::WASM_EXIT_CODE_INTERNAL_ERROR,
            format!("unable to validate kv step response: {}", err.to_string()),
        );
    }

    let mut wasm_exit_code;

    // Write + return response
    match kv_step_response.status.unwrap() {
        KVStatus::KV_STATUS_SUCCESS => wasm_exit_code = WASMExitCode::WASM_EXIT_CODE_SUCCESS,
        KVStatus::KV_STATUS_FAILURE => wasm_exit_code = WASMExitCode::WASM_EXIT_CODE_FAILURE,
        KVStatus::KV_STATUS_ERROR => wasm_exit_code = WASMExitCode::WASM_EXIT_CODE_INTERNAL_ERROR,
        _ => wasm_exit_code = WASMExitCode::WASM_EXIT_CODE_INTERNAL_ERROR,
    }

    common::write_response(
        &[0u8; 0], // TODO: We should discuss this - what do we return here?
        wasm_exit_code,
        format!("kv step response: {:?}", kv_step_response.message),
    )
}

// pub fn http_response(data: Vec<u8>) -> Result<HttpResponse, String> {
//     // Decode read request
//     let request: HttpResponse =
//         protobuf::Message::parse_from_bytes(data.as_slice()).map_err(|e| e.to_string())?;
//
//     Ok(request)
// }

fn validate_wasm_request(req: &WASMRequest) -> Result<(), String> {
    if !req.step.has_kv() {
        return Err("kv step must be set".to_string());
    }

    // Key must be set for all actions
    if req.step.kv().key.is_empty() {
        return Err("key must be set".to_string());
    }

    // Mode must be set for all
    if req.step.kv().mode == EnumOrUnknown::from(KVMode::KV_MODE_UNSET) {
        return Err("mode must be set".to_string());
    }

    // Action must be set for all
    if req.step.kv().action == EnumOrUnknown::from(KVAction::KV_ACTION_UNSET) {
        return Err("action must be set".to_string());
    }

    // Value must be set for CREATE action
    if req.step.kv().action == EnumOrUnknown::from(KVAction::KV_ACTION_CREATE)
        && req.step.kv().value.is_none()
    {
        return Err("value must be set for create action".to_string());
    }

    Ok(())
}

// fn validate_kv_exists_request(req: &KVExistsRequest) -> Result<(), String> {
//     if req.key.is_empty() {
//         return Err("key must be set".to_string());
//     }
//
//     if req.mode == EnumOrUnknown::from(KVExistsMode::KV_EXISTS_MODE_UNSET) {
//         return Err("mode must be set".to_string());
//     }
//
//     Ok(())
// }

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
