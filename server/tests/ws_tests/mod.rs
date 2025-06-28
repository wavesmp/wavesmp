use crate::port_utils::wait_for_port;
use anyhow::Result;
use fastwebsockets::FragmentCollector;
use fastwebsockets::Frame;
use fastwebsockets::OpCode;
use fastwebsockets::Payload;
use futures::try_join;
use http_body_util::Empty;
use hyper::body::Bytes;
use hyper::header::CONNECTION;
use hyper::header::UPGRADE;
use hyper::upgrade::Upgraded;
use hyper::Request;
use hyper_util::rt::TokioIo;
use serde_json::from_value;
use serde_json::json;
use serde_json::to_value;
use serde_json::to_vec;
use serde_json::Value;
use std::future::Future;
use tokio::net::TcpStream;
use waves_server_rust::ws_server::close_ws_connection;
use waves_server_rust::ws_server::waves_message_handler::get_waves_message;
use waves_server_rust::ws_server::waves_message_handler::send_waves_message;
use waves_server_rust::ws_server::waves_message_handler::SERVER_VERSION;
use waves_server_rust::ws_server::waves_message_types::WavesMessage;
use waves_server_rust::ws_server::waves_message_types::WavesMessageAccount;
use waves_server_rust::ws_server::waves_message_types::WavesMessageAccountIDP;
use waves_server_rust::ws_server::waves_message_types::WavesMessageError;
use waves_server_rust::ws_server::waves_message_types::WavesMessagePlaylistCopy;
use waves_server_rust::ws_server::waves_message_types::WavesMessagePlaylistReorder;
use waves_server_rust::ws_server::waves_message_types::WavesMessageTracksInfoUpdate;
use waves_server_rust::ws_server::waves_message_types::WavesMessageTracksRemove;
use waves_server_rust::ws_server::waves_message_types::WavesMessageType;
use waves_server_rust::ws_server::waves_message_types::WavesPlaylistExternal;
use waves_server_rust::ws_server::waves_message_types::WavesTrackExternal;
use waves_server_rust::ws_server::waves_message_types::WavesUserExternal;

const WS_PORT: u16 = 16244;

const TRACK_UID1: &str = "aaaaaaaaaaaa";
const TRACK_UID2: &str = "bbbbbbbbbbbb";
const TRACK_UID3: &str = "cccccccccccc";

const PLAYLIST_NAME1: &str = "test_playlist1";
const PLAYLIST_NAME2: &str = "test_playlist2";
const PLAYLIST_NAME3: &str = "test_playlist3";

pub async fn test_ws(test_host: &str) -> Result<()> {
    wait_for_port(test_host, WS_PORT).await?;

    let test_binary_message_fut = test_binary_message(test_host);
    let test_user_flow_fut = test_user_flow(test_host);
    let test_unknown_message_type_fut = test_unknown_message_type(test_host);

    try_join!(
        test_binary_message_fut,
        test_user_flow_fut,
        test_unknown_message_type_fut,
    )?;

    Ok(())
}

async fn test_binary_message(test_host: &str) -> Result<()> {
    let mut ws = get_ws_connection(test_host).await?;
    send_binary_message(&mut ws).await?;
    let error_response = get_waves_message(&mut ws)
        .await?
        .expect("exepected error response for binary message");
    assert!(matches!(
        error_response.message_type,
        WavesMessageType::Error,
    ));
    assert!(error_response.req_id.is_none());
    let error_message: WavesMessageError = from_value(error_response.data)?;
    assert_starts_with(
        &error_message.err,
        "error handling messages: invalid message opcode: Binary",
        &format!(
            "unexpected error message for binary message: `{}`",
            &error_message.err
        ),
    );
    let empty_response = get_waves_message(&mut ws).await?;
    assert!(empty_response.is_none());
    Ok(())
}

