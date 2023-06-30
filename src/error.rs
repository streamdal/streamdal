use thiserror::Error;

#[derive(Debug, Error)]
pub enum CustomError {
    #[error("error: {0}")]
    Error(String),

    #[error("match error: {0}")]
    MatchError(String),

    #[error("regex error: {source}")]
    RegexError {
        #[from]
        source: regex::Error,
    },

    #[error("ajson error: {0}")]
    AJSONError(String),
}

impl From<ajson::Error> for CustomError {
    fn from(err: ajson::Error) -> Self {
        Self::AJSONError(format!("ajson error: {:?}", err))
    }
}
