use crate::database::types::WavesTrackDB;
use crate::database::types::WavesUserDB;
use crate::database::Database;
use crate::ws_server::waves_message_types::WavesError;
use crate::ws_server::waves_message_types::WavesMessage;
use crate::ws_server::waves_message_types::WavesMessageAccount;
use crate::ws_server::waves_message_types::WavesMessageAccountIDP;
use crate::ws_server::waves_message_types::WavesMessageError;
use crate::ws_server::waves_message_types::WavesMessagePlaylistCopy;
use crate::ws_server::waves_message_types::WavesMessagePlaylistReorder;
use crate::ws_server::waves_message_types::WavesMessageTracksInfoUpdate;
use crate::ws_server::waves_message_types::WavesMessageTracksRemove;
use crate::ws_server::waves_message_types::WavesMessageType;
use crate::ws_server::waves_message_types::WavesPlaylistExternal;
use crate::ws_server::waves_message_types::WavesTrackExternal;
use crate::ws_server::waves_message_types::WavesUserExternal;
use anyhow::Error;
use anyhow::Result;
use fastwebsockets::FragmentCollector;
use fastwebsockets::Frame;
use fastwebsockets::OpCode;
use fastwebsockets::Payload;
use google_oauth::AsyncClient;
use hyper::upgrade::Upgraded;
use hyper_util::rt::TokioIo;
use log::error;
use log::info;
use serde::Deserialize;
use serde_json::de::from_slice;
use serde_json::to_value;
use serde_json::to_vec;
use serde_json::Value;

// todo set up ping/pong
pub async fn handle_waves_messages(
    ws: &mut FragmentCollector<TokioIo<Upgraded>>,
    auth_client: &AsyncClient,
    db: &Database,
) -> Result<()> {
    let mut user: Option<WavesUserDB> = None;
    while let Some(message) = get_waves_message(ws).await? {
        if let Err(e) = handle_waves_message(ws, auth_client, db, &mut user, &message).await {
            error!("failed to handle ws message: {:?}", e);

            if let Err(send_error) = send_error_message(ws, &message, e).await {
                error!("failed to send error message: {:?}", send_error);
            }
        }
    }
    Ok(())
}

async fn send_error_message(
    ws: &mut FragmentCollector<TokioIo<Upgraded>>,
    source_message: &WavesMessage,
    err: Error,
) -> Result<()> {
    let data = WavesMessageError {
        err: format!("error handling message: {:?}", err),
    };
    let message = WavesMessage {
        message_type: source_message.message_type.clone(),
        data: to_value(data)?,
        req_id: source_message.req_id,
    };
    send_waves_message(ws, &message).await
}