async fn test_unknown_message_type(test_host: &str) -> Result<()> {
    let mut ws = get_ws_connection(test_host).await?;
    let message = json!({
        "type": "Unknown",
        "data": {
            "test_data_key": "test_data_value",
        },
    });
    send_json_message(&mut ws, &message).await?;

    let error_response = get_waves_message(&mut ws)
        .await?
        .expect("exepected error response for unknown message type");
    assert!(matches!(
        error_response.message_type,
        WavesMessageType::Error,
    ));
    assert!(error_response.req_id.is_none());
    let error_message: WavesMessageError = from_value(error_response.data)?;

    assert_starts_with(
        &error_message.err,
        "error handling messages: unknown variant ",
        &format!(
            "unexpected error message for unknown type: `{}`",
            &error_message.err
        ),
    );
    let empty_response = get_waves_message(&mut ws).await?;
    assert!(empty_response.is_none());
    Ok(())
}

pub async fn test_user_flow(test_host: &str) -> Result<()> {
    let mut ws = get_ws_connection(test_host).await?;

    test_invalid_message_type(&mut ws).await?;
    test_user_does_not_exist(&mut ws).await?;

    test_login(&mut ws).await?;
    test_tracks_add(&mut ws).await?;
    test_tracks_info_update(&mut ws).await?;
    test_playlist_add(&mut ws).await?;
    test_playlist_copy(&mut ws).await?;
    test_playlist_move(&mut ws).await?;
    test_playlist_reorder_tracks(&mut ws).await?;
    test_playlist_remove_tracks(&mut ws).await?;

    close_ws_connection(&mut ws).await?;
    let mut ws = get_ws_connection(test_host).await?;

    test_relogin(&mut ws).await?;
    test_playlist1_delete(&mut ws).await?;
    test_playlist3_delete(&mut ws).await?;
    test_delete_tracks(&mut ws).await?;
    test_delete_user(&mut ws).await?;

    close_ws_connection(&mut ws).await
}

async fn test_invalid_message_type(ws: &mut FragmentCollector<TokioIo<Upgraded>>) -> Result<()> {
    let data = WavesMessageError {
        err: "test_error".to_owned(),
    };
    let message = WavesMessage {
        // currently, it's not valid for the client to send an error
        message_type: WavesMessageType::Error,
        data: to_value(data)?,
        req_id: None,
    };
    send_waves_message(ws, &message).await?;

    let error_response = get_waves_message(ws)
        .await?
        .expect("exepected error response for invalid message type");
    assert!(matches!(
        error_response.message_type,
        WavesMessageType::Error,
    ));
    assert!(error_response.req_id.is_none());
    let error_message: WavesMessageError = from_value(error_response.data)?;
    assert_starts_with(
        &error_message.err,
        "error handling message: invalid message type: Error",
        &format!(
            "unexpected error message for invalid type: `{}`",
            &error_message.err
        ),
    );
    Ok(())
}

async fn test_user_does_not_exist(ws: &mut FragmentCollector<TokioIo<Upgraded>>) -> Result<()> {
    let req_id = Some(1);
    let token = "test_token".to_owned();

    let account_data = WavesMessageAccount {
        token,
        idp: WavesMessageAccountIDP::Testing,
    };

    let account_message = WavesMessage {
        message_type: WavesMessageType::Account,
        data: to_value(account_data)?,
        req_id,
    };

    send_waves_message(ws, &account_message).await?;

    let account_response = get_waves_message(ws)
        .await?
        .expect("expected account response");
    assert!(matches!(
        account_response.message_type,
        // todo enforce comma. May depend on https://github.com/rust-lang/rustfmt/issues/8
        WavesMessageType::Account
    ));

    let account_response_req_id = account_response
        .req_id
        .expect("expected req_id in account response");
    assert_eq!(1, account_response_req_id);
    assert_eq!(Value::Null, account_response.data);
    Ok(())
}

