use protobuf::{EnumOrUnknown, Message};
use protos::sp_steps_httprequest::HttpRequestMethod::HTTP_REQUEST_METHOD_UNSET;
use protos::sp_steps_httprequest::HttpResponse;
use protos::sp_wsm::{WASMExitCode, WASMRequest};

extern "C" {
    fn httpRequest(ptr: *mut u8, length: usize) -> u64;
}

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
                WASMExitCode::WASM_EXIT_CODE_INTERNAL_ERROR,
                e.to_string(),
            );
        }
    };

    // Validate request
    if let Err(err) = validate_wasm_request(&wasm_request) {
        return common::write_response(
            None,
            None,
            None,
            WASMExitCode::WASM_EXIT_CODE_INTERNAL_ERROR,
            format!("invalid step: {}", err.to_string()),
        );
    }

    // Serialize request
    let mut bytes = match wasm_request.step.http_request().request.write_to_bytes() {
        Ok(bytes) => bytes,
        Err(e) => {
            return common::write_response(
                None,
                None,
                None,
                WASMExitCode::WASM_EXIT_CODE_INTERNAL_ERROR,
                format!("unable to serialize request: {}", e.to_string()),
            );
        }
    };

    let req_ptr = bytes.as_mut_ptr();

    let host_res: u64;
    unsafe {
        host_res = httpRequest(req_ptr, bytes.len());
    }

    // Need to read memory at res_ptr and return a response
    let host_res_ptr = (host_res >> 32) as *mut u8;
    let host_res_len = host_res as u32;
    let http_resp_bytes = common::read_memory_with_length(host_res_ptr, host_res_len as usize);

    // // Deallocate request memory
    unsafe {
        dealloc(req_ptr, length as i32);
    }

    let result = http_response(http_resp_bytes);

    return match result {
        Ok(res) => {
            if res.code < 200 || res.code > 299 {
                common::write_response(
                    Some(wasm_request.input_payload.as_slice()),
                    Some(&res.body),
                    None,
                    WASMExitCode::WASM_EXIT_CODE_FAILURE,
                    format!("Request returned non-200 response code: {}", res.code),
                )
            } else {
                common::write_response(
                    Some(wasm_request.input_payload.as_slice()),
                    Some(&res.body),
                    None,
                    WASMExitCode::WASM_EXIT_CODE_SUCCESS,
                    "completed http request".to_string(),
                )
            }
        }
        Err(e) => common::write_response(
            None,
            None,
            None,
            WASMExitCode::WASM_EXIT_CODE_INTERNAL_ERROR,
            format!("unable to parse response: {}", e.to_string()),
        ),
    };
}

pub fn http_response(data: Vec<u8>) -> Result<HttpResponse, String> {
    // Decode read request
    let request: HttpResponse =
        protobuf::Message::parse_from_bytes(data.as_slice()).map_err(|e| e.to_string())?;

    Ok(request)
}

fn validate_wasm_request(req: &WASMRequest) -> Result<(), String> {
    if !req.step.has_http_request() {
        return Err("httprequest is required".to_string());
    }

    if req.step.http_request().request.url == "".to_string() {
        return Err("http request url cannot be empty".to_string());
    }

    if req.step.http_request().request.method == EnumOrUnknown::from(HTTP_REQUEST_METHOD_UNSET) {
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
