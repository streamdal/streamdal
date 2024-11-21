use base32::Alphabet::Rfc4648;
use base58;
use base58::FromBase58;
use bech32;
use iban::Iban;
use streamdal_gjson::Value;

use crate::detective::Request;
use crate::error::CustomError;

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

pub fn crypto_currency_address(_request: &Request, field: Value) -> Result<bool, CustomError> {
    // This function is only intended to capture the main blockchains
    // We should eventually abstract
    let address = field.str().trim();

    // Ethereum
    if address.starts_with("0x") {
        return crypto_eth(address);
    }

    // Bitcoin
    if address.starts_with("bc1") {
        return _crypto_btc_bech32(address);
    }
    if address.starts_with('1') || address.starts_with('3') {
        return crypto_btc(address);
    }

    // Solana
    if _crypto_solana(address).is_ok() {
        return Ok(true);
    }

    // Ripple
    if crypto_xrp(address).is_ok() {
        return Ok(true);
    }

    // Stellar
    if _crypto_stellar(address).is_ok() {
        return Ok(true);
    }

    // Monero
    if _crypto_monero(address).is_ok() {
        return Ok(true);
    }

    Ok(false)
}

fn crypto_eth(address: &str) -> Result<bool, CustomError> {
    // Check if the address starts with "0x" and has exactly 42 characters
    if address.len() != 42 {
        return Ok(false);
    }

    // Check if the characters after "0x" are valid hexadecimal characters
    for c in address.chars().skip(2) {
        if !c.is_ascii_hexdigit() {
            return Ok(false);
        }
    }

    Ok(true)
}

fn crypto_xrp(address: &str) -> Result<bool, CustomError> {
    if address.len() < 25 || address.len() > 35 {
        return Ok(false);
    }

    if !address.starts_with('r') {
        return Ok(false);
    }

    let res = address.from_base58().is_ok();
    Ok(res)
}

/// Validates a Base58Check encoded Bitcoin address (P2PKH or P2SH).
fn crypto_btc(address: &str) -> Result<bool, CustomError> {
    match address.from_base58() {
        Ok(decoded) => {
            if decoded.len() != 25 {
                return Ok(false);
            }
            let (payload, checksum) = decoded.split_at(21);
            let calculated_checksum = &_double_sha256(payload)[..4];
            Ok(checksum == calculated_checksum)
        }
        Err(_) => Ok(false),
    }
}

fn _crypto_btc_bech32(address: &str) -> Result<bool, CustomError> {
    match bech32::decode(address) {
        Ok((hrp, data)) => {
            // Check that the human-readable part is "bc" for mainnet
            let res = hrp.as_str() == "bc" && !data.is_empty();
            Ok(res)
        }
        Err(_) => Ok(false),
    }
}

/// Calculates the double SHA-256 hash of the input.
fn _double_sha256(input: &[u8]) -> Vec<u8> {
    use sha2::{Digest, Sha256};

    let first_hash = Sha256::digest(input);
    let second_hash = Sha256::digest(first_hash);
    second_hash.to_vec()
}

fn _crypto_solana(address: &str) -> Result<bool, CustomError> {
    match bs58::decode(address).into_vec() {
        Ok(decoded) => {
            // Check if the decoded length is 32 bytes
            let res = decoded.len() == 32;
            Ok(res)
        },
        Err(_) => Ok(false), // Decoding failed, not a valid Solana address
    }
}

fn _crypto_stellar(address: &str) -> Result<bool, CustomError> {
    if address.len() != 56 {
        return Ok(false);
    }

    // Check if the address starts with 'G'
    if !address.starts_with('G') {
        return Ok(false);
    }

    // Decode the address using Base32 RFC4648
    match base32::decode(Rfc4648 { padding: false }, address) {
        Some(_) => Ok(true),
        None => Ok(false),
    }
}

fn _crypto_monero(address: &str) -> Result<bool, CustomError> {
    // Monero addresses are 95 characters long
    if address.len() != 95 {
        return Ok(false);
    }

    // Check if the address starts with '4'
    if !address.starts_with('4') {
        return Ok(false);
    }

    // Decode the address using Base58
    match address.from_base58() {
        Ok(_) => Ok(true),
        Err(_) => Ok(false),
    }
}

pub fn stripe_key(_request: &Request, field: Value) -> Result<bool, CustomError> {
    let val: String = field.str().to_lowercase();

    let valid = val.starts_with("sk_live_");

    Ok(valid)
}
