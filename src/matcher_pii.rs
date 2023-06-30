use crate::error::CustomError;
use crate::error::CustomError::Error;
use protos::matcher::MatchRequest;

pub fn all(_request: &MatchRequest) -> Result<bool, CustomError> {
    Err(Error("not implemented".to_string()))
}

pub fn credit_card(_request: &MatchRequest) -> Result<bool, CustomError> {
    Err(Error("not implemented".to_string()))
}

pub fn ssn(_request: &MatchRequest) -> Result<bool, CustomError> {
    Err(Error("not implemented".to_string()))
}

pub fn email(_request: &MatchRequest) -> Result<bool, CustomError> {
    Err(Error("not implemented".to_string()))
}

pub fn drivers_license(_request: &MatchRequest) -> Result<bool, CustomError> {
    Err(Error("not implemented".to_string()))
}

pub fn passport_id(_request: &MatchRequest) -> Result<bool, CustomError> {
    Err(Error("not implemented".to_string()))
}

pub fn vin_number(_request: &MatchRequest) -> Result<bool, CustomError> {
    Err(Error("not implemented".to_string()))
}

pub fn phone(_request: &MatchRequest) -> Result<bool, CustomError> {
    Err(Error("not implemented".to_string()))
}

pub fn serial_number(_request: &MatchRequest) -> Result<bool, CustomError> {
    Err(Error("not implemented".to_string()))
}

pub fn login(_request: &MatchRequest) -> Result<bool, CustomError> {
    Err(Error("not implemented".to_string()))
}

pub fn taxpayer_id(_request: &MatchRequest) -> Result<bool, CustomError> {
    Err(Error("not implemented".to_string()))
}

pub fn address(_request: &MatchRequest) -> Result<bool, CustomError> {
    Err(Error("not implemented".to_string()))
}

pub fn signature(_request: &MatchRequest) -> Result<bool, CustomError> {
    Err(Error("not implemented".to_string()))
}

pub fn geolocation(_request: &MatchRequest) -> Result<bool, CustomError> {
    Err(Error("not implemented".to_string()))
}

pub fn education(_request: &MatchRequest) -> Result<bool, CustomError> {
    Err(Error("not implemented".to_string()))
}

pub fn financial(_request: &MatchRequest) -> Result<bool, CustomError> {
    Err(Error("not implemented".to_string()))
}

pub fn health(_request: &MatchRequest) -> Result<bool, CustomError> {
    Err(Error("not implemented".to_string()))
}
