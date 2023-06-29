pub mod detective;
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
