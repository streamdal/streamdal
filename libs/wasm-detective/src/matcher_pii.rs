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
    // The format of these IDs is not standardized and follows no reliable patter, so we can't really validate them.
    // See: https://www.microfocus.com/documentation/idol/IDOL_23_4/EductionGrammars_23.4_Documentation/PII/Content/PII/PII_Examples_Passport.htm
    Err(CustomError::Error("not implemented".to_string()))
}

pub fn vin_number(_request: &Request, _field: Value) -> Result<bool, CustomError> {
    let vin = _field.str().trim().to_lowercase();

    // Check if VIN has 17 characters
    if vin.len() != 17 {
        return Ok(false);
    }

    let weights: [u32; 17] = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];

    let transliterations: std::collections::HashMap<char, u32> = [
        ('a', 1), ('b', 2), ('c', 3), ('d', 4), ('e', 5), ('f', 6), ('g', 7), ('h', 8),
        ('j', 1), ('k', 2), ('l', 3), ('m', 4), ('n', 5), ('p', 7), ('r', 9), ('s', 2),
        ('t', 3), ('u', 4), ('v', 5), ('w', 6), ('x', 7), ('y', 8), ('z', 9)
    ].iter().cloned().collect();

    let mut sum = 0;

    for (i, c) in vin.chars().enumerate() {
        if c.is_numeric() {
            if let Some(got_digit) = c.to_digit(10) {
                sum += got_digit * weights[i];
            } else {
                return Ok(false);
            }
        } else if let Some(got_translit) = transliterations.get(&c) {
            sum += got_translit * weights[i];
        } else {
            return Ok(false);
        }
    }

    let checkdigit = sum % 11;

    let checkdigit = if checkdigit == 10 {
        'x'
    } else {
        let found_char = char::from_u32(checkdigit + '0' as u32);
        if found_char.is_none() {
            return Ok(false);
        }
        found_char.unwrap()
    };

    let eighth_char = vin.chars().nth(8);
    if eighth_char.is_none() {
        return Ok(false);
    }

    let res = checkdigit == eighth_char.unwrap();

    Ok(res)
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

// Intentionally verbose and dumb implementation to avoid hit
// from base64 decode and JSON parse.
const JWT_HEADERS: [&str; 12] = [
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9", // HS256
    "eyJhbGciOiJIUzM4NCIsInR5cCI6IkpXVCJ9", // HS384
    "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9", // HS512
    "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9", // RS256
    "eyJhbGciOiJSUzM4NCIsInR5cCI6IkpXVCJ9", // RS384
    "eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9", // RS512
    "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9", // ES256
    "eyJhbGciOiJFUzM4NCIsInR5cCI6IkpXVCJ9", // ES384
    "eyJhbGciOiJFUzUxMiIsInR5cCI6IkpXVCJ9", // ES512
    "eyJhbGciOiJQUzI1NiIsInR5cCI6IkpXVCJ9", // PS256
    "eyJhbGciOiJQUzM4NCIsInR5cCI6IkpXVCJ9", // PS384
    "eyJhbGciOiJQUzUxMiIsInR5cCI6IkpXVCJ9", // PS512
];

pub fn jwt(_request: &Request, field: Value) -> Result<bool, CustomError> {
    let val: String = field.str().trim().to_string();

    // Check if the token has three parts.
    let parts: Vec<&str> = val.split('.').collect();
    if parts.len() != 3 {
        return Ok(false);
    }

    // Check if the token has a valid header.
    if JWT_HEADERS.contains(&parts[0]) {
        return Ok(true);
    }

    Ok(false)
}

pub fn bearer_token(_request: &Request, field: Value) -> Result<bool, CustomError> {
    let field = field.str().trim();

    let valid = field.starts_with("Bearer ") || field.starts_with("Authorization: Bearer");
    Ok(valid)
}

const INVALID_NINO_PREFIXES: [&str; 7] = ["BG", "GB", "NK", "KN", "TN", "NT", "ZZ"];

pub fn uk_nino(_request: &Request, field: Value) -> Result<bool, CustomError> {
    let val = field.str().trim();

    // Strip all spaces
    let val = val.replace(' ', "");

    // Check if the length is between 8 and 9 characters
    if val.len() < 8 || val.len() > 9 {
        return Ok(false);
    }

    // Check if the first two characters are letters
    if !val.chars().take(2).all(|c| c.is_ascii_alphabetic()) {
        return Ok(false);
    }

    // Check if the first two characters are not in the invalid prefixes
    if INVALID_NINO_PREFIXES.contains(&val.chars().take(2).collect::<String>().as_str()) {
        return Ok(false);
    }

    // Check if the next six characters are digits
    if !val.chars().skip(2).take(6).all(|c| c.is_ascii_digit()) {
        return Ok(false);
    }

    // Check if the last character is a letter
    if !val.chars().last().unwrap_or('0').is_ascii_alphabetic() {
        return Ok(false);
    }

    Ok(true)
}

pub fn canada_sin(_request: &Request, field: Value) -> Result<bool, CustomError> {
    let val = field.str().trim();

    // Strip all dashes and spaces
    let val = val.replace(['-', ' '], "");

    // Check if the length is 9 characters
    if val.len() != 9 {
        return Ok(false);
    }

    // Check if all characters are digits
    if !val.chars().all(char::is_numeric) {
        return Ok(false);
    }

    // Validate with Luhn algorithm
    let mut sum = 0;
    for (mut i, c) in val.chars().enumerate() {
        i += 1;
        let digit = c.to_digit(10);
        if digit.is_none() {
            return Ok(false);
        }

        let mut digit = digit.unwrap();

        if i % 2 == 0 {
            digit *= 2;
            if digit > 9 {
                digit -= 9;
            }
        }

        sum += digit;
    }

    Ok(sum % 10 == 0)
}