async fn test_login(ws: &mut FragmentCollector<TokioIo<Upgraded>>) -> Result<()> {
    // Login
    let req_id = Some(2);
    let token = "test_token".to_owned();

    let login_data = WavesMessageAccount {
        token,
        idp: WavesMessageAccountIDP::Testing,
    };

    let login_message = WavesMessage {
        message_type: WavesMessageType::AccountLogin,
        data: to_value(login_data)?,
        req_id,
    };

    send_waves_message(ws, &login_message).await?;

    let login_response = get_waves_message(ws)
        .await?
        .expect("unexpected empty login response");
    assert!(matches!(
        login_response.message_type,
        WavesMessageType::AccountLogin
    ));

    let login_response_req_id = login_response
        .req_id
        .expect("expected req_id in login response");
    assert_eq!(2, login_response_req_id);

    let user: WavesUserExternal = from_value(login_response.data)?;
    assert_eq!("test_idp_id", user.idp_id);
    assert_eq!("test_name", user.name.expect("expected test user name"));
    assert_eq!(
        "test_email@wavesmusicplayer.com",
        user.email.expect("expected test email")
    );

    // Expect tracks add response after login
    let tracks_add_response = get_waves_message(ws)
        .await?
        .expect("unexpected empty tracks add response");
    assert!(matches!(
        tracks_add_response.message_type,
        WavesMessageType::TracksAdd
    ));
    assert!(tracks_add_response.req_id.is_none());
    let tracks: Vec<WavesTrackExternal> = from_value(tracks_add_response.data)?;
    assert_eq!(0, tracks.len());

    // Expect playlists update response after login
    let playlists_update_response = get_waves_message(ws)
        .await?
        .expect("unexpected empty playlists update response");
    assert!(playlists_update_response.req_id.is_none());
    let playlists: Vec<WavesPlaylistExternal> = from_value(playlists_update_response.data)?;
    assert_eq!(0, playlists.len());

    // Expect server version response after login
    let server_version_response = get_waves_message(ws)
        .await?
        .expect("unexpected empty server version response");
    assert!(server_version_response.req_id.is_none());
    let server_version: String = from_value(server_version_response.data)?;
    assert_eq!(SERVER_VERSION, server_version);

    Ok(())
}

async fn test_tracks_add(ws: &mut FragmentCollector<TokioIo<Upgraded>>) -> Result<()> {
    // Login
    let req_id = Some(3);

    let tracks = vec![
        WavesTrackExternal {
            uid: TRACK_UID1.to_owned(),
            source: "test_source1".to_owned(),
            title: Some("test_title1".to_owned()),
            artist: Some("test_source1".to_owned()),
            genre: Some("test_genre1".to_owned()),
            duration: 1_f64,
        },
        WavesTrackExternal {
            uid: TRACK_UID2.to_owned(),
            source: "test_source2".to_owned(),
            title: Some("test_title2".to_owned()),
            artist: Some("test_source2".to_owned()),
            genre: Some("test_genre2".to_owned()),
            duration: 2_f64,
        },
        WavesTrackExternal {
            uid: TRACK_UID3.to_owned(),
            source: "test_source3".to_owned(),
            title: Some("test_title3".to_owned()),
            artist: Some("test_source3".to_owned()),
            genre: Some("test_genre3".to_owned()),
            duration: 3_f64,
        },
    ];

    let tracks_add_message = WavesMessage {
        message_type: WavesMessageType::TracksAdd,
        data: to_value(tracks)?,
        req_id,
    };

    send_waves_message(ws, &tracks_add_message).await?;

    let tracks_add_response = get_waves_message(ws)
        .await?
        .expect("unexpected empty tracks add response");
    assert!(matches!(
        tracks_add_response.message_type,
        WavesMessageType::TracksAdd
    ));

    let tracks_add_response_req_id = tracks_add_response
        .req_id
        .expect("expected req_id in tracks add response");
    assert_eq!(3, tracks_add_response_req_id);
    assert_eq!(Value::Null, tracks_add_response.data);

    Ok(())
}

