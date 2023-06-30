use thiserror::Error;

#[derive(Debug, Error)]
pub enum Error {
    #[error("Error: {0}")]
    GenericError(String),

    #[error("Match error: {0}")]
    MatchError(String),
}
