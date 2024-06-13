use crate::matcher_pii_phone::*;

#[cfg(test)]


#[test]
pub fn test_phone_zone_one() {
    let numbers = vec!["+13211234567", "3211234567", "13211234567"];

    for number in numbers {
        assert_eq!(phone_zone_one(number.to_string()).unwrap(), true);
    }
}

#[test]
pub fn test_phone_zone_two() {
    let numbers = vec!["+23512123434"];

    for number in numbers {
        assert_eq!(phone_zone_two(number.to_string()).unwrap(), true);
    }

}

#[test]
pub fn test_phone_zone_three_and_four() {
    let numbers = vec!["+442071234567"];

    for number in numbers {
        assert_eq!(phone_zone_three_and_four(number.to_string()).unwrap(), true);
    }
}

#[test]
pub fn test_phone_zone_five() {
    let numbers = vec!["+5931112345678"];

    for number in numbers {
        assert_eq!(phone_zone_five(number.to_string()).unwrap(), true);
    }
}

#[test]
pub fn test_phone_zone_six() {
    let numbers = vec!["+61212345678"];

    for number in numbers {
        assert_eq!(phone_zone_six(number.to_string()).unwrap(), true);
    }
}

#[test]
pub fn test_phone_zone_seven() {
    let numbers = vec!["+71234567890"];

    for number in numbers {
        assert_eq!(phone_zone_seven(number.to_string()).unwrap(), true);
    }
}

#[test]
pub fn test_phone_zone_eight() {
    let numbers = vec!["+85612345678"];

    for number in numbers {
        assert_eq!(phone_zone_eight(number.to_string()).unwrap(), true);
    }
}

#[test]
pub fn test_phone_zone_nine() {
    let numbers = vec!["+993123456789"];

    for number in numbers {
        assert_eq!(phone_zone_nine(number.to_string()).unwrap(), true);
    }
}