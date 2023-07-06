// Helper for reading data from memory
pub fn read_memory(ptr: *mut u8, length: usize) -> Vec<u8> {
    let array = unsafe { std::slice::from_raw_parts(ptr, length) };
    return array.to_vec();
}

// This func should be used to update a byte response to include terminators so
// that client side can read the response from memory (without knowing the response length)
pub fn append_terminator(bytes: &mut Vec<u8>) -> *mut u8 {
    // Append 3 terminators (ascii code 166 = ¦)
    bytes.extend_from_slice(&[166, 166, 166]);

    let ptr = bytes.as_mut_ptr();

    std::mem::forget(ptr);

    ptr
}

// Used by client when generating request
#[no_mangle]
pub unsafe extern "C" fn alloc(size: i32) -> *mut u8 {
    let mut buffer = Vec::with_capacity(size as usize);

    let pointer = buffer.as_mut_ptr();

    std::mem::forget(buffer);

    pointer as *mut u8
}

// Used by WASM func to dealloc memory after it is finished working with request
#[no_mangle]
pub unsafe extern "C" fn dealloc(pointer: *mut u8, size: i32) {
    drop(Vec::from_raw_parts(pointer, size as usize, size as usize))
}

#[test]
fn test_read_memory() {
    let data = vec![1, 2, 3, 4, 5];
    let ptr = data.as_ptr() as *mut u8;

    let result = read_memory(ptr, data.len());
    assert_eq!(result, data);
}

#[test]
fn test_prepare_response() {
    let mut data: Vec<u8> = vec![1, 2, 3, 4, 5];
    let original_len = data.len();

    let ptr = append_terminator(&mut data);

    // There should be 3 terminators appended
    assert_eq!(data.len(), original_len + 3);

    // Attempt to read data from mem by ptr
    let data_in_mem =  unsafe { std::slice::from_raw_parts(ptr, data.len()) };
    assert_eq!(data_in_mem.to_vec(), data);
}
