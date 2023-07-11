use protobuf::EnumOrUnknown;
use protos::pipeline::{PipelineStep, PipelineStepResponse, PipelineStepStatus};
use snitch_detective::detective::Detective;
use std::mem;

#[no_mangle]
pub extern "C" fn f(ptr: *mut u8, length: usize) -> *mut u8 {
    // Read request
    let step = match read_step(ptr, length) {
        Ok(request) => request,
        Err(e) => panic!("unable to read request: {}", e), // TODO: Should write response here
    };

    // Validate request
    if let Err(err) = validate_step(&step) {
        panic!("invalid step: {}", err) // TODO: Should write response here
    }

    // Run request against detective
    match Detective::new().matches(step.detective()) {
        Ok(match_result) => {
            println!(
                "Request for '{:?}'; result: {}",
                step.to_string(),
                match_result
            );

            let mut status = PipelineStepStatus::PIPELINE_STEP_STATUS_FAILURE;

            if match_result {
                status = PipelineStepStatus::PIPELINE_STEP_STATUS_SUCCESS
            }

            write_response(
                &step.detective().input,
                status,
                "completed detective run".to_string(),
            )
        }
        Err(e) => write_response(
            &step.detective().input,
            PipelineStepStatus::PIPELINE_STEP_STATUS_FAILURE,
            e.to_string(),
        ),
    }
}

fn validate_step(step: &PipelineStep) -> Result<(), String> {
    if !step.has_detective() {
        return Err("detective is required".to_string());
    }

    Ok(())
}

fn write_response(output: &Vec<u8>, status: PipelineStepStatus, message: String) -> *mut u8 {
    let mut response = PipelineStepResponse::new();

    response.output = output.to_owned();
    response.status = EnumOrUnknown::from(status);
    response.status_message = message;

    let mut bytes = protobuf::Message::write_to_bytes(&response).unwrap();

    // Append 3 terminators (ascii code 166 = ¦)
    bytes.extend_from_slice(&[166, 166, 166]);

    let ptr = bytes.as_mut_ptr();

    mem::forget(ptr);

    ptr
}

fn read_step(ptr: *mut u8, length: usize) -> Result<PipelineStep, String> {
    let request_bytes = read_memory(ptr, length);

    // Decode read request
    let request: PipelineStep =
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