async fn test_tracks_info_update(ws: &mut FragmentCollector<TokioIo<Upgraded>>) -> Result<()> {
    // Login
    let req_id = Some(4);

    let tracks_info_update = WavesMessageTracksInfoUpdate {
        uid: TRACK_UID2.to_owned(),
        key: "title".to_owned(),
        value: "test_updated_title2".to_owned(),
    };

    let tracks_info_update_message = WavesMessage {
        message_type: WavesMessageType::TracksInfoUpdate,
        data: to_value(tracks_info_update)?,
        req_id,
    };

    send_waves_message(ws, &tracks_info_update_message).await?;

    let tracks_info_update_response = get_waves_message(ws)
        .await?
        .expect("unexpected empty tracks info update response");
    assert!(matches!(
        tracks_info_update_response.message_type,
        WavesMessageType::TracksInfoUpdate
    ));

    let tracks_info_update_response_req_id = tracks_info_update_response
        .req_id
        .expect("expected req_id in tracks info update response");
    assert_eq!(4, tracks_info_update_response_req_id);
    assert_eq!(Value::Null, tracks_info_update_response.data);

    Ok(())
}

async fn test_playlist_add(ws: &mut FragmentCollector<TokioIo<Upgraded>>) -> Result<()> {
    let req_id = Some(5);

    let playlist_add_data = WavesPlaylistExternal {
        name: PLAYLIST_NAME1.to_owned(),
        tracks: vec![
            TRACK_UID1.to_owned(),
            TRACK_UID2.to_owned(),
            TRACK_UID3.to_owned(),
        ],
    };

    let playlist_add_message = WavesMessage {
        message_type: WavesMessageType::PlaylistAdd,
        data: to_value(playlist_add_data)?,
        req_id,
    };

    send_waves_message(ws, &playlist_add_message).await?;

    let playlist_add_response = get_waves_message(ws)
        .await?
        .expect("unexpected empty playlist add response");
    assert!(matches!(
        playlist_add_response.message_type,
        WavesMessageType::PlaylistAdd
    ));

    let playlist_add_response_req_id = playlist_add_response
        .req_id
        .expect("expected req_id in playlist add response");
    assert_eq!(5, playlist_add_response_req_id);
    assert_eq!(Value::Null, playlist_add_response.data);

    Ok(())
}

async fn test_playlist_copy(ws: &mut FragmentCollector<TokioIo<Upgraded>>) -> Result<()> {
    let req_id = Some(6);

    let playlist_copy_data = WavesMessagePlaylistCopy {
        src: PLAYLIST_NAME1.to_owned(),
        dest: PLAYLIST_NAME2.to_owned(),
    };

    let playlist_copy_message = WavesMessage {
        message_type: WavesMessageType::PlaylistCopy,
        data: to_value(playlist_copy_data)?,
        req_id,
    };

    send_waves_message(ws, &playlist_copy_message).await?;

    let playlist_copy_response = get_waves_message(ws)
        .await?
        .expect("unexpected empty playlist copy response");
    assert!(matches!(
        playlist_copy_response.message_type,
        WavesMessageType::PlaylistCopy
    ));

    let playlist_copy_response_req_id = playlist_copy_response
        .req_id
        .expect("expected req_id in playlist copy response");
    assert_eq!(6, playlist_copy_response_req_id);
    assert_eq!(Value::Null, playlist_copy_response.data);

    Ok(())
}

async fn test_playlist_move(ws: &mut FragmentCollector<TokioIo<Upgraded>>) -> Result<()> {
    let req_id = Some(7);

    let playlist_move_data = WavesMessagePlaylistCopy {
        src: PLAYLIST_NAME2.to_owned(),
        dest: PLAYLIST_NAME3.to_owned(),
    };

    let playlist_move_message = WavesMessage {
        message_type: WavesMessageType::PlaylistMove,
        data: to_value(playlist_move_data)?,
        req_id,
    };

    send_waves_message(ws, &playlist_move_message).await?;

    let playlist_move_response = get_waves_message(ws)
        .await?
        .expect("unexpected empty playlist move response");
    assert!(matches!(
        playlist_move_response.message_type,
        WavesMessageType::PlaylistMove
    ));

    let playlist_move_response_req_id = playlist_move_response
        .req_id
        .expect("expected req_id in playlist move response");
    assert_eq!(7, playlist_move_response_req_id);
    assert_eq!(Value::Null, playlist_move_response.data);

    Ok(())
}

