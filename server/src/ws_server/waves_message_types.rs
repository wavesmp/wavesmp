use crate::database::types::WavesPlaylistDB;
use crate::database::types::WavesTrackDB;
use crate::database::types::WavesUserDB;
use fastwebsockets::OpCode;
use serde::Deserialize;
use serde::Serialize;
use serde_json::Value;
use thiserror::Error;

// todo: get rid of renames
#[derive(Serialize, Deserialize, Debug, Clone)]
pub enum WavesMessageType {
    /// For testing. Return the user profile if registered
    Account,
    /// Delete the user profile. User data is kept
    AccountDelete,
    /// Begin a session. Returns the user's data
    #[serde(rename = "ACCOUNT_LOGIN")]
    AccountLogin,
    /// Transfer track (library) data to/from server
    #[serde(rename = "TRACKS_ADD")]
    TracksAdd,
    /// Update certain track fields
    #[serde(rename = "TRACKS_INFO_UPDATE")]
    TracksInfoUpdate,
    #[serde(rename = "TRACKS_DELETE")]
    TracksDelete,
    /// Used to send playlists to the client
    #[serde(rename = "PLAYLISTS_UPDATE")]
    PlaylistsUpdate,
    /// Create or update a playlist with the specified tracks
    #[serde(rename = "PLAYLIST_ADD")]
    PlaylistAdd,
    /// Copy an existing playlist to a new one
    #[serde(rename = "PLAYLIST_COPY")]
    PlaylistCopy,
    /// Update the name of an existing playlist
    #[serde(rename = "PLAYLIST_MOVE")]
    PlaylistMove,
    /// Remove tracks from a playlist
    #[serde(rename = "TRACKS_REMOVE")]
    TracksRemove,
    /// Reorder tracks in a playlist
    #[serde(rename = "PLAYLIST_REORDER")]
    PlaylistReorder,
    /// Delete a playlist
    #[serde(rename = "PLAYLIST_DELETE")]
    PlaylistDelete,
    /// Used to send the server version
    #[serde(rename = "VERSION")]
    Version,
    Error,
}

#[derive(Serialize, Deserialize)]
pub struct WavesMessage {
    #[serde(rename = "type")]
    pub message_type: WavesMessageType,
    pub data: Value,
    #[serde(rename = "reqId")]
    pub req_id: Option<u32>,
}

#[derive(Serialize, Deserialize)]
pub struct WavesMessageTracksInfoUpdate {
    #[serde(rename = "id")]
    pub uid: String,
    pub key: String,
    pub value: String,
}

#[derive(Serialize, Deserialize)]
pub struct WavesMessagePlaylistCopy {
    pub src: String,
    pub dest: String,
}

#[derive(Serialize, Deserialize)]
pub struct WavesMessageTracksRemove {
    #[serde(rename = "playlistName")]
    pub playlist_name: String,
    pub selection: Vec<(usize, String)>,
}

#[derive(Serialize, Deserialize)]
pub struct WavesMessagePlaylistReorder {
    #[serde(rename = "playlistName")]
    pub playlist_name: String,
    pub selection: Vec<(usize, String)>,
    #[serde(rename = "insertAt")]
    pub insert_at: usize,
}

#[derive(Serialize, Deserialize)]
pub struct WavesMessageAccount {
    pub token: String,
    pub idp: WavesMessageAccountIDP,
}

#[derive(Serialize, Deserialize, Debug)]
pub enum WavesMessageAccountIDP {
    #[serde(rename = "google")]
    Google,
    Testing,
}

#[derive(Serialize, Deserialize)]
pub struct WavesMessageError {
    pub err: String,
}

/// The externally visible track. Excludes database fields
/// such as `idp`, `idp_id`
#[derive(Serialize, Deserialize, Debug)]
pub struct WavesTrackExternal {
    #[serde(rename = "id")]
    pub uid: String,
    pub source: String,
    pub title: Option<String>,
    pub artist: Option<String>,
    pub genre: Option<String>,
    pub duration: f64,
}

impl From<WavesTrackDB> for WavesTrackExternal {
    fn from(track: WavesTrackDB) -> Self {
        WavesTrackExternal {
            uid: track.uid,
            source: track.source,
            title: track.title,
            artist: track.artist,
            genre: track.genre,
            duration: track.duration,
        }
    }
}

/// The externally visible playlist. Excludes database fields
/// such as `idp`, `idp_id`
#[derive(Serialize, Deserialize, Debug)]
pub struct WavesPlaylistExternal {
    pub name: String,
    pub tracks: Vec<String>,
}

impl From<WavesPlaylistDB> for WavesPlaylistExternal {
    fn from(playlist: WavesPlaylistDB) -> Self {
        WavesPlaylistExternal {
            name: playlist.name,
            tracks: playlist.tracks.to_vec(),
        }
    }
}

/// The externally visible user. Excludes database fields
/// such as `idp`. The field `idp_id` is needed though since
/// clients can use it to access their S3 data
#[derive(Serialize, Deserialize, Debug)]
pub struct WavesUserExternal {
    #[serde(rename = "idpId")]
    pub idp_id: String,
    pub name: Option<String>,
    pub email: Option<String>,
}

impl From<WavesUserDB> for WavesUserExternal {
    fn from(user: WavesUserDB) -> Self {
        WavesUserExternal {
            idp_id: user.idp_id,
            name: user.name,
            email: user.email,
        }
    }
}

#[derive(Error, Debug)]
pub enum WavesError {
    #[error("invalid message opcode: {0:?}")]
    InvalidMessageOpCode(OpCode),
    #[error("invalid message type: {0:?}")]
    InvalidMessageType(WavesMessageType),
    #[error("user is unauthorized")]
    Unauthorized,
}
