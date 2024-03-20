use conv::prelude::*;
use protos::sp_steps_detective::DetectiveStepResultMatch;
use serde_json::{Map, Value};
use streamdal_gjson as gjson;
use streamdal_gjson::Kind;

#[derive(Debug)]
pub enum TransformError {
    Generic(String),
}

pub enum TruncateType {
    Chars,
    Percent,
}

pub struct TruncateOptions {
    pub length: usize,
    pub truncate_type: TruncateType,
}

pub struct ExtractOptions {
    pub flatten: bool,
}

pub struct Request {
    pub data: Vec<u8>,
    pub value: String,
    pub paths: Vec<DetectiveStepResultMatch>,

    // TODO: we'll eventually have to pass protos directly to those functions
    // TODO: but let's keep changes simple for now ~MG 2024-01-02
    pub truncate_options: Option<TruncateOptions>,
    pub extract_options: Option<ExtractOptions>,
}

fn extract_array(value: &streamdal_gjson::Value) -> Result<serde_json::Value, TransformError> {
    
    let mut array = Value::Array(Vec::new());
    for element in value.array() {
        match element.kind() {
            Kind::String => {
                array
                    .as_array_mut()
                    .unwrap()
                    .push(Value::String(element.to_string()));
            }
            Kind::Number => {
                array
                    .as_array_mut()
                    .unwrap()
                    .push(element.to_string().parse().unwrap());
            }
            Kind::True => {
                array.as_array_mut().unwrap().push(Value::Bool(true));
            }
            Kind::False => {
                array.as_array_mut().unwrap().push(Value::Bool(false));
            }
            Kind::Null => {
                array.as_array_mut().unwrap().push(Value::Null);
            }
            Kind::Object => {
                let obj = Value::Object(serde_json::from_str(element.str()).unwrap());
                array.as_array_mut().unwrap().push(obj);
            }
            Kind::Array => match extract_array(&element) {
                Ok(v) => {
                    array.as_array_mut().unwrap().push(v);
                }
                Err(e) => {
                    return Err(e);
                }
            },
        }
    }

    Ok(array)
}

fn extract_number(json_str: &str) -> Result<serde_json::Value, TransformError> {
    // Parse the JSON string
    let parsed_value: Result<Value, _> = serde_json::from_str(json_str);

    match parsed_value {
        Ok(value) => {
            // Check if the parsed value is a number
            if value.is_number() {
                Ok(value)
            } else {
                Err(TransformError::Generic(
                    "unable to extract data: path is not a valid number".to_string(),
                ))
            }
        }

        Err(e) => Err(TransformError::Generic(e.to_string())), // JSON parsing error
    }
}

fn extract_key(value: &streamdal_gjson::Value) -> Result<serde_json::Value, TransformError> {
    match value.kind() {
        Kind::String => Ok(Value::String(value.to_string())),
        Kind::Number => match extract_number(value.to_string().as_str()) {
            Ok(num) => Ok(num),
            Err(e) => Err(e),
        },
        Kind::True => Ok(Value::Bool(true)),
        Kind::False => Ok(Value::Bool(false)),
        Kind::Null => Ok(Value::Null),
        Kind::Array => {
            // Convert from gjson to serde type :/
            match extract_array(value) {
                Ok(array) => Ok(array),
                Err(e) => Err(e),
            }
        }
        _ => Err(TransformError::Generic(format!(
            "unable to extract data: unknown type for value: `{}`",
            value
        ))),
    }
}

pub fn extract(req: &Request) -> Result<String, TransformError> {
    validate_extract_request(req)?;

    let extract_options = match &req.extract_options {
        Some(options) => options,
        None => {
            return Err(TransformError::Generic(
                "unable to extract data: options not provided".to_string(),
            ))
        }
    };

    let data_as_str = convert_bytes_to_string(&req.data)?;

    if extract_options.flatten {
        extract_and_flatten(data_as_str, &req.paths)
    } else {
        extract_with_layout(data_as_str, &req.paths)
    }
}