async fn test_playlist_reorder_tracks(ws: &mut FragmentCollector<TokioIo<Upgraded>>) -> Result<()> {
    let req_id = Some(8);

    let playlist_reorder_data = WavesMessagePlaylistReorder {
        playlist_name: PLAYLIST_NAME3.to_owned(),
        selection: vec![(2, TRACK_UID3.to_owned())],
        insert_at: 0,
    };

    let playlist_reorder_message = WavesMessage {
        message_type: WavesMessageType::PlaylistReorder,
        data: to_value(playlist_reorder_data)?,
        req_id,
    };

    send_waves_message(ws, &playlist_reorder_message).await?;

    let playlist_reorder_response = get_waves_message(ws)
        .await?
        .expect("unexpected empty playlist reorder response");
    assert!(matches!(
        playlist_reorder_response.message_type,
        WavesMessageType::PlaylistReorder
    ));

    let playlist_reorder_response_req_id = playlist_reorder_response
        .req_id
        .expect("expected req_id in playlist reorder response");
    assert_eq!(8, playlist_reorder_response_req_id);
    assert_eq!(Value::Null, playlist_reorder_response.data);

    Ok(())
}

async fn test_playlist_remove_tracks(ws: &mut FragmentCollector<TokioIo<Upgraded>>) -> Result<()> {
    let req_id = Some(9);

    let tracks_remove_data = WavesMessageTracksRemove {
        playlist_name: PLAYLIST_NAME3.to_owned(),
        selection: vec![(1, TRACK_UID1.to_owned())],
    };

    let tracks_remove_message = WavesMessage {
        message_type: WavesMessageType::TracksRemove,
        data: to_value(tracks_remove_data)?,
        req_id,
    };

    send_waves_message(ws, &tracks_remove_message).await?;

    let tracks_remove_response = get_waves_message(ws)
        .await?
        .expect("unexpected empty tracks remove response");
    assert!(matches!(
        tracks_remove_response.message_type,
        WavesMessageType::TracksRemove
    ));

    let tracks_remove_response_req_id = tracks_remove_response
        .req_id
        .expect("expected req_id in tracks remove response");
    assert_eq!(9, tracks_remove_response_req_id);
    assert_eq!(Value::Null, tracks_remove_response.data);

    Ok(())
}

