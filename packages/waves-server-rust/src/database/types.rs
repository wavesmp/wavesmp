use sqlx::types::Json;
use thiserror::Error;

pub struct WavesUserDB {
    pub idp: String,
    pub idp_id: String,
    pub name: Option<String>,
    pub email: Option<String>,
}

pub struct WavesPlaylistDB {
    pub idp: String,
    pub idp_id: String,
    pub name: String,
    pub tracks: Json<Vec<String>>,
}

pub struct WavesTrackDB {
    pub uid: String,
    pub idp: String,
    pub idp_id: String,
    pub source: String,
    pub title: Option<String>,
    pub artist: Option<String>,
    pub genre: Option<String>,
    pub duration: f64,
}

#[derive(Error, Debug)]
pub enum WavesDatabaseError {
    #[error("can only send {0:?} items at a time")]
    TooManyItems(usize),
    #[error("no items were sent")]
    NoItems(),
    #[error("invalid track update key: {0:?}")]
    InvalidTrackUpdateKey(String),
    #[error("invalid playlist selection index: {0:?}")]
    PlaylistSelectionOutOfBounds(usize),
    #[error("duplicate playlist selection index: {0:?}")]
    PlaylistSelectionDuplicate(usize),
    #[error("playlist selection invalid at {0:?}: {1:?}")]
    PlaylistSelectionMismatch(usize, String),
    #[error("invalid playlist insert_at index: {0:?}")]
    PlaylistReorderOutOfBounds(usize),
    #[error("playlist was not changed: {0:?}")]
    PlaylistUnchanged(String),
    #[error("playlist was not found: {0:?}")]
    PlaylistNotFound(String),
    #[error("track was not changed: {0:?}")]
    TrackUnchanged(String),
    #[error("track was not changed: {0:?}")]
    TracksNotFound(Vec<String>),
    #[error("user not found in database: {0:?}")]
    UserNotFound(String),
}
