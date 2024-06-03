use crate::detective::Request;
use crate::error::CustomError;
use streamdal_gjson::Value;
use iban::Iban;

pub fn credit_card(_request: &Request, field: Value) -> Result<bool, CustomError> {
    let num = field.str().trim().replace(['-', ' '], "");

    // Check if all characters are digits
    if !num.chars().all(|c| c.is_ascii_digit()) {
        return Ok(false);
    }

    // Convert the card number string to a vector of digits
    let digits: Vec<u32> = num.chars().filter_map(|c| c.to_digit(10)).collect();

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

pub fn iban(_request: &Request, field: Value) -> Result<bool, CustomError> {
    let val = field.str().trim().to_uppercase();

    match val.parse::<Iban>() {
        Ok(_) => Ok(true),
        Err(_) => Ok(false),
    }
}


pub fn swift_bic(_request: &Request, field: Value) -> Result<bool, CustomError> {
    let val = field.str().trim().to_uppercase().replace('-', "");
   //
    // Max length is 11
    // Can be just 8 characters if no branch code is specified
    if val.len() < 8 || val.len() > 11 {
        return Ok(false);
    }

    for (i, c) in val.chars().enumerate() {
        // First 4 characters are bank code
        if i <= 3 && !c.is_ascii_alphabetic() {
            return Ok(false);
        }

        // Characters 5 and 6 must be letters representing ISO country code
        if i == 4 || i == 5 {
            // Characters 5 and 6 must be letters
            if !c.is_ascii_alphabetic() {
                return Ok(false);
            }

            // TODO: ISO Country code validation
        }

        // Characters 7 and 8 are location code
        if (i == 6 || i == 7) && !c.is_ascii_alphanumeric() {
            return Ok(false);
        }

        // Reamining 2 characters are optional branch code
        if val.len() == 11 && i >= 8 && !c.is_ascii_alphanumeric() {
            return Ok(false);
        }
    }

    Ok(true)
}

pub fn usa_bank_routing_number(_request: &Request, field: Value) -> Result<bool, CustomError> {
    let cleaned_string: String = field.str().chars().filter(|c| c.is_ascii_digit()).collect();
    Ok(cleaned_string.len() == 9)
}

pub fn crypto_currency_address(_request: &Request, _field: Value) -> Result<bool, CustomError> {
    // TODO: can't find a reliable lib for handling these
    Err(CustomError::Error("Not implemented".to_string()))
}
pub fn stripe_key(_request: &Request, field: Value) -> Result<bool, CustomError> {
    let val: String = field.str().to_lowercase();

    let valid = val.starts_with("sk_live_");

    Ok(valid)
}