pub fn extract_with_layout(data: &str, paths: &Vec<DetectiveStepResultMatch>) -> Result<String, TransformError> {
    let mut root = Value::Object(Map::new());

    let mut current_element = &mut root;
    for dr in paths {
        let value = gjson::get(data, dr.path.as_str());
        if !value.exists() {
            continue;
        }

        // Split path by ".". If we're flattening it, just get last element and insert into hashmap
        // Otherwise, we need to recursively create sub-hashmaps for each element in the path before
        // inserting the value.
        let path_elements: Vec<&str> = dr.path.split('.').collect();

        for (i, path_element) in path_elements.iter().enumerate() {
            // Check if we're in the last element of the path, if so, we're inserting the value
            if i == path_elements.len() - 1 {
                let parsed_value = match extract_key(&value) {
                    Ok(key) => key,
                    Err(e) => return Err(e),
                };
                if current_element.is_array() {
                    if !path_element.ends_with('#') {
                        // We need to create the object and insert it into the array
                        if parsed_value.is_array() {
                            for v in parsed_value.as_array().unwrap() {
                                let mut new_obj = Value::Object(Map::new());
                                new_obj.as_object_mut().unwrap().insert(path_element.to_string(), v.clone());

                                let current_array = current_element.as_array_mut().unwrap();
                                current_array.push(new_obj);
                            }
                        }
                    } else {
                        // TODO: how to handle this case?
                    }
                } else {
                    current_element.as_object_mut().unwrap().insert(path_element.to_string(), parsed_value);
                }
                continue;
            }

            // Check if the next element in the path is an array, if so, we need to create a new array object
            if let Some(next_element) = path_elements.get(i + 1) {
                if next_element.ends_with('#') {
                    if !current_element.as_object().unwrap().contains_key(*path_element) {
                        current_element
                            .as_object_mut()
                            .unwrap()
                            .insert(path_element.to_string(), Value::Array(Vec::new()));
                    }

                    // Set current element to be the new array object
                    current_element = current_element.as_object_mut().unwrap().get_mut(*path_element).unwrap();
                    continue
                }
            }

            // This level doesn't have the value we're looking for, so we need to create a new map object
            // and assign it to the key of the current_element
            if let Some(existing_key) = current_element.as_object() {
                if !existing_key.contains_key(*path_element) {
                    current_element
                        .as_object_mut()
                        .unwrap()
                        .insert(path_element.to_string(), Value::Object(Map::new()));
                }

                // Set current element to be the new map object
                current_element = current_element.as_object_mut().unwrap().get_mut(*path_element).unwrap();
            }
        }
    }

    // Convert serde map to json string
    if let Ok(res) = serde_json::to_string(root.as_object().unwrap()) {
        Ok(res)
    } else {
        Err(TransformError::Generic(
            "unable to extract data: unable to serialize data".to_string(),
        ))
    }
}

pub fn extract_and_flatten(data: &str, paths: &Vec<DetectiveStepResultMatch>) -> Result<String, TransformError> {
    let mut root = Map::new();
    for dr in paths {
        let value = gjson::get(data, dr.path.as_str());
        if !value.exists() {
            continue;
        }

        // Split path by ".". If we're flattening it, just get last element and insert into hashmap
        // Otherwise, we need to recursively create sub-hashmaps for each element in the path before
        // inserting the value.
        let path_elements: Vec<&str> = dr.path.split('.').collect();

        let parsed_value = match extract_key(&value) {
            Ok(key) => key,
            Err(e) => return Err(e),
        };

        root.insert(path_elements.last().unwrap().to_string(), parsed_value);
    }

    // Convert serde map to json string
    if let Ok(res) = serde_json::to_string(&root) {
        Ok(res)
    } else {
        Err(TransformError::Generic(
            "unable to extract data: unable to serialize data".to_string(),
        ))
    }
}

pub fn overwrite(req: &Request) -> Result<String, TransformError> {
    validate_request(req, true)?;

    let mut data = req.data.clone();

    for dr in &req.paths {
        let value = gjson::get(convert_bytes_to_string(&data)?, dr.path.as_str());
        if !value.exists() {
            continue;
        }

        let overwrite_with = req.value.clone();

        match gjson::set_overwrite(
            convert_bytes_to_string(&data)?,
            dr.path.as_str(),
            overwrite_with.as_str(),
        ) {
            Ok(d) => data = d.into_bytes(),
            Err(e) => {
                return Err(TransformError::Generic(format!(
                    "unable to overwrite data: {}",
                    e
                )))
            }
        }
    }

    String::from_utf8(data).map_err(|e| TransformError::Generic(e.to_string()))
}

