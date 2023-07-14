use protobuf::EnumOrUnknown;
use protos::detective::DetectiveType;
use protos::pipeline::{WASMExitCode, WASMRequest, WASMResponse};
use snitch_detective::detective::{Detective, Request};
use std::mem;

#[no_mangle]
pub extern "C" fn f(ptr: *mut u8, length: usize) -> *mut u8 {
    // Read request
    let wasm_request = match read_request(ptr, length) {
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

            write_response(&req.data, exit_code, "completed detective run".to_string())
        }
        Err(e) => write_response(
            &req.data,
            WASMExitCode::WASM_EXIT_CODE_INTERNAL_ERROR,
            e.to_string(),
        ),
    }
}

fn generate_detective_request(wasm_request: &WASMRequest) -> Request {
    Request {
        match_type: wasm_request.step.detective().type_.unwrap(),
        data: &wasm_request.input,
        path: wasm_request.step.detective().path.clone(),
        args: wasm_request.step.detective().args.clone(),
        negate: wasm_request.step.detective().negate.clone(),
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

    if req.step.detective().path == "" {
        return Err("detective path cannot be empty".to_string());
    }

    Ok(())
}

fn write_response(output: &Vec<u8>, exit_code: WASMExitCode, exit_msg: String) -> *mut u8 {
    let mut response = WASMResponse::new();

    response.output = output.to_vec();
    response.exit_code = EnumOrUnknown::from(exit_code);
    response.exit_msg = exit_msg;

    let mut bytes = protobuf::Message::write_to_bytes(&response).unwrap();

    // Append 3 terminators (ascii code 166 = ¦)
    bytes.extend_from_slice(&[166, 166, 166]);

    let ptr = bytes.as_mut_ptr();

    ptr
}

fn read_request(ptr: *mut u8, length: usize) -> Result<WASMRequest, String> {
    let request_bytes = read_memory(ptr, length);

    // Decode read request
    let request: WASMRequest =
        protobuf::Message::parse_from_bytes(request_bytes.as_slice()).map_err(|e| e.to_string())?;

    // Dealloc request bytes
    unsafe {
        dealloc(ptr, length as i32);
    }

    Ok(request)
}

// Should generally be called by client when generating request
#[no_mangle]
pub unsafe extern "C" fn alloc(size: i32) -> *mut u8 {
    let mut buffer = Vec::with_capacity(size as usize);

    let pointer = buffer.as_mut_ptr();

    mem::forget(buffer);

    pointer as *mut u8
}

// Should generally be called by exported WASM func _after_ it is finished working with request
#[no_mangle]
pub unsafe extern "C" fn dealloc(pointer: *mut u8, size: i32) {
    drop(Vec::from_raw_parts(pointer, size as usize, size as usize))
}

// Helper for reading data from memory
fn read_memory(ptr: *mut u8, length: usize) -> Vec<u8> {
    let array = unsafe { std::slice::from_raw_parts(ptr, length) };
    return array.to_vec();
}