async fn test_relogin(ws: &mut FragmentCollector<TokioIo<Upgraded>>) -> Result<()> {
    let req_id = Some(90);
    let token = "test_token".to_owned();

    let login_data = WavesMessageAccount {
        token,
        idp: WavesMessageAccountIDP::Testing,
    };

    let login_message = WavesMessage {
        message_type: WavesMessageType::AccountLogin,
        data: to_value(login_data)?,
        req_id,
    };

    send_waves_message(ws, &login_message).await?;

    let login_response = get_waves_message(ws)
        .await?
        .expect("unexpected empty relogin response");
    assert!(matches!(
        login_response.message_type,
        WavesMessageType::AccountLogin
    ));

    let login_response_req_id = login_response
        .req_id
        .expect("expected req_id in relogin response");
    assert_eq!(90, login_response_req_id);

    let user: WavesUserExternal = from_value(login_response.data)?;
    assert_eq!("test_idp_id", user.idp_id);
    assert_eq!(
        "test_name",
        user.name.expect("expected test user name in relogin")
    );
    assert_eq!(
        "test_email@wavesmusicplayer.com",
        user.email.expect("expected test email in relogin")
    );

    // Expect tracks add response after login
    let tracks_add_response = get_waves_message(ws)
        .await?
        .expect("unexpected empty tracks add response in relogin");
    assert!(matches!(
        tracks_add_response.message_type,
        WavesMessageType::TracksAdd
    ));
    assert!(tracks_add_response.req_id.is_none());
    let tracks: Vec<WavesTrackExternal> = from_value(tracks_add_response.data)?;
    assert_eq!(3, tracks.len());

    assert_eq!(TRACK_UID1, tracks[0].uid);
    assert_eq!(
        "test_title1",
        tracks[0]
            .title
            .as_ref()
            .expect("expected track 1 to have a title")
    );

    assert_eq!(TRACK_UID2, tracks[1].uid);
    assert_eq!(
        "test_updated_title2",
        tracks[1]
            .title
            .as_ref()
            .expect("expected track 2 to have a title")
    );

    assert_eq!(TRACK_UID3, tracks[2].uid);
    assert_eq!(
        "test_title3",
        tracks[2]
            .title
            .as_ref()
            .expect("expected track 3 to have a title")
    );

    // Expect playlists update response after login
    let playlists_update_response = get_waves_message(ws)
        .await?
        .expect("unexpected empty playlists update response in relogin");
    assert!(playlists_update_response.req_id.is_none());
    let playlists: Vec<WavesPlaylistExternal> = from_value(playlists_update_response.data)?;
    assert_eq!(2, playlists.len());

    assert_eq!(PLAYLIST_NAME1, playlists[0].name);
    assert_eq!(3, playlists[0].tracks.len());
    assert_eq!(TRACK_UID1, playlists[0].tracks[0]);
    assert_eq!(TRACK_UID2, playlists[0].tracks[1]);
    assert_eq!(TRACK_UID3, playlists[0].tracks[2]);

    assert_eq!(PLAYLIST_NAME3, playlists[1].name);
    assert_eq!(2, playlists[1].tracks.len());
    assert_eq!(TRACK_UID3, playlists[1].tracks[0]);
    assert_eq!(TRACK_UID2, playlists[1].tracks[1]);

    // Expect server version response after login
    let server_version_response = get_waves_message(ws)
        .await?
        .expect("unexpected empty server version response");
    assert!(server_version_response.req_id.is_none());
    let server_version: String = from_value(server_version_response.data)?;
    assert_eq!(SERVER_VERSION, server_version);

    Ok(())
}

async fn test_playlist1_delete(ws: &mut FragmentCollector<TokioIo<Upgraded>>) -> Result<()> {
    let req_id = Some(97);

    let playlist_name = PLAYLIST_NAME1.to_owned();

    let playlist_delete_message = WavesMessage {
        message_type: WavesMessageType::PlaylistDelete,
        data: to_value(playlist_name)?,
        req_id,
    };

    send_waves_message(ws, &playlist_delete_message).await?;

    let playlist_delete_response = get_waves_message(ws)
        .await?
        .expect("unexpected empty playlist delete response");
    assert!(matches!(
        playlist_delete_response.message_type,
        WavesMessageType::PlaylistDelete
    ));

    let playlist_delete_response_req_id = playlist_delete_response
        .req_id
        .expect("expected req_id in playlist delete response");
    assert_eq!(97, playlist_delete_response_req_id);
    assert_eq!(Value::Null, playlist_delete_response.data);

    Ok(())
}

async fn test_playlist3_delete(ws: &mut FragmentCollector<TokioIo<Upgraded>>) -> Result<()> {
    let req_id = Some(98);

    let playlist_name = PLAYLIST_NAME3.to_owned();

    let playlist_delete_message = WavesMessage {
        message_type: WavesMessageType::PlaylistDelete,
        data: to_value(playlist_name)?,
        req_id,
    };

    send_waves_message(ws, &playlist_delete_message).await?;

    let playlist_delete_response = get_waves_message(ws)
        .await?
        .expect("unexpected empty playlist delete response");
    assert!(matches!(
        playlist_delete_response.message_type,
        WavesMessageType::PlaylistDelete
    ));

    let playlist_delete_response_req_id = playlist_delete_response
        .req_id
        .expect("expected req_id in playlist delete response");
    assert_eq!(98, playlist_delete_response_req_id);
    assert_eq!(Value::Null, playlist_delete_response.data);

    Ok(())
}

