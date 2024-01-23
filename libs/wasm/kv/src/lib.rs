use protobuf::{EnumOrUnknown, Message};
use protos::sp_shared::KVAction;
use protos::sp_steps_kv::{KVMode, KVStatus, KVStepResponse};
use protos::sp_wsm::{WASMExitCode, WASMRequest};
use streamdal_wasm_detective::detective;

extern "C" {
    fn kvExists(ptr: *mut u8, length: usize) -> u64;
}

#[no_mangle]
pub extern "C" fn f(ptr: *mut u8, length: usize) -> u64 {
    // Read request
    let wasm_request = match common::read_request(ptr, length) {
        Ok(req) => req,
        Err(e) => {
            return common::write_error_response(
                WASMExitCode::WASM_EXIT_CODE_ERROR,
                format!("unable to parse request: {}", e.to_string()),
            );
        }
    };

    // Validate request
    if let Err(err) = validate_wasm_request(&wasm_request) {
        return common::write_error_response(
            WASMExitCode::WASM_EXIT_CODE_FALSE,
            format!("unable to validate wasm request: {}", err.to_string()),
        );
    }

    // Determine which host func we'll execute (OK to unwrap since we validated)
    let kv_func = match wasm_request.step.kv().action.unwrap() {
        KVAction::KV_ACTION_EXISTS => kvExists,
        _ => {
            return common::write_error_response(
                WASMExitCode::WASM_EXIT_CODE_FALSE,
                format!("invalid action: {:?}", wasm_request.step.kv().action),
            );
        }
    };

    // Maybe update step key (if dynamic mode is specified)
    let mut step = wasm_request.step.kv().clone();

    // Handle "static" or "dynamic" mode - ie. how do we use the provided "key"?
    if wasm_request.step.kv().mode == EnumOrUnknown::from(KVMode::KV_MODE_DYNAMIC) {
        // Lookup what the actual key will be by looking at the value in the JSON path
        match detective::parse_field(wasm_request.input_payload.as_slice(), &step.key) {
            Ok(key_contents) => step.key = key_contents.to_string(),
            Err(err) => {
                return common::write_error_response(
                    WASMExitCode::WASM_EXIT_CODE_FALSE, // TODO: This should be exit code from parse call
                    format!("unable to complete dynamic key lookup: {}", err.to_string()),
                );
            }
        }
    }

    // Serialize step
    let mut step_bytes = match step.write_to_bytes() {
        Ok(bytes) => bytes,
        Err(e) => {
            return common::write_error_response(
                WASMExitCode::WASM_EXIT_CODE_ERROR,
                format!("unable to serialize step: {}", e.to_string()),
            );
        }
    };

    // Get pointer to serialized bytes
    let req_ptr = step_bytes.as_mut_ptr();

    // Call host func
    let host_res: u64;

    unsafe {
        host_res = kv_func(req_ptr, step_bytes.len());
    }

    let host_res_ptr = (host_res >> 32) as *mut u8;
    let host_res_len = host_res as u32;
    let kv_resp_bytes = common::read_memory_with_length(host_res_ptr, host_res_len as usize);

    // Deallocate request memory
    unsafe {
        dealloc(req_ptr, length as i32);
    }

    // Parse KVResp
    let kv_step_response: KVStepResponse = match Message::parse_from_bytes(kv_resp_bytes.as_slice())
    {
        Ok(resp) => resp,
        Err(e) => {
            return common::write_error_response(
                WASMExitCode::WASM_EXIT_CODE_ERROR,
                format!("unable to parse kv step response: {}", e.to_string()),
            );
        }
    };

    // Validate KVResp
    if let Err(err) = validate_kv_step_response(&kv_step_response) {
        return common::write_error_response(
            WASMExitCode::WASM_EXIT_CODE_FALSE,
            format!("unable to validate kv step response: {}", err.to_string()),
        );
    }

    let wasm_exit_code;

    // Write + return response
    match kv_step_response.status.unwrap() {
        KVStatus::KV_STATUS_SUCCESS => wasm_exit_code = WASMExitCode::WASM_EXIT_CODE_TRUE,
        KVStatus::KV_STATUS_FAILURE => wasm_exit_code = WASMExitCode::WASM_EXIT_CODE_FALSE,
        KVStatus::KV_STATUS_ERROR => wasm_exit_code = WASMExitCode::WASM_EXIT_CODE_ERROR,
        _ => wasm_exit_code = WASMExitCode::WASM_EXIT_CODE_ERROR,
    }

    // This may have been a KVGet that might produce a result - we should populate it (if it's there)
    // NOTE: Doing this ugly thing to avoid "value does not live long enough" errors
    if kv_step_response.value.is_some() {
        common::write_response(
            Some(wasm_request.input_payload.as_slice()),
            Some(kv_step_response.value.unwrap().as_slice()),
            None,
            wasm_exit_code,
            format!("kv step response: {:?}", kv_step_response.message),
        )
    } else {
        common::write_response(
            Some(wasm_request.input_payload.as_slice()),
            None,
            None,
            wasm_exit_code,
            format!("kv step response: {:?}", kv_step_response.message),
        )
    }
}

fn validate_kv_step_response(kv_step_response: &KVStepResponse) -> Result<(), String> {
    match kv_step_response.status.enum_value() {
        Ok(status) => {
            if status == KVStatus::KV_STATUS_UNSET {
                return Err("KV status must be set".to_string());
            }
        }
        Err(_) => return Err("unable to get KV status".to_string()),
    };

    Ok(())
}

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
