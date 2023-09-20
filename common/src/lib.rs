use protobuf;
use protos::sp_wsm::{WASMExitCode, WASMRequest, WASMResponse};
use std::mem;

// Maximum number of bytes to read from memory if we don't hit terminator characters
// If this value is exceeded, WASM will panic
const MAX_READ_SIZE: usize = 1024 * 1024; // 1 MB

/// Read memory at ptr for N length bytes, attempt to deserialize as WASMRequest.
pub fn read_request(ptr: *mut u8, length: usize) -> Result<WASMRequest, String> {
    let request_bytes = read_memory_with_length(ptr, length);

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
pub fn write_response(
    output_payload: Option<&[u8]>,
    output_step: Option<&[u8]>,
    exit_code: WASMExitCode,
    exit_msg: String,
) -> *mut u8 {
    let mut response = WASMResponse::new();

    response.output_payload = match output_payload {
        Some(payload) => payload.to_vec(),
        None => vec![],
    };

    response.output_step = match output_step {
        Some(step) => Some(step.to_vec()),
        None => None,
    };

    response.exit_code = protobuf::EnumOrUnknown::from(exit_code);
    response.exit_msg = exit_msg;

    let mut bytes = match protobuf::Message::write_to_bytes(&response) {
        Ok(bytes) => bytes,
        Err(_) => {
            Vec::new()
        }
    };

    // Append 3 terminators (ascii code 166 = ¦)
    bytes.extend_from_slice(&[166, 166, 166]);

    let ptr = bytes.as_mut_ptr();

    ptr
}

/// Small helper for write_response
pub fn write_error_response(wasm_exit_code: WASMExitCode, error: String) -> *mut u8 {
    write_response(None, None, wasm_exit_code, error)
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
    // We multiply size by 3 here to allow for both request and response to fit into
    // Memory + a buffer to allow for transform to mutate data into a bigger size
    let mut buffer = Vec::with_capacity(size as usize * 3);

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

/// Helper for reading data from memory when length is known ahead of time
pub fn read_memory_with_length(ptr: *mut u8, length: usize) -> Vec<u8> {
    let array = unsafe { std::slice::from_raw_parts(ptr, length) };
    return array.to_vec();
}

/// Helper for reading data from memory without knowing length ahead of time
pub fn read_memory_until_terminator(ptr: *mut u8) -> Vec<u8> {
    let mut buf: Vec<u8> = Vec::new();
    let mut null_hits = 0;

    let mut offset = 0;
    loop {
        unsafe {
            let current_ptr = ptr.offset(offset as isize);
            let value = *current_ptr;

            if offset >= MAX_READ_SIZE {
                panic!("read_memory: exceeded max length of {}", MAX_READ_SIZE);
            }

            if null_hits == 3 {
                // We're at the end
                return buf;
            }

            if value == 166 {
                null_hits += 1;
                continue;
            }

            offset += 1;

            buf.push(value);
            null_hits = 0;
        }
    }
}
