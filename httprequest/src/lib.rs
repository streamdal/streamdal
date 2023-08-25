use protobuf::EnumOrUnknown;
use protos::sp_steps_httprequest::HttpRequestMethod::HTTP_REQUEST_METHOD_UNSET;
use protos::sp_wsm::{WASMExitCode, WASMRequest};
use protos::sp_steps_httprequest::HttpResponse;

// Maximum number of bytes to read from memory if we don't hit terminator characters
// If this value is exceeded, WASM will panic
const MAX_READ_SIZE: usize = 1024 * 1024; // 1 MB

extern "C" {
    fn httpRequest(ptr: *mut u8, length: usize) -> *mut u8;
}

#[no_mangle]
pub extern "C" fn f(ptr: *mut u8,length: usize) -> *mut u8 {
    // Read request
    let wasm_request = match common::read_request(ptr, length, false) {
        Ok(req) => req,
        Err(e) => {
            let output = &[0u8; 0];
            return common::write_response(
                output,
                WASMExitCode::WASM_EXIT_CODE_INTERNAL_ERROR,
                e.to_string(),
            )
        },
    };

    // Validate request
    if let Err(err) = validate_wasm_request(&wasm_request) {
        let output = &[0u8; 0];
        return common::write_response(
            output,
            WASMExitCode::WASM_EXIT_CODE_INTERNAL_ERROR,
            format!("invalid step: {}", err.to_string()),
        )
    }

    let res_ptr: *mut u8;
    unsafe {
       res_ptr = httpRequest(ptr, length.clone());
    }

    // Need to read memory at res_ptr and return a response
    let data = read_memory(res_ptr, 0);

    let result = http_response(data);
    return match result {
        Ok(res) => {
            if res.code < 200 || res.code > 299 {
                common::write_response(
                    &res.body,
                    WASMExitCode::WASM_EXIT_CODE_FAILURE,
                    format!("Request returned non-200 response code: {}", res.code)
                )
            } else {
                common::write_response(
                    &res.body,
                    WASMExitCode::WASM_EXIT_CODE_SUCCESS,
                    "completed http request".to_string()
                )
            }
        },
        Err(e) => {
            let output = &[0u8; 0];
            common::write_response(
                output,
                WASMExitCode::WASM_EXIT_CODE_INTERNAL_ERROR,
                format!("nable to parse response: {}", e.to_string()),
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

fn read_memory(ptr: *mut u8, length: usize) -> Vec<u8> {
    let mut buf: Vec<u8> = Vec::new();
    let mut null_hits = 0;

    if length > 0 {
        return common::read_memory(ptr, length);
    }

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

fn validate_wasm_request(req: &WASMRequest) -> Result<(), String> {
    if !req.step.has_http_request() {
        return Err("httprequest is required".to_string());
    }

    if req.step.http_request().url == "".to_string() {
        return Err("http request url cannot be empty".to_string());
    }

    if req.step.http_request().method == EnumOrUnknown::from(HTTP_REQUEST_METHOD_UNSET) {
        return Err("http request method cannot be unset".to_string());
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
