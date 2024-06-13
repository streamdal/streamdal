use streamdal_gjson::Value;

use crate::detective::Request;
use crate::error::CustomError;

// Canada, America, Caribbean
pub fn phone_zone_one(num: String) -> Result<bool, CustomError> {
    let len = num.len();
    // Check if first 2 chars are +1
    if num.starts_with("+1") {
        return Ok(len == 12)
    }

    // Check if 11 digit number starting with "1"
    if num.starts_with("1") {
        return Ok(len == 11)
    }

    // Check if the phone number is 10 digit
    Ok(len == 10)
}

// Africa
pub fn phone_zone_two(num: String) -> Result<bool, CustomError> {
    let prefixes = vec![
        "+20", "+211", "+212", "+213", "+216", "+218", "+220", "+221", "+222", "+223", "+224",
        "+225", "+226", "+227", "+228", "+229", "+230", "+231", "+232", "+233", "+234", "+235",
        "+236", "+237", "+238", "+239", "+240", "+241", "+242", "+243", "+244", "+245", "+246",
        "+247", "+248", "+249", "+250", "+251", "+252", "+253", "+254", "+255", "+256", "+257",
        "+258", "+260", "+261", "+262", "+263", "+264", "+265", "+266", "+267", "+268", "+269",
        "+27", "+290", "+291", "+297", "+298", "+299"
    ];

    println!("num: {}", num);

    if prefixes.iter().any(|prefix| num.starts_with(prefix)) {
        return Ok(true)
    }

    Ok(false)
}

// Europe
pub fn phone_zone_three_and_four(num: String) -> Result<bool, CustomError> {
    let prefixes = vec![
        "+30", "+31", "+32", "+33", "+34", "+350", "+351", "+352", "+353", "+354", "+355",
        "+356", "+357", "+358", "+359", "+36", "+370", "+371", "+372", "+373", "+374", "+375",
        "+376", "+377", "+378", "+379", "+380", "+381", "+382", "+383", "+385", "+386", "+387",
        "+389", "+39", "+40", "+41", "+420", "+421", "+423", "+43", "+44", "+45", "+46", "+47",
        "+48", "+49"
    ];

    if prefixes.iter().any(|prefix| num.starts_with(prefix)) {
        return Ok(true)
    }

    Ok(false)
}

// South and Central Americas
pub fn phone_zone_five(num: String) -> Result<bool, CustomError> {
    let prefixes = vec![
        "+501", "+502", "+503", "+504", "+505", "+506", "+507", "+508", "+509", "+51", "+52",
        "+53", "+54", "+55", "+56", "+57", "+58", "+590", "+591", "+592", "+593", "+594", "+595",
        "+596", "+597", "+598", "+599"
    ];

    if prefixes.iter().any(|prefix| num.starts_with(prefix)) {
        return Ok(true)
    }

    Ok(false)
}

// Southeast Asia and Oceania
pub fn phone_zone_six(num: String) -> Result<bool, CustomError> {
    let prefixes = vec![
        "+60", "+61", "+62", "+63", "+64", "+65", "+66", "+670", "+672", "+673", "+674", "+675",
        "+676", "+677", "+678", "+679", "+680", "+681", "+682", "+683", "+685", "+686", "+687",
        "+688", "+689", "+690", "+691", "+692"
    ];

    if prefixes.iter().any(|prefix| num.starts_with(prefix)) {
        return Ok(true)
    }

    Ok(false)
}

// Russia, Kazakhstan, Abkhazia, South Ossetia
pub fn phone_zone_seven(num: String) -> Result<bool, CustomError> {
    let prefixes = vec!["+7"];

    if prefixes.iter().any(|prefix| num.starts_with(prefix)) {
        return Ok(true)
    }

    Ok(false)
}

// East/South Asia
pub fn phone_zone_eight(num: String) -> Result<bool, CustomError> {
    let prefixes = vec![
        "+81", "+82", "+84", "+850", "+852", "+853", "+855", "+856", "+86", "+880", "+886"
    ];

    if prefixes.iter().any(|prefix| num.starts_with(prefix)) {
        return Ok(true)
    }

    Ok(false)
}

// West/Central/South Asia
pub fn phone_zone_nine(num: String) -> Result<bool, CustomError> {
    let prefixes = vec![
        "+90", "+91", "+92", "+93", "+94", "+95", "+960", "+961", "+962", "+963", "+964", "+965",
        "+966", "+967", "+968", "+970", "+971", "+972", "+973", "+974", "+975", "+976", "+977",
        "+98", "+992", "+993", "+994", "+995", "+996", "+998"
    ];

    if prefixes.iter().any(|prefix| num.starts_with(prefix)) {
        return Ok(true)
    }

    Ok(false)
}

pub fn phone(_request: &Request, field: Value) -> Result<bool, CustomError> {

    // Remove all non numbers and + symbol from field
    let num = field.str().trim().chars().filter(|c| c.is_ascii_digit() || *c == '+').collect::<String>();

    if num == "" {
        return Ok(false);
    }

    if phone_zone_one(num.clone()).unwrap() {
        return Ok(true)
    }

    if phone_zone_two(num.clone()).unwrap() {
        return Ok(true)
    }

    if phone_zone_three_and_four(num.clone()).unwrap() {
        return Ok(true)
    }

    if phone_zone_five(num.clone()).unwrap() {
        return Ok(true)
    }

    if phone_zone_six(num.clone()).unwrap() {
        return Ok(true)
    }

    if phone_zone_seven(num.clone()).unwrap() {
        return Ok(true)
    }

    if phone_zone_eight(num.clone()).unwrap() {
        return Ok(true)
    }

    if phone_zone_nine(num.clone()).unwrap() {
        return Ok(true)
    }

    Ok(false)

    // let phone_number_regex = Some(Regex::new(crate::detective::PHONE_NUMBER_REGEX_STR).unwrap());
    //
    // let re: Regex = unsafe {
    //     // If phone() is being called within a wasm module, PHONE_NUMBER_REGEX
    //     // will be correctly initialized via init() by wizer. If phone() is
    //     // called from non-wasm (eg. tests), PHONE_NUMBER_REGEX will be None so
    //     // we have to call on init() ourselves.
    //     if PHONE_NUMBER_REGEX.is_none() {
    //         crate::detective::init();
    //     }
    //
    //     PHONE_NUMBER_REGEX.clone().unwrap()
    // };
    //
    // let res = re.is_match(field.str());
    //
    // Ok(res)
}