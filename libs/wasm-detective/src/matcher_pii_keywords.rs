use streamdal_gjson::Value;
use crate::detective::Request;

pub fn keywords(_request: &Request, _field: Value) -> Result<bool, crate::error::CustomError> {
    // This method is here only to satisfy the enum requirements in get_matcher_func()
    Ok(false)
}