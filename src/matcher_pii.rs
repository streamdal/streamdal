use crate::detective::Request;
use crate::error::CustomError;

pub fn any(_request: &Request) -> Result<bool, CustomError> {
    Err(CustomError::Error("not implemented".to_string()))
}

pub fn credit_card(_request: &Request) -> Result<bool, CustomError> {
    Err(CustomError::Error("not implemented".to_string()))
}

pub fn ssn(_request: &Request) -> Result<bool, CustomError> {
    Err(CustomError::Error("not implemented".to_string()))
}

pub fn email(_request: &Request) -> Result<bool, CustomError> {
    Err(CustomError::Error("not implemented".to_string()))
}

pub fn drivers_license(_request: &Request) -> Result<bool, CustomError> {
    Err(CustomError::Error("not implemented".to_string()))
}

pub fn passport_id(_request: &Request) -> Result<bool, CustomError> {
    Err(CustomError::Error("not implemented".to_string()))
}

pub fn vin_number(_request: &Request) -> Result<bool, CustomError> {
    Err(CustomError::Error("not implemented".to_string()))
}

pub fn phone(_request: &Request) -> Result<bool, CustomError> {
    Err(CustomError::Error("not implemented".to_string()))
}

// Intended to operate on the entire payload
pub fn serial_number(_request: &Request) -> Result<bool, CustomError> {
    Err(CustomError::Error("not implemented".to_string()))
}

// Intended to operate on the entire payload
pub fn login(_request: &Request) -> Result<bool, CustomError> {
    Err(CustomError::Error("not implemented".to_string()))
}

pub fn taxpayer_id(_request: &Request) -> Result<bool, CustomError> {
    Err(CustomError::Error("not implemented".to_string()))
}

// Intended to operate on the entire payload
pub fn address(_request: &Request) -> Result<bool, CustomError> {
    Err(CustomError::Error("not implemented".to_string()))
}

// Intended to operate on the entire payload
pub fn signature(_request: &Request) -> Result<bool, CustomError> {
    Err(CustomError::Error("not implemented".to_string()))
}

// Intended to operate on the entire payload
pub fn geolocation(_request: &Request) -> Result<bool, CustomError> {
    Err(CustomError::Error("not implemented".to_string()))
}

// Intended to operate on the entire payload
pub fn education(_request: &Request) -> Result<bool, CustomError> {
    Err(CustomError::Error("not implemented".to_string()))
}

// Intended to operate on the entire payload
pub fn financial(_request: &Request) -> Result<bool, CustomError> {
    Err(CustomError::Error("not implemented".to_string()))
}

// Intended to operate on the entire payload
pub fn health(_request: &Request) -> Result<bool, CustomError> {
    Err(CustomError::Error("not implemented".to_string()))
}