async fn handle_waves_message(
    ws: &mut FragmentCollector<TokioIo<Upgraded>>,
    auth_client: &AsyncClient,
    db: &Database,
    user: &mut Option<WavesUserDB>,
    message: &WavesMessage,
) -> Result<()> {
    match &message.message_type {
        WavesMessageType::Account => {
            let account_message = WavesMessageAccount::deserialize(&message.data)?;
            let auth_user = handle_auth_login(auth_client, &account_message).await?;
            let db_user = db.get_user(&auth_user.idp, &auth_user.idp_id).await?;
            let external_user = db_user.map(WavesUserExternal::from);
            let external_user_response = WavesMessage {
                message_type: message.message_type.clone(),
                data: to_value(&external_user)?,
                req_id: message.req_id,
            };
            send_waves_message(ws, &external_user_response).await?;
            Ok(())
        }
        WavesMessageType::AccountDelete => {
            let account_message = WavesMessageAccount::deserialize(&message.data)?;
            let auth_user = handle_auth_login(auth_client, &account_message).await?;
            db.delete_user(&auth_user.idp, &auth_user.idp_id).await?;

            let delete_response = WavesMessage {
                message_type: message.message_type.clone(),
                data: Value::Null,
                req_id: message.req_id,
            };
            send_waves_message(ws, &delete_response).await?;
            Ok(())
        }
        WavesMessageType::AccountLogin => {
            // authenticate
            let account_login_message = WavesMessageAccount::deserialize(&message.data)?;
            let auth_user = handle_auth_login(auth_client, &account_login_message).await?;
            let auth_user = user.insert(auth_user);
            db.create_or_update_user(auth_user).await?;
            info!("got login for auth_user={}", &auth_user.idp_id);
            let external_user = WavesUserExternal {
                idp_id: auth_user.idp_id.clone(),
                name: auth_user.name.clone(),
                email: auth_user.email.clone(),
            };
            let user_response = WavesMessage {
                message_type: message.message_type.clone(),
                data: to_value(&external_user)?,
                req_id: message.req_id,
            };
            send_waves_message(ws, &user_response).await?;

            // send track add (library)
            let tracks: Vec<WavesTrackExternal> = db
                .get_tracks(&auth_user.idp, &auth_user.idp_id)
                .await?
                .into_iter()
                .map(WavesTrackExternal::from)
                .collect();
            let tracks_add_response = WavesMessage {
                message_type: WavesMessageType::TracksAdd,
                data: to_value(&tracks)?,
                req_id: None,
            };
            send_waves_message(ws, &tracks_add_response).await?;

            // send playlists
            let playlists: Vec<WavesPlaylistExternal> = db
                .get_playlists(&auth_user.idp, &auth_user.idp_id)
                .await?
                .into_iter()
                .map(WavesPlaylistExternal::from)
                .collect();
            let playlists_update_response = WavesMessage {
                message_type: WavesMessageType::PlaylistsUpdate,
                data: to_value(&playlists)?,
                req_id: None,
            };
            send_waves_message(ws, &playlists_update_response).await?;

            // send server version
            let server_version_response = WavesMessage {
                message_type: WavesMessageType::Version,
                data: "1.0.52".into(),
                req_id: None,
            };
            send_waves_message(ws, &server_version_response).await?;

            Ok(())
        }
        WavesMessageType::TracksAdd => {
            let auth_user = user.as_ref().ok_or(WavesError::Unauthorized)?;
            let tracks = Vec::<WavesTrackExternal>::deserialize(&message.data)?
                .into_iter()
                .map(|t| WavesTrackDB {
                    uid: t.uid,
                    idp: auth_user.idp.clone(),
                    idp_id: auth_user.idp_id.clone(),
                    source: t.source,
                    title: t.title,
                    artist: t.artist,
                    genre: t.genre,
                    duration: t.duration,
                })
                .collect();
            db.insert_tracks(tracks).await?;
            let tracks_add_response = WavesMessage {
                message_type: message.message_type.clone(),
                data: Value::Null,
                req_id: message.req_id,
            };
            send_waves_message(ws, &tracks_add_response).await?;
            Ok(())
        }
        WavesMessageType::TracksInfoUpdate => {
            let auth_user = user.as_ref().ok_or(WavesError::Unauthorized)?;
            let update_info = WavesMessageTracksInfoUpdate::deserialize(&message.data)?;
            db.update_track(
                &auth_user.idp,
                &auth_user.idp_id,
                &update_info.uid,
                &update_info.key,
                &update_info.value,
            )
            .await?;
            let update_info_response = WavesMessage {
                message_type: message.message_type.clone(),
                data: Value::Null,
                req_id: message.req_id,
            };
            send_waves_message(ws, &update_info_response).await?;
            Ok(())
        }
        WavesMessageType::TracksDelete => {
            let auth_user = user.as_ref().ok_or(WavesError::Unauthorized)?;
            let track_uids: Vec<String> = Vec::<String>::deserialize(&message.data)?;
            db.delete_tracks(&auth_user.idp, &auth_user.idp_id, &track_uids)
                .await?;
            let tracks_delete_response = WavesMessage {
                message_type: message.message_type.clone(),
                data: Value::Null,
                req_id: message.req_id,
            };
            send_waves_message(ws, &tracks_delete_response).await?;
            Ok(())
        }
        WavesMessageType::PlaylistAdd => {
            let auth_user = user.as_ref().ok_or(WavesError::Unauthorized)?;
            let playlist: WavesPlaylistExternal =
                WavesPlaylistExternal::deserialize(&message.data)?;
            db.create_or_update_playlist(
                &auth_user.idp,
                &auth_user.idp_id,
                &playlist.name,
                &playlist.tracks,
            )
            .await?;
            let playlist_add_response = WavesMessage {
                message_type: message.message_type.clone(),
                data: Value::Null,
                req_id: message.req_id,
            };
            send_waves_message(ws, &playlist_add_response).await?;
            Ok(())
        }
        WavesMessageType::PlaylistCopy => {
            let auth_user = user.as_ref().ok_or(WavesError::Unauthorized)?;
            let playlist_copy_data: WavesMessagePlaylistCopy =
                WavesMessagePlaylistCopy::deserialize(&message.data)?;
            let src = playlist_copy_data.src;
            let dest = playlist_copy_data.dest;
            db.copy_playlist(&auth_user.idp, &auth_user.idp_id, &src, &dest)
                .await?;
            let playlist_copy_response = WavesMessage {
                message_type: message.message_type.clone(),
                data: Value::Null,
                req_id: message.req_id,
            };
            send_waves_message(ws, &playlist_copy_response).await?;
            Ok(())
        }
        WavesMessageType::PlaylistMove => {
            let auth_user = user.as_ref().ok_or(WavesError::Unauthorized)?;
            let playlist_move_data: WavesMessagePlaylistCopy =
                WavesMessagePlaylistCopy::deserialize(&message.data)?;
            let src = playlist_move_data.src;
            let dest = playlist_move_data.dest;
            db.move_playlist(&auth_user.idp, &auth_user.idp_id, &src, &dest)
                .await?;
            let playlist_move_response = WavesMessage {
                message_type: message.message_type.clone(),
                data: Value::Null,
                req_id: message.req_id,
            };
            send_waves_message(ws, &playlist_move_response).await?;
            Ok(())
        }
        WavesMessageType::TracksRemove => {
            let auth_user = user.as_ref().ok_or(WavesError::Unauthorized)?;
            let tracks_remove_data: WavesMessageTracksRemove =
                WavesMessageTracksRemove::deserialize(&message.data)?;
            let playlist_name = tracks_remove_data.playlist_name;
            let selection = tracks_remove_data.selection;
            db.remove_from_playlist(
                &auth_user.idp,
                &auth_user.idp_id,
                &playlist_name,
                &selection,
            )
            .await?;
            let tracks_remove_response = WavesMessage {
                message_type: message.message_type.clone(),
                data: Value::Null,
                req_id: message.req_id,
            };
            send_waves_message(ws, &tracks_remove_response).await?;
            Ok(())
        }
        WavesMessageType::PlaylistReorder => {
            let auth_user = user.as_ref().ok_or(WavesError::Unauthorized)?;
            let playlist_reorder_data: WavesMessagePlaylistReorder =
                WavesMessagePlaylistReorder::deserialize(&message.data)?;
            let playlist_name = playlist_reorder_data.playlist_name;
            let selection = playlist_reorder_data.selection;
            let insert_at = playlist_reorder_data.insert_at;
            db.reorder_playlist(
                &auth_user.idp,
                &auth_user.idp_id,
                &playlist_name,
                &selection,
                &insert_at,
            )
            .await?;
            let playlist_reorder_response = WavesMessage {
                message_type: message.message_type.clone(),
                data: Value::Null,
                req_id: message.req_id,
            };
            send_waves_message(ws, &playlist_reorder_response).await?;
            Ok(())
        }
        WavesMessageType::PlaylistDelete => {
            let auth_user = user.as_ref().ok_or(WavesError::Unauthorized)?;
            let playlist_name: String = String::deserialize(&message.data)?;
            db.delete_playlist(&auth_user.idp, &auth_user.idp_id, &playlist_name)
                .await?;
            let playlist_delete_response = WavesMessage {
                message_type: message.message_type.clone(),
                data: Value::Null,
                req_id: message.req_id,
            };
            send_waves_message(ws, &playlist_delete_response).await?;
            Ok(())
        }
        invalid => Err(WavesError::InvalidMessageType(invalid.clone()).into()),
    }
}

