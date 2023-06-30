use thiserror::Error;

#[derive(Debug, Error)]
pub enum CustomError {
    #[error("error: {0}")]
    Error(String),

    #[error("match error: {0}")]
    MatchError(String),
}