async fn test_delete_tracks(ws: &mut FragmentCollector<TokioIo<Upgraded>>) -> Result<()> {
    let req_id = Some(99);
    let track_uids = [
        TRACK_UID1.to_owned(),
        TRACK_UID2.to_owned(),
        TRACK_UID3.to_owned(),
    ];

    let delete_message = WavesMessage {
        message_type: WavesMessageType::TracksDelete,
        data: to_value(track_uids)?,
        req_id,
    };

    send_waves_message(ws, &delete_message).await?;

    let delete_response = get_waves_message(ws)
        .await?
        .expect("expected tracks delete response");
    assert!(matches!(
        delete_response.message_type,
        WavesMessageType::TracksDelete,
    ));

    let delete_response_req_id = delete_response
        .req_id
        .expect("expected req_id in tracks delete response");
    assert_eq!(99, delete_response_req_id);
    assert_eq!(Value::Null, delete_response.data);
    Ok(())
}

async fn test_delete_user(ws: &mut FragmentCollector<TokioIo<Upgraded>>) -> Result<()> {
    let req_id = Some(100);
    let token = "test_token".to_owned();

    let account_data = WavesMessageAccount {
        token,
        idp: WavesMessageAccountIDP::Testing,
    };

    let delete_message = WavesMessage {
        message_type: WavesMessageType::AccountDelete,
        data: to_value(account_data)?,
        req_id,
    };

    send_waves_message(ws, &delete_message).await?;

    let delete_response = get_waves_message(ws)
        .await?
        .expect("expected account delete response");
    assert!(matches!(
        delete_response.message_type,
        WavesMessageType::AccountDelete,
    ));

    let delete_response_req_id = delete_response
        .req_id
        .expect("expected req_id in account delete response");
    assert_eq!(100, delete_response_req_id);
    assert_eq!(Value::Null, delete_response.data);
    Ok(())
}

async fn get_ws_connection(test_host: &str) -> Result<FragmentCollector<TokioIo<Upgraded>>> {
    // Open a TCP connection to the remote host
    let stream = TcpStream::connect((test_host, WS_PORT)).await?;

    let req = Request::builder()
        .method("GET")
        .uri(format!("http://{}:{}", test_host, WS_PORT))
        .header("Host", format!("{}:{}", test_host, WS_PORT))
        .header(UPGRADE, "websocket")
        .header(CONNECTION, "upgrade")
        .header(
            "Sec-WebSocket-Key",
            fastwebsockets::handshake::generate_key(),
        )
        .header("Sec-WebSocket-Version", "13")
        .body(Empty::<Bytes>::new())?;

    let (ws, _) = fastwebsockets::handshake::client(&SpawnExecutor, req, stream).await?;
    Ok(FragmentCollector::new(ws))
}

async fn send_json_message(
    ws: &mut FragmentCollector<TokioIo<Upgraded>>,
    message: &Value,
) -> Result<()> {
    let message_payload = to_vec(message)?;
    let message_frame = Frame::new(true, OpCode::Text, None, Payload::from(message_payload));
    ws.write_frame(message_frame).await?;
    Ok(())
}

async fn send_binary_message(ws: &mut FragmentCollector<TokioIo<Upgraded>>) -> Result<()> {
    let message_payload: &[u8] = &[0, 1, 2, 3];
    let message_frame = Frame::new(true, OpCode::Binary, None, Payload::from(message_payload));
    ws.write_frame(message_frame).await?;
    Ok(())
}

struct SpawnExecutor;

impl<Fut> hyper::rt::Executor<Fut> for SpawnExecutor
where
    Fut: Future + Send + 'static,
    Fut::Output: Send + 'static,
{
    fn execute(&self, fut: Fut) {
        tokio::task::spawn(fut);
    }
}

fn assert_starts_with(s: &str, p: &str, message: &str) {
    assert!(s.starts_with(p), "{}", message);
}