async fn handle_auth_login(
    auth_client: &AsyncClient,
    account_login_message: &WavesMessageAccount,
) -> Result<WavesUserDB> {
    match account_login_message.idp {
        WavesMessageAccountIDP::Google => {
            let google_payload = auth_client
                .validate_id_token(&account_login_message.token)
                .await?;
            let user = WavesUserDB {
                idp: "google".to_string(),
                idp_id: google_payload.sub,
                name: google_payload.name,
                email: google_payload.email,
            };
            Ok(user)
        }
        WavesMessageAccountIDP::Testing => {
            let user = WavesUserDB {
                idp: format!("{:?}", WavesMessageAccountIDP::Testing),
                idp_id: "test_idp_id".to_owned(),
                name: Some("test_name".to_owned()),
                email: Some("test_email@wavesmusicplayer.com".to_owned()),
            };
            Ok(user)
        }
    }
}

pub async fn send_waves_message(
    ws: &mut FragmentCollector<TokioIo<Upgraded>>,
    message: &WavesMessage,
) -> Result<()> {
    let message_payload = to_vec(message)?;
    let message_frame = Frame::new(true, OpCode::Text, None, Payload::from(message_payload));
    ws.write_frame(message_frame).await?;
    Ok(())
}

pub async fn get_waves_message(
    ws: &mut FragmentCollector<TokioIo<Upgraded>>,
) -> Result<Option<WavesMessage>> {
    let frame = ws.read_frame().await?;
    match frame.opcode {
        OpCode::Text => {
            let frame_payload_vec = frame.payload.to_vec();
            let frame_payload_slice: &[u8] = &frame_payload_vec;
            let message: WavesMessage = from_slice(frame_payload_slice)?;
            Ok(Some(message))
        }
        OpCode::Close => Ok(None),
        invalid => Err(WavesError::InvalidMessageOpCode(invalid).into()),
    }
}