pub fn truncate(req: &Request) -> Result<String, TransformError> {
    validate_request(req, false)?;

    let truncate_options = match &req.truncate_options {
        Some(options) => options,
        None => {
            return Err(TransformError::Generic(
                "unable to truncate data: options not provided".to_string(),
            ))
        }
    };

    let mut data_as_string = String::from_utf8(req.data.clone()).map_err(|e| {
        TransformError::Generic(format!("unable to convert bytes to string: {}", e))
    })?;

    for dr in &req.paths {
        let data_as_str = data_as_string.as_str();
        let value = gjson::get(data_as_str, dr.path.as_str());
        let length_of_field = gjson::get(data_as_str, dr.path.as_str()).to_string().len();

        let truncate_length = get_truncate_length(truncate_options, length_of_field);

        match value.kind() {
            gjson::Kind::String => {
                match _truncate(data_as_str, dr.path.as_str(), &truncate_length) {
                    Ok(new_data) => data_as_string = new_data,
                    Err(e) => return Err(e),
                }
            }
            _ => {
                return Err(TransformError::Generic(format!(
                    "unable to truncate data: path '{}' is not a string",
                    dr.path.as_str(),
                )))
            }
        }
    }

    Ok(data_as_string)
}

fn get_truncate_length(truncate_options: &TruncateOptions, length_of_field: usize) -> usize {
    let truncate_length = match &truncate_options.truncate_type {
        #[allow(clippy::clone_on_copy)]
        TruncateType::Chars => {
            if truncate_options.length > length_of_field {
                length_of_field
            } else {
                length_of_field - truncate_options.length.clone()
            }
        }
        TruncateType::Percent => {
            let my_usize_reference =
                100.0 - &truncate_options.length.value_as::<f64>().unwrap_or(0.0);
            let num_chars_to_keep: f64 = length_of_field as f64 * (my_usize_reference / 100.0);
            num_chars_to_keep.round() as usize
        }
    };

    truncate_length.clamp(0, length_of_field)
}

#[allow(clippy::to_string_in_format_args)]
fn _truncate(data: &str, path: &str, len: &usize) -> Result<String, TransformError> {
    let contents = gjson::get(data, path);

    let num_chars_to_keep = contents.str().len() - len;

    let truncated = format!("\"{}\"", contents.str()[0..num_chars_to_keep].to_string());

    let data = gjson::set_overwrite(data, path, &truncated)
        .map_err(|e| TransformError::Generic(format!("unable to truncate data: {}", e)))?;

    Ok(data)
}

pub fn delete(req: &Request) -> Result<String, TransformError> {
    validate_request(req, false)?;

    let mut data_as_string = String::from_utf8(req.data.clone()).map_err(|e| {
        TransformError::Generic(format!("unable to convert bytes to string: {}", e))
    })?;

    for dr in &req.paths {
        let data_as_str = data_as_string.as_str();
        match _delete(data_as_str, dr.path.as_str()) {
            Ok(new_data) => data_as_string = new_data,
            Err(e) => return Err(e),
        }
    }

    Ok(data_as_string)
}

fn _delete(data: &str, path: &str) -> Result<String, TransformError> {
    let data = gjson::delete_path(data, path)
        .map_err(|e| TransformError::Generic(format!("unable to delete data: {}", e)))?;

    Ok(data)
}

pub fn obfuscate(req: &Request) -> Result<String, TransformError> {
    validate_request(req, false)?;

    let mut data_as_string = String::from_utf8(req.data.clone()).map_err(|e| {
        TransformError::Generic(format!("unable to convert bytes to string: {}", e))
    })?;

    for dr in &req.paths {
        let data_as_str = data_as_string.as_str();
        let value = gjson::get(data_as_str, dr.path.as_str());

        match value.kind() {
            gjson::Kind::String => match _obfuscate(data_as_str, dr.path.as_str()) {
                Ok(new_data) => data_as_string = new_data,
                Err(e) => return Err(e),
            },
            _ => {
                return Err(TransformError::Generic(format!(
                    "unable to mask data: path '{}' is not a string or number",
                    dr.path.as_str()
                )))
            }
        }
    }

    Ok(data_as_string)
}

