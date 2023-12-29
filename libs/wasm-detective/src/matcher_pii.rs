use gjson::Value;
use crate::detective::Request;
use crate::error::CustomError;
use idna::domain_to_ascii_strict;

pub fn any(_request: &Request, field: Value) -> Result<bool, CustomError> {
    let matchers = vec![
        credit_card,
        ssn,
        email,
    ];

    for matcher in matchers {
        // TODO: is there a better way to avoid a borrow? We can't clone gjson::Value
        let v = gjson::parse(field.json());

        match matcher(_request, v) {
            Ok(true) => return Ok(true),
            _ => continue,
        }
    }

    Ok(false)
}

pub fn credit_card(_request: &Request, field: Value) -> Result<bool, CustomError> {
    let num = field.str().trim().replace(['-', ' '], "");

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

pub fn ssn(_request: &Request, field: Value) -> Result<bool, CustomError> {
    // This method does not guarantee that the SSN is valid,
    // only that it matches the format of one.
    let ssn = field.str().trim();

    if ssn.len() != 11 {
        return Ok(false);
    }

    // Check that the first three characters are digits
    if !ssn[0..3].chars().all(|c| c.is_ascii_digit()) {
        return Ok(false);
    }

    // Check that the fourth character is a dash
    if ssn.chars().nth(3).unwrap() != '-' {
        return Ok(false);
    }

    // Check that the fifth and sixth characters are digits
    if !ssn[4..6].chars().all(|c| c.is_ascii_digit()) {
        return Ok(false);
    }

    // Check that the seventh character is a dash
    if ssn.chars().nth(6).unwrap() != '-' {
        return Ok(false);
    }

    // Check that the eighth, ninth, tenth and eleventh characters are digits
    if !ssn[7..11].chars().all(|c| c.is_ascii_digit()) {
        return Ok(false);
    }

    Ok(true)
}

pub fn email(_request: &Request, email: Value) -> Result<bool, CustomError> {
    // Split the email address into local part and domain part
    let parts: Vec<&str> = email.str().trim().split('@').collect();

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

pub fn drivers_license(_request: &Request, _field: Value) -> Result<bool, CustomError> {
    Err(CustomError::Error("not implemented".to_string()))
}

pub fn passport_id(_request: &Request, _field: Value) -> Result<bool, CustomError> {
    Err(CustomError::Error("not implemented".to_string()))
}

pub fn vin_number(_request: &Request, _field: Value) -> Result<bool, CustomError> {
    Err(CustomError::Error("not implemented".to_string()))
}

pub fn phone(_request: &Request, _field: Value) -> Result<bool, CustomError> {
    Err(CustomError::Error("not implemented".to_string()))
}

// Intended to operate on the entire payload
pub fn serial_number(_request: &Request, _field: Value) -> Result<bool, CustomError> {
    Err(CustomError::Error("not implemented".to_string()))
}

// Intended to operate on the entire payload
pub fn login(_request: &Request, _field: Value) -> Result<bool, CustomError> {
    Err(CustomError::Error("not implemented".to_string()))
}

pub fn taxpayer_id(_request: &Request, _field: Value) -> Result<bool, CustomError> {
    Err(CustomError::Error("not implemented".to_string()))
}

// Intended to operate on the entire payload
pub fn address(_request: &Request, _field: Value) -> Result<bool, CustomError> {
    Err(CustomError::Error("not implemented".to_string()))
}

// Intended to operate on the entire payload
pub fn signature(_request: &Request, _field: Value) -> Result<bool, CustomError> {
    Err(CustomError::Error("not implemented".to_string()))
}

// Intended to operate on the entire payload
pub fn geolocation(_request: &Request, _field: Value) -> Result<bool, CustomError> {
    Err(CustomError::Error("not implemented".to_string()))
}

// Intended to operate on the entire payload
pub fn education(_request: &Request, _field: Value) -> Result<bool, CustomError> {
    Err(CustomError::Error("not implemented".to_string()))
}

// Intended to operate on the entire payload
pub fn financial(_request: &Request, _field: Value) -> Result<bool, CustomError> {
    Err(CustomError::Error("not implemented".to_string()))
}

// Intended to operate on the entire payload
pub fn health(_request: &Request, _field: Value) -> Result<bool, CustomError> {
    Err(CustomError::Error("not implemented".to_string()))
}
