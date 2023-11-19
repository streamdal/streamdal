use crate::detective::Request;
use crate::error::CustomError;
use crate::detective;
use idna::domain_to_ascii_strict;


pub fn any(_request: &Request) -> Result<bool, CustomError> {
    Err(CustomError::Error("not implemented".to_string()))
}

pub fn credit_card(request: &Request) -> Result<bool, CustomError> {
    let mut  num: String = detective::parse_field(request.data, &request.path)?;
    num = num.as_str().trim().replace("-", "").replace(" ", "");

    // Convert the card number string to a vector of digits
    let digits: Vec<u32> = num
        .chars()
        .filter_map(|c| c.to_digit(10))
        .collect();

    // Check if the number of digits is valid for a credit card
    if digits.len() < 13 || digits.len() > 19 {
        return Ok(false);
    }

    // Implement the Luhn algorithm
    let mut sum = 0;
    let mut double = false;

    for &digit in digits.iter().rev() {
        let mut value = digit;

        if double {
            value *= 2;

            if value > 9 {
                value -= 9;
            }
        }

        sum += value;
        double = !double;
    }

    let res = sum % 10 == 0;

    Ok(res)
}

pub fn ssn(_request: &Request) -> Result<bool, CustomError> {
    Err(CustomError::Error("not implemented".to_string()))
}

pub fn email(request: &Request) -> Result<bool, CustomError> {
    let email: String = detective::parse_field(request.data, &request.path)?;


    // Split the email address into local part and domain part
    let parts: Vec<&str> = email.trim().split('@').collect();

    // Ensure there are exactly two parts (local and domain)
    if parts.len() != 2 {
        return Ok(false);
    }

    // Check if local part is not empty
    let local_part = parts[0];
    if local_part.is_empty() {
        return Ok(false);
    }

    // Check if domain part is not empty
    let domain_part = parts[1];
    if domain_part.is_empty() {
        return Ok(false);
    }

    // Check for valid characters in local part
    for c in local_part.chars() {
        if !(c.is_ascii_alphanumeric() || c == '.' || c == '_' || c == '-') {
            if char::from_u32(c as u32).is_some() {
                continue;
            } else {
                return Ok(false);
            }
        }
    }

    // Support IDNA
    let decoded_domain = match domain_to_ascii_strict(domain_part) {
        Ok(ascii_domain) => ascii_domain,
        Err(_) => return Ok(false),
    };

    // Check for valid characters in the encoded domain part
    for c in decoded_domain.chars() {
        if !(c.is_ascii_alphanumeric() || c == '.' || c == '-') {
            return Ok(false);
        }
    }

    // Check if the encoded domain part contains at least one dot
    if !decoded_domain.contains('.') {
        return Ok(false);
    }

    // Dot can't be first or last character
    if decoded_domain.starts_with('.') || decoded_domain.ends_with('.') {
        return Ok(false);
    }

    Ok(true)
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
