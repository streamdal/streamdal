use protobuf::{EnumOrUnknown, Message};
use protos::sp_steps_httprequest::HttpRequestMethod::HTTP_REQUEST_METHOD_UNSET;
use protos::sp_steps_httprequest::HttpResponse;
use protos::sp_wsm::{WASMExitCode, WASMRequest};

// Maximum number of bytes to read from memory if we don't hit terminator characters
// If this value is exceeded, WASM will panic
const MAX_READ_SIZE: usize = 1024 * 1024; // 1 MB

extern "C" {
    fn kvExists(ptr: *mut u8, length: usize) -> *mut u8;
}

#[no_mangle]
pub extern "C" fn f(ptr: *mut u8, length: usize) -> *mut u8 {
    // Read request
    let wasm_request = match common::read_request(ptr, length, false) {
        Ok(req) => req,
        Err(e) => {
            let output = &[0u8; 0];
            return common::write_response(
                output,
                WASMExitCode::WASM_EXIT_CODE_INTERNAL_ERROR,
                format!("unable to parse request: {}", e.to_string()),
            );
        }
    };

    // Validate request
    if let Err(err) = validate_wasm_request(&wasm_request) {
        let output = &[0u8; 0];
        return common::write_response(
            output,
            WASMExitCode::WASM_EXIT_CODE_INTERNAL_ERROR,
            format!("unable to validate wasm request: {}", err.to_string()),
        );
    }

    // TODO: Switch on KV step type && serialize the underlying request
    let mut bytes = wasm_request.step.kv().request.write.unwrap();

    let req_ptr = bytes.as_mut_ptr();

    let res_ptr: *mut u8;
    unsafe {
        res_ptr = kvExists(req_ptr, bytes.len());
    }

    // Need to read memory at res_ptr and return a response
    let data = read_memory(res_ptr, 0);

    // Deallocate request memory
    unsafe {
        dealloc(req_ptr, length as i32);
    }

    let result = http_response(data);
    return match result {
        Ok(res) => {
            if res.code < 200 || res.code > 299 {
                common::write_response(
                    &res.body,
                    WASMExitCode::WASM_EXIT_CODE_FAILURE,
                    format!("Request returned non-200 response code: {}", res.code),
                )
            } else {
                common::write_response(
                    &res.body,
                    WASMExitCode::WASM_EXIT_CODE_SUCCESS,
                    "completed http request".to_string(),
                )
            }
        }
        Err(e) => {
            let output = &[0u8; 0];
            common::write_response(
                output,
                WASMExitCode::WASM_EXIT_CODE_INTERNAL_ERROR,
                format!("unable to parse response: {}", e.to_string()),
            )
        }
    };
}

pub fn http_response(data: Vec<u8>) -> Result<HttpResponse, String> {
    // Decode read request
    let request: HttpResponse =
        protobuf::Message::parse_from_bytes(data.as_slice()).map_err(|e| e.to_string())?;

    Ok(request)
}

fn validate_wasm_request(req: &WASMRequest) -> Result<(), String> {
    if !req.step.has_kv() {
        return Err("kv step must be set".to_string());
    }

    // TODO: Determine what kind of KV step this is and perform kv-specific validation

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