fn _obfuscate(data: &str, path: &str) -> Result<String, TransformError> {
    let contents = gjson::get(data, path);
    let hashed = sha256::digest(contents.str().as_bytes());

    let obfuscated = format!("\"sha256:{}\"", hashed);

    gjson::set_overwrite(data, path, &obfuscated)
        .map_err(|e| TransformError::Generic(format!("unable to obfuscate data: {}", e)))
}

pub fn mask(req: &Request) -> Result<String, TransformError> {
    validate_request(req, false)?;

    let mut data_as_string = String::from_utf8(req.data.clone()).map_err(|e| {
        TransformError::Generic(format!("unable to convert bytes to string: {}", e))
    })?;

    for dr in &req.paths {
        let data_as_str = data_as_string.as_str();
        let value = gjson::get(data_as_str, dr.path.as_str());

        match value.kind() {
            gjson::Kind::String => {
                let mask_char = req.value.chars().next().unwrap_or('*');
                match _mask(data_as_str, dr.path.as_str(), mask_char, true) {
                    Ok(new_data) => data_as_string = new_data,
                    Err(e) => return Err(e),
                }
            }
            gjson::Kind::Number => {
                let mut mask_char = req.value.chars().next().unwrap_or('0');
                if !mask_char.is_ascii_digit() {
                    mask_char = '0';
                }

                match _mask(data_as_str, dr.path.as_str(), mask_char, false) {
                    Ok(new_data) => data_as_string = new_data,
                    Err(e) => return Err(e),
                }
            }
            _ => {
                return Err(TransformError::Generic(format!(
                    "unable to mask data: path '{}' is not a string or number",
                    dr.path.clone()
                )))
            }
        }
    }

    Ok(data_as_string)
}

fn _mask(data: &str, path: &str, mask_char: char, quote: bool) -> Result<String, TransformError> {
    let contents = gjson::get(data, path);
    let num_chars_to_mask = (0.8 * contents.str().len() as f64).round() as usize;
    let num_chars_to_skip = contents.str().len() - num_chars_to_mask;

    let mut masked = contents.str()[0..num_chars_to_skip].to_string()
        + mask_char.to_string().repeat(num_chars_to_mask).as_str();

    if quote {
        masked = format!("\"{}\"", masked);
    }

    gjson::set_overwrite(data, path, &masked)
        .map_err(|e| TransformError::Generic(format!("unable to mask data: {}", e)))
}

fn validate_request(req: &Request, _value_check: bool) -> Result<(), TransformError> {
    if req.data.is_empty() {
        return Err(TransformError::Generic("data cannot be empty".to_string()));
    }

    // Is this valid JSON?
    if !gjson::valid(convert_bytes_to_string(&req.data)?) {
        return Err(TransformError::Generic(
            "data is not valid JSON".to_string(),
        ));
    }

    let data = convert_bytes_to_string(&req.data)?;

    // Valid path?
    for dr in &req.paths {
        if !gjson::get(data, dr.path.as_str()).exists() {
            return Err(TransformError::Generic(format!(
                "path '{}' not found in data",
                dr.path
            )));
        }
    }
    Ok(())
}

fn validate_extract_request(req: &Request) -> Result<(), TransformError> {
    if req.data.is_empty() {
        return Err(TransformError::Generic("data cannot be empty".to_string()));
    }

    // Is this valid JSON?
    if !gjson::valid(convert_bytes_to_string(&req.data)?) {
        return Err(TransformError::Generic(
            "data is not valid JSON".to_string(),
        ));
    }

    if req.extract_options.is_none() {
        return Err(TransformError::Generic(
            "extract options not provided".to_string(),
        ));
    }

    Ok(())
}

fn convert_bytes_to_string(bytes: &Vec<u8>) -> Result<&str, TransformError> {
    Ok(std::str::from_utf8(bytes.as_slice())
        .map_err(|e| TransformError::Generic(format!("unable to parse data as UTF-8: {}", e))))?
}

#[cfg(test)]
mod tests {
    use crate::test_utils::SAMPLE_JSON_BYTES;
    use super::*;

