use std::fmt::Error;
use protos::matcher::MatchType;

pub struct Detective {
}

pub fn usage() {
    println!("Usage: snitch_detective");
}

impl Detective {
    pub fn new() -> Self {
        Detective {
        }
    }

    // Value can be int, float, string, bool
    pub fn matches(&self, match_type: MatchType, _: &str, _: Vec<String>, _: bool) -> Result<bool, Error> {
        println!("got request for match type: {:?}", match_type);

        Ok(false)
    }
}
