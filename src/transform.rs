use gjson;
use protos::transform::TransformRequest;
use std::backtrace::BacktraceStatus;

#[derive(Debug)]
pub enum TransformError {
    Generic(String),
}

pub fn overwrite(req: &TransformRequest) -> Result<String, TransformError> {
    validate_request(req, true)?;

    let data = gjson::set_overwrite(
        convert_bytes_to_string(&req.data)?,
        req.path.as_str(),
        req.value.as_str(),
    )
    .map_err(|e| TransformError::Generic(format!("unable to overwrite data: {}", e)))?;

    Ok(data)
}

pub fn obfuscate(req: &TransformRequest) -> Result<String, TransformError> {
    validate_request(req, false)?;

    todo!()
}

pub fn mask(req: &TransformRequest) -> Result<String, TransformError> {
    validate_request(req, false)?;

    let data_as_str = convert_bytes_to_string(&req.data)?;
    let value = gjson::get(data_as_str, req.path.as_str());

    match value.kind() {
        gjson::Kind::String => _mask(data_as_str, req.path.as_str(), '*', true),
        gjson::Kind::Number => _mask(data_as_str, req.path.as_str(), '0', false),
        _ => Err(TransformError::Generic(format!(
            "unable to mask data: path '{}' is not a string or number",
            req.path
        ))),
    }
}

fn _mask(data: &str, path: &str, mask_char: char, quote: bool) -> Result<String, TransformError> {
    let contents = gjson::get(data, path);
    let num_chars_to_mask = (0.8 * contents.str().len() as f64).round() as usize;
    let num_chars_to_skip = contents.str().len() - num_chars_to_mask as usize;

    let mut masked = contents.str()[0..num_chars_to_skip].to_string()
        + mask_char
            .to_string()
            .repeat(num_chars_to_mask.clone())
            .as_str();

    if quote {
        masked = format!("\"{}\"", masked);
    }

    Ok(gjson::set_overwrite(data, path, &masked)
        .map_err(|e| TransformError::Generic(format!("unable to mask data: {}", e)))?)
}

fn validate_request(req: &TransformRequest, value_check: bool) -> Result<(), TransformError> {
    if req.path.is_empty() {
        return Err(TransformError::Generic("path cannot be empty".to_string()));
    }

    if req.data.is_empty() {
        return Err(TransformError::Generic("data cannot be empty".to_string()));
    }

    if value_check && req.value.is_empty() {
        return Err(TransformError::Generic("value cannot be empty".to_string()));
    }

    // Is this valid JSON?
    if !gjson::valid(convert_bytes_to_string(&req.data)?) {
        return Err(TransformError::Generic(
            "data is not valid JSON".to_string(),
        ));
    }

    // Valid path?
    if !gjson::get(convert_bytes_to_string(&req.data)?, req.path.as_str()).exists() {
        return Err(TransformError::Generic(format!(
            "path '{}' not found in data",
            req.path
        )));
    }

    Ok(())
}

fn convert_bytes_to_string(bytes: &Vec<u8>) -> Result<&str, TransformError> {
    Ok(std::str::from_utf8(bytes.as_slice())
        .map_err(|e| TransformError::Generic(format!("unable to parse data as UTF-8: {}", e))))?
}
