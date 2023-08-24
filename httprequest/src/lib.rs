use protobuf::EnumOrUnknown;
use protos::sp_steps_httprequest::HttpRequestMethod::HTTP_REQUEST_METHOD_UNSET;
use protos::sp_wsm::{WASMExitCode, WASMRequest};
use protos::sp_steps_httprequest::HttpResponse;

extern "C" {
    fn httpRequest(_ptr: *mut u8, _length: usize) -> *mut u8;
}

#[no_mangle]
pub extern "C" fn f(_ptr: *mut u8, _length: usize) -> *mut u8 {
    // Read request
    let wasm_request = match common::read_request(_ptr, _length) {
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
       res_ptr = httpRequest(_ptr, _length.clone());
    }

    // Need to read memory at res_ptr and return a response
    let data = read_memory(res_ptr, 0);

    let result = http_response(data);
    return match result {
        Ok(res) => {
            common::write_response(
                &res.body,
                WASMExitCode::WASM_EXIT_CODE_SUCCESS,
                "completed http request".to_string()
                // TODO: add response code somewhere
            )
        },
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

fn read_memory(ptr: *mut u8, length: usize) -> Vec<u8> {
    let mut data: Vec<u8> = Vec::new();
    let mut null_hits = 0;
    let start_ptr = unsafe{ptr.as_mut().unwrap()};

    if length > 0 {
        return common::read_memory(ptr, length);
    }

    // TODO: needs an upper bound, in the event that the 166 terminator is not found
    loop {
        let v = unsafe { std::ptr::read(start_ptr) };
        *start_ptr += 1;

        // Don't have a length, have to see if we hit three null terminators (166)
        if v == 166 {
            null_hits += 1;
            continue;
        }

        if null_hits == 3 {
            break;
        }

        data.push(v);
        print!("{:?}", to_ascii(&v))
    }

    return data
}

fn to_ascii(v: &u8) -> char {
    if *v == 0 {
        return '0'
    }

    return *v as char
}

fn validate_wasm_request(req: &WASMRequest) -> Result<(), String> {
    if req.input.is_empty() {
        return Err("input cannot be empty".to_string());
    }

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

// pub extern "C" fn f(ptr: *mut u8, length: usize) -> *mut u8 {
//     // Read request
//     let wasm_request = match common::read_request(ptr, length) {
//         Ok(req) => req,
//         Err(e) => panic!("unable to read request: {}", e), // TODO: Should write response here
//     };
//
//     // Validate request
//     if let Err(err) = validate_wasm_request(&wasm_request) {
//         panic!("invalid step: {}", err) // TODO: Should write response here
//     }
//
//     // Generate detective request
//     let req = generate_httprequest_request(&wasm_request);
//
//     // Run request against detective
//     match Detective::new().matches(&req) {
//         Ok(match_result) => {
//             let mut exit_code = WASMExitCode::WASM_EXIT_CODE_FAILURE;
//
//             if match_result {
//                 exit_code = WASMExitCode::WASM_EXIT_CODE_SUCCESS;
//             }
//
//             common::write_response(&req.data, exit_code, "completed detective run".to_string())
//         }
//         Err(e) => common::write_response(
//             &req.data,
//             WASMExitCode::WASM_EXIT_CODE_INTERNAL_ERROR,
//             e.to_string(),
//         ),
//     }
// }

