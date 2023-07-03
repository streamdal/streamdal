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

    // #[error("ajson error: {0}")]
    // AJSONError(String),

    #[error("missing match type: {0}")]
    MissingMatchType(i32),
}

// impl From<ajson::Error> for CustomError {
//     // Q: how else can I extract the error from ajson::Error?
//     fn from(err: ajson::Error) -> Self {
//         Self::AJSONError(format!("{:?}", err))
//     }
// }
