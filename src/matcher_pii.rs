use crate::detective;
use crate::error::CustomError;
use gjson::Value;
use protos::detective::DetectiveStep;

pub fn any(_request: &DetectiveStep) -> Result<bool, CustomError> {
    Err(CustomError::Error("not implemented".to_string()))
}

pub fn credit_card(_request: &DetectiveStep) -> Result<bool, CustomError> {
    Err(CustomError::Error("not implemented".to_string()))
}

pub fn ssn(_request: &DetectiveStep) -> Result<bool, CustomError> {
    Err(CustomError::Error("not implemented".to_string()))
}

pub fn email(_request: &DetectiveStep) -> Result<bool, CustomError> {
    Err(CustomError::Error("not implemented".to_string()))
}

pub fn drivers_license(_request: &DetectiveStep) -> Result<bool, CustomError> {
    Err(CustomError::Error("not implemented".to_string()))
}

pub fn passport_id(_request: &DetectiveStep) -> Result<bool, CustomError> {
    Err(CustomError::Error("not implemented".to_string()))
}

pub fn vin_number(_request: &DetectiveStep) -> Result<bool, CustomError> {
    Err(CustomError::Error("not implemented".to_string()))
}

pub fn phone(_request: &DetectiveStep) -> Result<bool, CustomError> {
    Err(CustomError::Error("not implemented".to_string()))
}

// Intended to operate on the entire payload
pub fn serial_number(_request: &DetectiveStep) -> Result<bool, CustomError> {
    Err(CustomError::Error("not implemented".to_string()))
}

// Intended to operate on the entire payload
pub fn login(_request: &DetectiveStep) -> Result<bool, CustomError> {
    Err(CustomError::Error("not implemented".to_string()))
}

pub fn taxpayer_id(_request: &DetectiveStep) -> Result<bool, CustomError> {
    Err(CustomError::Error("not implemented".to_string()))
}

// Intended to operate on the entire payload
pub fn address(_request: &DetectiveStep) -> Result<bool, CustomError> {
    Err(CustomError::Error("not implemented".to_string()))
}

// Intended to operate on the entire payload
pub fn signature(_request: &DetectiveStep) -> Result<bool, CustomError> {
    Err(CustomError::Error("not implemented".to_string()))
}

// Intended to operate on the entire payload
pub fn geolocation(_request: &DetectiveStep) -> Result<bool, CustomError> {
    Err(CustomError::Error("not implemented".to_string()))
}

// Intended to operate on the entire payload
pub fn education(_request: &DetectiveStep) -> Result<bool, CustomError> {
    Err(CustomError::Error("not implemented".to_string()))
}

// Intended to operate on the entire payload
pub fn financial(_request: &DetectiveStep) -> Result<bool, CustomError> {
    Err(CustomError::Error("not implemented".to_string()))
}

// Intended to operate on the entire payload
pub fn health(_request: &DetectiveStep) -> Result<bool, CustomError> {
    Err(CustomError::Error("not implemented".to_string()))
}
