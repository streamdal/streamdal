pub mod detective;
pub mod matcher_core;
pub mod matcher_numeric;
pub mod matcher_pii;

#[cfg(test)]
#[path = "matcher_numeric_tests.rs"]
mod matcher_numeric_tests;
