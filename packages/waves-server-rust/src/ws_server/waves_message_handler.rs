use crate::ws_server::waves_message_types::WavesError;
use crate::ws_server::waves_message_types::WavesMessage;
use crate::ws_server::waves_message_types::WavesMessageAccountLogin;
use crate::ws_server::waves_message_types::WavesMessageType;
use crate::ws_server::waves_message_types::WavesPlaylist;
use crate::ws_server::waves_message_types::WavesPlaylistsUpdateResponse;
use crate::ws_server::waves_message_types::WavesTrack;
use crate::ws_server::waves_message_types::WavesTracksAddResponse;
use crate::ws_server::waves_message_types::WavesUser;
use crate::ws_server::waves_message_types::WavesUserResponse;
use anyhow::Result;
use fastwebsockets::{FragmentCollector, Frame, OpCode, Payload};
use futures::TryStreamExt;
use google_oauth::AsyncClient;
use hyper::upgrade::Upgraded;
use hyper_util::rt::TokioIo;
use log::{error, info};
use mongodb::bson::doc;
use mongodb::Database;
use serde_json::de::from_slice;
use serde_json::{from_value, to_vec};
use std::sync::Arc;

pub async fn handle_waves_messages(
    ws: &mut FragmentCollector<TokioIo<Upgraded>>,
    auth_client: Arc<AsyncClient>,
    db: Database,
) -> Result<()> {
    let user = match handle_auth(ws, &auth_client, db).await? {
        None => return Ok(()),
        Some(u) => u,
    };

    info!("got login for user={}", user.idp_id);

    while let Some(message) = get_waves_message(ws).await? {
        handle_waves_message(ws, &auth_client, message).await?;
    }
    Ok(())
}

async fn handle_auth(
    ws: &mut FragmentCollector<TokioIo<Upgraded>>,
    auth_client: &Arc<AsyncClient>,
    db: Database,
) -> Result<Option<WavesUser>> {
    let message = match get_waves_message(ws).await? {
        None => return Ok(None),
        Some(m) => m,
    };
    match message.message_type {
        // todo get rid of clones here??
        WavesMessageType::AccountLogin => {
            // authenticate
            let account_login_message: WavesMessageAccountLogin = from_value(message.data)?;
            let google_payload = auth_client
                .validate_id_token(account_login_message.token)
                .await?;
            let user = WavesUser {
                idp: "google".to_string(),
                idp_id: google_payload.sub.clone(),
                name: google_payload.name.clone(),
                email: google_payload.email.clone(),
            };
            let user_response = WavesUserResponse {
                message_type: message.message_type,
                req_id: message.req_id,
                data: user,
            };
            let user_response_payload = to_vec(&user_response)?;
            let user_frame_response = Frame::new(
                true,
                OpCode::Text,
                None,
                Payload::from(user_response_payload),
            );
            ws.write_frame(user_frame_response).await?;

            // send track add (library)
            let track_collection = db.collection::<WavesTrack>("track");
            let track_cursor = track_collection
                .find(
                    doc! { "idp": "google", "idpId": google_payload.sub.clone() },
                    None,
                )
                .await?;
            let tracks: Vec<WavesTrack> = track_cursor.try_collect().await?;
            let tracks_add_response = WavesTracksAddResponse {
                message_type: WavesMessageType::TracksAdd,
                data: tracks,
            };
            let tracks_add_response_payload = to_vec(&tracks_add_response)?;
            let tracks_add_frame_response = Frame::new(
                true,
                OpCode::Text,
                None,
                Payload::from(tracks_add_response_payload),
            );
            ws.write_frame(tracks_add_frame_response).await?;

            // send playlists
            let playlist_collection = db.collection::<WavesPlaylist>("playlist");
            let playlist_cursor = playlist_collection
                .find(
                    doc! { "idp": "google", "idpId": google_payload.sub.clone() },
                    None,
                )
                .await?;
            let playlists: Vec<WavesPlaylist> = playlist_cursor.try_collect().await?;
            let playlists_update_response = WavesPlaylistsUpdateResponse {
                message_type: WavesMessageType::PlaylistsUpdate,
                data: playlists,
            };
            let playlists_update_response_payload = to_vec(&playlists_update_response)?;
            let playlists_update_frame_response = Frame::new(
                true,
                OpCode::Text,
                None,
                Payload::from(playlists_update_response_payload),
            );
            ws.write_frame(playlists_update_frame_response).await?;

            // return user
            let user2 = WavesUser {
                idp: "google".to_string(),
                idp_id: google_payload.sub.clone(),
                name: google_payload.name.clone(),
                email: google_payload.email.clone(),
            };
            return Ok(Some(user2));
        }
        invalid => return Err(WavesError::InvalidAuthMessageType(invalid).into()),
    }
}

async fn get_waves_message(
    ws: &mut FragmentCollector<TokioIo<Upgraded>>,
) -> Result<Option<WavesMessage>> {
    let frame = ws.read_frame().await?;
    match frame.opcode {
        OpCode::Text => {
            let frame_payload_vec = frame.payload.to_vec();
            let frame_payload_slice: &[u8] = &frame_payload_vec;
            let message: WavesMessage = from_slice(frame_payload_slice)?;
            return Ok(Some(message));
        }
        OpCode::Close => {
            return Ok(None);
        }
        _ => {
            error!("unhandled opcode type={:?}", frame.opcode);
            ws.write_frame(Frame::close_raw(vec![].into())).await?;
            return Ok(None);
        }
    }
}

async fn handle_waves_message(
    ws: &mut FragmentCollector<TokioIo<Upgraded>>,
    auth_client: &Arc<AsyncClient>,
    message: WavesMessage,
) -> Result<()> {
    match message.message_type {
        WavesMessageType::AccountLogin => {
            let account_login_message: WavesMessageAccountLogin = from_value(message.data)?;
            let google_payload = auth_client
                .validate_id_token(account_login_message.token)
                .await?;
            let user = WavesUser {
                idp: "google".to_string(),
                idp_id: google_payload.sub,
                name: google_payload.name,
                email: google_payload.email,
            };
            let user_response = WavesUserResponse {
                message_type: message.message_type,
                req_id: message.req_id,
                data: user,
            };
            let user_response_payload = to_vec(&user_response)?;
            let frame_response = Frame::new(
                true,
                OpCode::Text,
                None,
                Payload::from(user_response_payload),
            );
            ws.write_frame(frame_response).await?;
        }
        invalid => return Err(WavesError::InvalidMessageType(invalid).into()),
    }
    Ok(())
}
