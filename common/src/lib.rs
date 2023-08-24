use protobuf;
use protos::sp_wsm::{WASMExitCode, WASMRequest, WASMResponse};
use std::mem;

/// Read memory at ptr for N length bytes, attempt to deserialize as WASMRequest.
pub fn read_request(ptr: *mut u8, length: usize) -> Result<WASMRequest, String> {
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

/// Generate a WASMResponse from params, serialize it, add terminators and
/// return a pointer to the serialized response.
pub fn write_response(output: &[u8], exit_code: WASMExitCode, exit_msg: String) -> *mut u8 {
    let mut response = WASMResponse::new();

    response.output = output.to_vec();
    response.exit_code = protobuf::EnumOrUnknown::from(exit_code);
    response.exit_msg = exit_msg;

    let mut bytes = protobuf::Message::write_to_bytes(&response).unwrap();

    // Append 3 terminators (ascii code 166 = ¦)
    bytes.extend_from_slice(&[166, 166, 166]);

    let ptr = bytes.as_mut_ptr();

    ptr
}

/// Allocate number of bytes in memory. This function should be used by client
/// when generating request data that is intended to be passed to a WASM func.
///
/// NOTE: This function should be exported by every WASM module.
///
/// # Safety
///
/// This function is unsafe because it operates with raw memory so the compiler
/// is unable to provide memory safety guarantees.
pub unsafe extern "C" fn alloc(size: i32) -> *mut u8 {
    let mut buffer = Vec::with_capacity(size as usize);

    let pointer = buffer.as_mut_ptr();

    mem::forget(buffer);

    pointer as *mut u8
}

/// Free allocated memory. This function should be called within a WASM function
/// _after_ it has read request data.
///
/// NOTE: This function should be exported by every WASM module.
///
/// # Safety
///
/// This function is unsafe because it operates with raw memory so the compiler
/// is unable to provide memory safety guarantees.
pub unsafe extern "C" fn dealloc(pointer: *mut u8, size: i32) {
    drop(Vec::from_raw_parts(pointer, size as usize, size as usize))
}

/// Helper for reading data from memory
pub fn read_memory(ptr: *mut u8, length: usize) -> Vec<u8> {
    let array = unsafe { std::slice::from_raw_parts(ptr, length) };
    return array.to_vec();
}
