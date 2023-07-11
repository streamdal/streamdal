use crate::error::CustomError;
use gjson::Value;

pub mod detective;
pub mod error;
pub mod matcher_core;
pub mod matcher_numeric;
pub mod matcher_pii;

#[cfg(test)]
#[path = "matcher_numeric_tests.rs"]
mod matcher_numeric_tests;

#[cfg(test)]
#[path = "matcher_core_tests.rs"]
mod matcher_core_tests;

#[cfg(test)]
#[path = "matcher_pii_tests.rs"]
mod matcher_pii_tests;

#[cfg(test)]
#[path = "test_utils.rs"]
mod test_utils;

pub trait FromValue<'a>
where
    Self: Sized,
{
    fn from_value(value: Value<'a>) -> Result<Self, CustomError>;
}

impl FromValue<'_> for bool {
    fn from_value(value: Value) -> Result<Self, CustomError> {
        if value.kind() != gjson::Kind::True && value.kind() != gjson::Kind::False {
            return Err(CustomError::Error("not a boolean".to_string()));
        }

        Ok(value.bool())
    }
}

impl FromValue<'_> for f64 {
    fn from_value(value: Value) -> Result<Self, CustomError> {
        if value.kind() != gjson::Kind::Number {
            return Err(CustomError::Error("not a number".to_string()));
        }

        Ok(value.f64())
    }
}

impl<'a> FromValue<'a> for Value<'a> {
    fn from_value(value: Value<'a>) -> Result<Value<'a>, CustomError> {
        Ok(value)
    }
}

impl FromValue<'_> for String {
    fn from_value(value: Value) -> Result<Self, CustomError> {
        Ok(value.to_string())
    }
}
