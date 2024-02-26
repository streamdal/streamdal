use crate::detective::Request;
use crate::error::CustomError;
use crate::matcher_pii_payments as pii_payments;
use streamdal_gjson::Value;
use streamdal_gjson as gjson;
use idna::domain_to_ascii_strict;
use validators::prelude::*;
use validators_prelude::phonenumber::PhoneNumber;

pub fn any(_request: &Request, field: Value) -> Result<bool, CustomError> {
    let matchers = vec![pii_payments::credit_card, ssn, email];

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

#[derive(Validator)]
#[validator(phone)]
pub struct InternationalPhone(pub PhoneNumber);

pub fn phone(_request: &Request, field: Value) -> Result<bool, CustomError> {
    let val = field.str().trim().replace(['-', ' ', '.'], "");
    let res = InternationalPhone::parse_string(val).is_ok();
    Ok(res)
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

    if let Ok(res) = postal_code(_request, _field.clone()) {
        return Ok(res);
    }

    Ok(false)
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

pub fn religion(_request: &Request, field: Value) -> Result<bool, CustomError> {
    let religions: Vec<&str> = vec![
        "Buddhism",
        "Buddhist",
        "Christianity",
        "Christian",
        "Islam",
        "Muslim",
        "Sunni",
        "Shia",
        "Shiite",
        "Ismailism",
        "Hinduism",
        "Hindu",
        "Sikhism",
        "Judaism",
        "Bahá'í",
        "Bahai",
        "Shinto",
        "Taoism",
        "Taoist",
        "Confucianism",
        "Catholicism",
        "Catholic",
        "Protestantism",
        "Protestant",
        "Orthodox",
        "Anglicanism",
        "Anglican",
        "Lutheranism",
        "Lutheran",
        "Calvinism",
        "Calvinist",
        "Methodism",
        "Methodist",
        "Presbyterianism",
        "Presbyterian",
    ];

    let field = field.str().trim().to_lowercase();
    for religion in religions {
        if field.contains(religion.to_lowercase().as_str()) {
            return Ok(true);
        }
    }

    Ok(false)
}

pub fn title(_request: &Request, _field: Value) -> Result<bool, CustomError> {
    let titles = vec![
        "Mr.", "Mister", "Misses", "Mrs.", "Ms.", "Miss", "Dr.", "Prof.", "Rev.", "Fr.", "Sr.",
        "Br.",
    ];

    let field = _field.str().trim().to_lowercase();
    for title in titles {
        if field.starts_with(title.to_lowercase().as_str()) {
            return Ok(true);
        }
    }

    Ok(false)
}

pub fn postal_code(_request: &Request, field: Value) -> Result<bool, CustomError> {
    let postal_code: String = field
        .str()
        .chars()
        .filter(|&c| !c.is_whitespace())
        .collect();


    // US
    if let Ok(res) = postal_code_us(_request, postal_code.clone()) {
        if res {
            return Ok(res);
        }
    }

    // Canada
    if let Ok(res) = postal_code_ca(_request, postal_code.clone()) {
        if res {
            return Ok(res);
        }
    }

    Ok(false)
}


pub fn postal_code_us(_request: &Request, postal_code: String) -> Result<bool, CustomError> {
    if postal_code.len() == 5 || postal_code.len() == 9 {
        // Check if all characters are digits
        if postal_code.chars().all(char::is_numeric) {
            return Ok(true);
        }
    }

    Ok(false)
}

pub fn postal_code_ca(_request: &Request, postal_code: String) -> Result<bool, CustomError> {
    let is_valid = postal_code.len() == 6
        && postal_code.chars().next().unwrap().is_ascii_alphabetic()
        && postal_code.chars().nth(1).unwrap().is_ascii_digit()
        && postal_code.chars().nth(2).unwrap().is_ascii_alphabetic()
        && postal_code.chars().nth(3).unwrap().is_ascii_digit()
        && postal_code.chars().nth(4).unwrap().is_ascii_alphabetic()
        && postal_code.chars().nth(5).unwrap().is_ascii_digit();

    Ok(is_valid)
}

const RSA_KEY_PREFIXES: [&str; 3] = [
    "-----BEGIN PRIVATE",
    "-----BEGIN RSA PRIVATE",
    "-----BEGIN ENCRYPTED",
];

pub fn rsa_key(_request: &Request, field: Value) -> Result<bool, CustomError> {
    let val = field.str().trim();
    for s in RSA_KEY_PREFIXES.iter() {
        if val.replace("----- BEGIN", "-----BEGIN").starts_with(s) {
            return Ok(true);
        }
    }

    Ok(false)
}
