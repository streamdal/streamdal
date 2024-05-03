use protobuf::{EnumOrUnknown, Message, MessageField};
use protos::sp_pipeline::PipelineStep;
use protos::sp_pipeline::pipeline_step::Step;
use protos::sp_steps_httprequest::HttpRequestMethod::HTTP_REQUEST_METHOD_UNSET;
use protos::sp_steps_httprequest::{HttpRequest, HttpRequestStep, HttpResponse};
use protos::sp_wsm::{WASMExitCode, WASMRequest};

extern "C" {
    fn httpRequest(ptr: *mut u8, length: usize) -> u64;
}

#[no_mangle]
pub extern "C" fn f(ptr: *mut u8, length: usize) -> u64 {
    // Read request
    let mut wasm_request = match common::read_request(ptr, length) {
        Ok(req) => req,
        Err(e) => {
            return common::write_response(
                None,
                None,
                None,
                WASMExitCode::WASM_EXIT_CODE_ERROR,
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
            WASMExitCode::WASM_EXIT_CODE_ERROR,
            format!("invalid wasm request: {}", err),
        );
    }

    // If dynamic == true, use input_payload as the request body
    if wasm_request.step.dynamic {
        let new_http_step = HttpRequestStep{
            request: MessageField(
                Some(
                    Box::new(
                        HttpRequest{
                            url: wasm_request.step.http_request().request.url.clone(),
                            method: wasm_request.step.http_request().request.method,
                            headers: wasm_request.step.http_request().request.headers.clone(),
                            body: wasm_request.input_payload.clone(),
                            body_mode: wasm_request.step.http_request().request.body_mode,
                            ..Default::default()
                        }
                    )
                )
            ),
            ..Default::default()
        };

        let new_wasm_request = WASMRequest {
            input_payload: wasm_request.input_payload.clone(),
            inter_step_result: wasm_request.inter_step_result.clone(),
            step: MessageField(
                Some(
                    Box::new(
                        PipelineStep {
                            name: wasm_request.step.name.clone(),
                            on_error: wasm_request.step.on_error.clone(),
                            on_true: wasm_request.step.on_true.clone(),
                            on_false: wasm_request.step.on_false.clone(),
                            dynamic: true,
                            step: Some(Step::HttpRequest(new_http_step)),
                            ..Default::default()
                        }
                    )
                )
            ),
            ..Default::default()
        };

        wasm_request = new_wasm_request;
    }
    
    // Serialize request
    let mut bytes = match wasm_request.write_to_bytes() {
        Ok(bytes) => bytes,
        Err(e) => {
            return common::write_response(
                None,
                None,
                None,
                WASMExitCode::WASM_EXIT_CODE_ERROR,
                format!("unable to serialize request: {}", e),
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
                    WASMExitCode::WASM_EXIT_CODE_FALSE,
                    format!("Request returned non-200 response code: {}", res.code),
                )
            } else {
                common::write_response(
                    Some(wasm_request.input_payload.as_slice()),
                    Some(&res.body),
                    None,
                    WASMExitCode::WASM_EXIT_CODE_TRUE,
                    "completed http request".to_string(),
                )
            }
        }
        Err(e) => common::write_response(
            None,
            None,
            None,
            WASMExitCode::WASM_EXIT_CODE_FALSE,
            format!("unable to parse response: {}", e),
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

    if req.step.http_request().request.url == *"" {
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
