use mongodb::bson::oid::ObjectId;
use mongodb::bson::serde_helpers::serialize_object_id_as_hex_string;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use thiserror::Error;

#[derive(Serialize, Deserialize, Debug)]
pub enum WavesMessageType {
    #[serde(rename = "ACCOUNT_LOGIN")]
    AccountLogin,
    #[serde(rename = "TRACKS_ADD")]
    TracksAdd,
    #[serde(rename = "PLAYLISTS_UPDATE")]
    PlaylistsUpdate,
}

#[derive(Serialize, Deserialize)]
pub struct WavesMessage {
    #[serde(rename = "type")]
    pub message_type: WavesMessageType,
    pub data: Value,
    #[serde(rename = "reqId")]
    pub req_id: u32,
}

#[derive(Serialize, Deserialize)]
pub struct WavesMessageAccountLogin {
    pub token: String,
    pub idp: WavesMessageAccountLoginIDP,
}

#[derive(Serialize, Deserialize)]
pub enum WavesMessageAccountLoginIDP {
    #[serde(rename = "google")]
    Google,
}

#[derive(Serialize, Deserialize)]
pub struct WavesUserResponse {
    #[serde(rename = "type")]
    pub message_type: WavesMessageType,
    pub data: WavesUser,
    #[serde(rename = "reqId")]
    pub req_id: u32,
}

#[derive(Serialize, Deserialize)]
pub struct WavesTracksAddResponse {
    #[serde(rename = "type")]
    pub message_type: WavesMessageType,
    pub data: Vec<WavesTrack>,
}

#[derive(Serialize, Deserialize)]
pub struct WavesPlaylistsUpdateResponse {
    #[serde(rename = "type")]
    pub message_type: WavesMessageType,
    pub data: Vec<WavesPlaylist>,
}

#[derive(Serialize, Deserialize)]
pub struct WavesUser {
    pub idp: String,
    #[serde(rename = "idpId")]
    pub idp_id: String,
    pub name: Option<String>,
    pub email: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct WavesTrack {
    #[serde(
        rename(deserialize = "_id"),
        serialize_with = "serialize_object_id_as_hex_string"
    )]
    pub id: ObjectId,
    pub source: String,
    pub title: Option<String>,
    pub artist: Option<String>,
    pub genre: Option<String>,
    pub duration: f64,
    pub idp: String,
    #[serde(rename = "idpId")]
    pub idp_id: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct WavesPlaylist {
    pub name: String,
    pub tracks: Vec<String>,
}

#[derive(Error, Debug)]
pub enum WavesError {
    #[error("invalid message type: {0:?}")]
    InvalidMessageType(WavesMessageType),
    #[error("unexpected auth message type: {0:?}")]
    InvalidAuthMessageType(WavesMessageType),
}
