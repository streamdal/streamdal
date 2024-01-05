use protos::sp_steps_transform::TransformTruncateType::TRANSFORM_TRUNCATE_TYPE_PERCENTAGE;
use protos::sp_steps_transform::TransformType;
use protos::sp_wsm::{WASMExitCode, WASMRequest};
use streamdal_wasm_transform::transform;
use streamdal_wasm_transform::transform::TruncateOptions;
use streamdal_wasm_transform::transform::TruncateType::{Chars, Percent};

#[no_mangle]
pub extern "C" fn f(ptr: *mut u8, length: usize) -> u64 {
    // Read request
    let wasm_request = match common::read_request(ptr, length) {
        Ok(req) => req,
        Err(e) => {
            return common::write_response(
                None,
                None,
                WASMExitCode::WASM_EXIT_CODE_INTERNAL_ERROR,
                format!("unable to read request: {}", e),
            );
        }
    };

    // Validate request
    if let Err(err) = validate_wasm_request(&wasm_request) {
        common::write_response(
            None,
            None,
            WASMExitCode::WASM_EXIT_CODE_INTERNAL_ERROR,
            format!("step validation failed: {}", err),
        );
    }

    // Generate transform request
    let transform_request = match generate_transform_request(&wasm_request) {
        Ok(req) => req,
        Err(e) => {
            return common::write_response(
                None,
                None,
                WASMExitCode::WASM_EXIT_CODE_INTERNAL_ERROR,
                format!("unable to generate transform request: {}", e),
            );
        }
    };

    // Run request against transform
    let result = match wasm_request.step.transform().type_.unwrap() {
        TransformType::TRANSFORM_TYPE_REPLACE_VALUE => transform::overwrite(&transform_request),
        TransformType::TRANSFORM_TYPE_MASK_VALUE => transform::mask(&transform_request),
        TransformType::TRANSFORM_TYPE_OBFUSCATE_VALUE => transform::obfuscate(&transform_request),
        TransformType::TRANSFORM_TYPE_TRUNCATE_VALUE => transform::truncate(&transform_request),
        TransformType::TRANSFORM_TYPE_DELETE_FIELD => transform::delete(&transform_request),
        _ => {
            return common::write_response(
                None,
                None,
                WASMExitCode::WASM_EXIT_CODE_FAILURE,
                "Unknown transform type".to_string(),
            )
        }
    };

    // Inspect result and return potentially transformed payload
    match result {
        Ok(data) => common::write_response(
            Some(&data.into_bytes()),
            None,
            WASMExitCode::WASM_EXIT_CODE_SUCCESS,
            "Successfully transformed payload".to_string(),
        ),
        Err(err) => common::write_response(
            None,
            None,
            WASMExitCode::WASM_EXIT_CODE_FAILURE,
            format!("Unable to transform payload: {:?}", err),
        ),
    }
}

fn generate_transform_request(wasm_request: &WASMRequest) -> Result<transform::Request, String> {
    let t = wasm_request.step.transform();

    let req = match t.type_.unwrap() {
        // unwrap is safe as validation occurs before this
        TransformType::TRANSFORM_TYPE_TRUNCATE_VALUE => {
            // Never had deprecated options, no need to handle here

            let tt = match t.truncate_options().type_.enum_value().unwrap() {
                TRANSFORM_TRUNCATE_TYPE_PERCENTAGE => Percent,
                _ => Chars,
            };

            transform::Request {
                data: wasm_request.input_payload.clone(),
                path: t.truncate_options().path.clone(),
                value: "".to_string(),
                truncate_options: Some(TruncateOptions {
                    length: t.truncate_options().clone().value as usize,
                    truncate_type: tt,
                }),
                extract_options: None,
            }
        }
        TransformType::TRANSFORM_TYPE_DELETE_FIELD => {
            // Never had deprecated options, no need to handle here

            transform::Request {
                data: wasm_request.input_payload.clone(),
                path: wasm_request
                    .step
                    .transform()
                    .delete_field_options()
                    .path
                    .clone(),
                value: "".to_string(),
                truncate_options: None,
                extract_options: None,
            }
        }
        TransformType::TRANSFORM_TYPE_MASK_VALUE => {
            // Handle deprecated options
            if !t.has_mask_options() {
                transform::Request {
                    data: wasm_request.input_payload.clone(),
                    path: wasm_request.step.transform().path.clone(),
                    value: wasm_request.step.transform().value.clone(),
                    truncate_options: None,
                    extract_options: None,
                }
            } else {
                transform::Request {
                    data: wasm_request.input_payload.clone(),
                    path: wasm_request.step.transform().mask_options().path.clone(),
                    value: "".to_string(),
                    truncate_options: None,
                    extract_options: None,
                }
            }
        }
        TransformType::TRANSFORM_TYPE_OBFUSCATE_VALUE => {
            // Handle deprecated options
            if !t.has_obfuscate_options() {
                transform::Request {
                    data: wasm_request.input_payload.clone(),
                    path: wasm_request.step.transform().path.clone(),
                    value: wasm_request.step.transform().value.clone(),
                    truncate_options: None,
                    extract_options: None,
                }
            } else {
                transform::Request {
                    data: wasm_request.input_payload.clone(),
                    path: wasm_request
                        .step
                        .transform()
                        .obfuscate_options()
                        .path
                        .clone(),
                    value: "".to_string(),
                    truncate_options: None,
                    extract_options: None,
                }
            }
        }
        TransformType::TRANSFORM_TYPE_REPLACE_VALUE => {
            // Handle deprecated options
            if !t.has_replace_value_options() {
                transform::Request {
                    data: wasm_request.input_payload.clone(),
                    path: wasm_request.step.transform().path.clone(),
                    value: wasm_request.step.transform().value.clone(),
                    truncate_options: None,
                    extract_options: None,
                }
            } else {
                transform::Request {
                    data: wasm_request.input_payload.clone(),
                    path: wasm_request
                        .step
                        .transform()
                        .replace_value_options()
                        .path
                        .clone(),
                    value: wasm_request
                        .step
                        .transform()
                        .replace_value_options()
                        .value
                        .clone(),
                    truncate_options: None,
                    extract_options: None,
                }
            }
        }
        _ => {
            return Err("unknown transform type".to_string());
        }
    };

    Ok(req)
}

fn validate_wasm_request(req: &WASMRequest) -> Result<(), String> {
    if req.input_payload.is_empty() {
        return Err("input cannot be empty".to_string());
    }

    if !req.step.has_transform() {
        return Err("transform is required".to_string());
    }

    let transform_type = req.step.transform().type_.enum_value_or_default();

    if transform_type == TransformType::TRANSFORM_TYPE_UNKNOWN {
        return Err("transform type cannot be unknown".to_string());
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