    const TEST_DATA: &str = r#"{
    "foo": "bar",
    "baz": {
        "qux": "quux"
    },
    "bool": true
}"#;

    #[test]
    fn test_overwrite() {
        let mut req = Request {
            data: TEST_DATA.as_bytes().to_vec(),
            paths: vec![DetectiveStepResultMatch {
                path: "baz.qux".to_string(),
                ..Default::default()
            }],
            value: "\"test\"".to_string(),
            truncate_options: None,
            extract_options: None,
        };

        let result = overwrite(&req).unwrap();

        assert!(gjson::valid(TEST_DATA));
        assert!(gjson::valid(&result));
        assert_eq!(result, TEST_DATA.replace("quux", "test"));

        let v = gjson::get(TEST_DATA, "baz.qux");
        assert_eq!(v.str(), "quux");

        let v = gjson::get(result.as_str(), "baz.qux");
        assert_eq!(v.str(), "test");

        req.paths = vec![DetectiveStepResultMatch {
            path: "does-not-exist".to_string(),
            value: "".to_string().into_bytes(),
            ..Default::default()
        }];
        assert!(
            overwrite(&req).is_err(),
            "should error when path does not exist"
        );

        // Can overwrite anything
        req.paths = vec![];
        req.paths = vec![DetectiveStepResultMatch {
            path: "bool".to_string(),
            value: "".to_string().into_bytes(),
            ..Default::default()
        }];
        assert!(
            overwrite(&req).is_ok(),
            "should be able to replace any value, regardless of type"
        );
    }

    #[test]
    fn test_obfuscate() {
        let mut req = Request {
            data: TEST_DATA.as_bytes().to_vec(),
            paths: vec![DetectiveStepResultMatch {
                path: "baz.qux".to_string(),
                ..Default::default()
            }],
            value: "*".to_string(),
            truncate_options: None,
            extract_options: None,
        };

        let result = obfuscate(&req).unwrap();
        let hashed_value = sha256::digest("quux".as_bytes());

        assert!(gjson::valid(TEST_DATA));
        assert!(gjson::valid(&result));

        let v = gjson::get(TEST_DATA, "baz.qux");
        assert_eq!(v.str(), "quux");

        let v = gjson::get(result.as_str(), "baz.qux");
        assert_eq!(v.str(), format!("sha256:{}", hashed_value));

        // path does not exist
        req.paths = vec![DetectiveStepResultMatch {
            path: "does-not-exist".to_string(),
            value: "\"test\"".to_string().into_bytes(),
            ..Default::default()
        }];
        assert!(obfuscate(&req).is_err());

        // path not a string
        req.paths = vec![DetectiveStepResultMatch {
            path: "bool".to_string(),
            value: "\"test\"".to_string().into_bytes(),
            ..Default::default()
        }];
        assert!(obfuscate(&req).is_err());
    }

    #[test]
    fn test_mask() {
        let mut req = Request {
            data: TEST_DATA.as_bytes().to_vec(),
            value: "#".to_string(),
            paths: vec![DetectiveStepResultMatch {
                path: "baz.qux".to_string(),
                ..Default::default()
            }],
            truncate_options: None,
            extract_options: None,
        };

        let result = mask(&req).unwrap();

        assert!(gjson::valid(TEST_DATA));
        assert!(gjson::valid(&result));

        let v = gjson::get(TEST_DATA, "baz.qux");
        assert_eq!(v.str(), "quux");

        let v = gjson::get(result.as_str(), "baz.qux");
        assert_eq!(v.str(), "q###");

        // path does not exist
        req.paths = vec![DetectiveStepResultMatch {
            path: "does-not-exist".to_string(),
            value: "\"test\"".to_string().into_bytes(),
            ..Default::default()
        }];
        assert!(mask(&req).is_err());

        // path not a string
        req.paths = vec![DetectiveStepResultMatch {
            path: "bool".to_string(),
            value: "\"test\"".to_string().into_bytes(),
            ..Default::default()
        }];
        assert!(mask(&req).is_err());
    }

    #[test]
    fn test_truncate_chars() {
        let mut req = Request {
            data: TEST_DATA.as_bytes().to_vec(),
            value: "".to_string(),
            paths: vec![DetectiveStepResultMatch {
                path: "baz.qux".to_string(),
                ..Default::default()
            }],
            truncate_options: Some(TruncateOptions {
                length: 1,
                truncate_type: TruncateType::Chars,
            }),
            extract_options: None,
        };

        let result = truncate(&req).unwrap();

        assert!(gjson::valid(TEST_DATA));
        assert!(gjson::valid(&result));

        let v = gjson::get(TEST_DATA, "baz.qux");
        assert_eq!(v.str(), "quux");

        let v = gjson::get(result.as_str(), "baz.qux");
        assert_eq!(v.str(), "q");

        // path does not exist
        // path does not exist
        req.paths = vec![DetectiveStepResultMatch {
            path: "does-not-exist".to_string(),
            value: "\"test\"".to_string().into_bytes(),
            ..Default::default()
        }];
        assert!(truncate(&req).is_err());

        // path not a string
        req.paths = vec![DetectiveStepResultMatch {
            path: "bool".to_string(),
            value: "\"test\"".to_string().into_bytes(),
            ..Default::default()
        }];
        assert!(truncate(&req).is_err());
    }

    #[test]
    fn test_truncate_chars_over_length() {
        let req = Request {
            data: TEST_DATA.as_bytes().to_vec(),
            value: "".to_string(),
            paths: vec![DetectiveStepResultMatch {
                path: "baz.qux".to_string(),
                ..Default::default()
            }],
            truncate_options: Some(TruncateOptions {
                length: 5,
                truncate_type: TruncateType::Chars,
            }),
            extract_options: None,
        };

        let result = truncate(&req).unwrap();

        assert!(gjson::valid(TEST_DATA));
        assert!(gjson::valid(&result));

        let v = gjson::get(TEST_DATA, "baz.qux");
        assert_eq!(v.str(), "quux");

        let v = gjson::get(result.as_str(), "baz.qux");
        assert_eq!(v.str(), "");
    }

    #[test]
    fn test_truncate_percent() {
        let req = Request {
            data: TEST_DATA.as_bytes().to_vec(),
            value: "".to_string(),
            paths: vec![DetectiveStepResultMatch {
                path: "baz.qux".to_string(),
                ..Default::default()
            }],
            truncate_options: Some(TruncateOptions {
                length: 25,
                truncate_type: TruncateType::Percent,
            }),
            extract_options: None,
        };

        let result = truncate(&req).unwrap();

        assert!(gjson::valid(TEST_DATA));
        assert!(gjson::valid(&result));

        let v = gjson::get(TEST_DATA, "baz.qux");
        assert_eq!(v.str(), "quux");

        let v = gjson::get(result.as_str(), "baz.qux");
        assert_eq!(v.str(), "q");
    }

    #[test]
    fn test_delete() {
        let req = Request {
            data: TEST_DATA.as_bytes().to_vec(),
            value: "".to_string(),
            paths: vec![DetectiveStepResultMatch {
                path: "baz.qux".to_string(),
                ..Default::default()
            }],
            truncate_options: None,
            extract_options: None,
        };

        let result = delete(&req).unwrap();

        assert!(gjson::valid(TEST_DATA));
        assert!(gjson::valid(&result));

        let v = gjson::get(TEST_DATA, "baz.qux");
        assert_eq!(v.str(), "quux");

        let v = gjson::get(result.as_str(), "baz.qux");
        assert_eq!(v.exists(), false);
    }

    #[test]
    fn test_extract_flatten() {
        let req = Request {
            data: TEST_DATA.as_bytes().to_vec(),
            value: "".to_string(),
            paths: vec![
                DetectiveStepResultMatch {
                    path: "foo".to_string(),
                    ..Default::default()
                },
                DetectiveStepResultMatch {
                    path: "baz.qux".to_string(),
                    ..Default::default()
                },
            ],
            truncate_options: None,
            extract_options: Some(ExtractOptions {
                flatten: true,
                //paths: vec!["foo".to_string(), "baz.qux".to_string()],
            }),
        };

        let result = extract(&req).unwrap();

        assert!(gjson::valid(result.as_str()));
        assert_eq!(result, r#"{"foo":"bar","qux":"quux"}"#);
    }

    #[test]
    fn test_extract_no_flatten() {
        let req = Request {
            data: TEST_DATA.as_bytes().to_vec(),
            value: "".to_string(),
            paths: vec![
                DetectiveStepResultMatch {
                    path: "foo".to_string(),
                    ..Default::default()
                },
                DetectiveStepResultMatch {
                    path: "baz.qux".to_string(),
                    ..Default::default()
                },
            ],
            truncate_options: None,
            extract_options: Some(ExtractOptions { flatten: false }),
        };

        let result = extract(&req).unwrap();

        assert!(gjson::valid(result.as_str()));
        assert_eq!(result, r#"{"baz":{"qux":"quux"},"foo":"bar"}"#);
    }

    #[test]
    fn test_extract_scalar_types() {
        let mut req = Request {
            data: r#"{
                "string": "bar",
                "number": 1,
                "float": 1.0,
                "bigint": 9007199254740991,
                "signed_int": -1,
                "bool": true,
                "null": null
            }"#
            .as_bytes()
            .to_vec(),
            value: "".to_string(),
            paths: Vec::<DetectiveStepResultMatch>::new(),
            truncate_options: None,
            extract_options: Some(ExtractOptions { flatten: true }),
        };

        let paths = vec![
            "string".to_string(),
            "number".to_string(),
            "bool".to_string(),
            "null".to_string(),
            "float".to_string(),
            "bigint".to_string(),
            "signed_int".to_string(),
        ];

        for p in paths {
            req.paths.push(DetectiveStepResultMatch {
                path: p,
                ..Default::default()
            });
        }

        let result = extract(&req).unwrap();

        assert!(gjson::valid(result.as_str()));
        assert_eq!(
            result,
            r#"{"bigint":9007199254740991,"bool":true,"float":1.0,"null":null,"number":1,"signed_int":-1,"string":"bar"}"#
        );
    }

    #[test]
    fn test_extract_arrays() {
        let req = Request {
            data: r#"{"users": [
                {"name": "Alice", "age": 30},
                {"name": "Bob", "age": 31}
            ]}"#
            .as_bytes()
            .to_vec(),
            value: "".to_string(),
            paths: vec![DetectiveStepResultMatch {
                path: "users".to_string(),
                ..Default::default()
            }],
            truncate_options: None,
            extract_options: Some(ExtractOptions { flatten: false }),
        };

        let result = extract(&req).unwrap();

        let expected = r#"{"users":[{"age":30,"name":"Alice"},{"age":31,"name":"Bob"}]}"#;

        assert!(gjson::valid(result.as_str()));
        assert_eq!(result, expected);
    }

    #[test]
    fn test_extract_array_object_field() {
        let req = Request {
            data: r#"{"users": [
                {"name": "Alice", "age": 30},
                {"name": "Bob", "age": 31}
            ]}"#
            .as_bytes()
            .to_vec(),
            value: "".to_string(),
            paths: vec![DetectiveStepResultMatch {
                path: "users.#.name".to_string(),
                ..Default::default()
            }],
            truncate_options: None,
            extract_options: Some(ExtractOptions { flatten: false }),
        };

        let result = extract(&req).unwrap();

        let expected = r#"{"users":[{"name":"Alice"},{"name":"Bob"}]}"#;

        assert!(gjson::valid(result.as_str()));
        assert_eq!(result, expected);
    }

    #[test]
    fn test_extract_k8s_field() {
        let req = Request {
            data: SAMPLE_JSON_BYTES.clone(),
            value: "".to_string(),
            paths: vec![DetectiveStepResultMatch {
                path: "status.containerStatuses.#.restartCount".to_string(),
                ..Default::default()
            }],
            truncate_options: None,
            extract_options: Some(ExtractOptions { flatten: false }),
        };

        let result = extract(&req).unwrap();

        let expected = r#"{"status":{"containerStatuses":[{"restartCount":0}]}}"#;

        assert!(gjson::valid(result.as_str()));
        assert_eq!(result, expected);
    }

    #[test]
    fn test_transform_array_subobject() {
        let req = Request {
            data: r#"{"users": [
                {"name": "Alice", "age": 30},
                {"name": "Bob", "age": 31}
            ]}"#
            .as_bytes()
            .to_vec(),
            value: "\"REDACTED\"".to_string(),
            paths: vec![DetectiveStepResultMatch {
                path: "users.0.name".to_string(),
                ..Default::default()
            }],
            truncate_options: None,
            extract_options: None,
        };

        let result = overwrite(&req).unwrap();

        let expected = r#"{"users": [
                {"name": "REDACTED", "age": 30},
                {"name": "Bob", "age": 31}
            ]}"#;

        assert!(gjson::valid(result.as_str()));
        assert_eq!(result, expected);
    }
}
