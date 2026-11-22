use crate::database::Database;
use crate::ws_server::waves_message_handler::handle_waves_messages;
use crate::ws_server::waves_message_handler::send_waves_message;
use crate::ws_server::waves_message_types::WavesMessage;
use crate::ws_server::waves_message_types::WavesMessageError;
use crate::ws_server::waves_message_types::WavesMessageType;
use anyhow::Error;
use anyhow::Result;
use fastwebsockets::FragmentCollector;
use fastwebsockets::Frame;
use fastwebsockets::upgrade::UpgradeFut;
use fastwebsockets::upgrade::upgrade;
use google_oauth::AsyncClient;
use http_body_util::Empty;
use hyper::Request;
use hyper::Response;
use hyper::StatusCode;
use hyper::body::Bytes;
use hyper::body::Incoming;
use hyper::upgrade::Upgraded;
use hyper_util::rt::TokioIo;
use log::error;
use log::info;
use serde_json::to_value;

pub mod waves_message_handler;
pub mod waves_message_types;

/// Upgrades the request to a websocket connection and spawns a task to handle
/// the waves messages. Returns the response to complete the upgrade handshake
pub(crate) fn upgrade_ws_connection(
    req: &mut Request<Incoming>,
    auth_client: AsyncClient,
    db: Database,
) -> Result<Response<Empty<Bytes>>> {
    let (response, fut) = match upgrade(req) {
        Err(err) => {
            error!("failed to upgrade connection: {:?}", err);
            return Ok(Response::builder()
                .status(StatusCode::BAD_REQUEST)
                .body(Empty::new())
                .expect("failed to build http response"));
        }
        Ok((response, fut)) => (response, fut),
    };

    tokio::spawn(async move {
        match handle_ws_connection(fut, auth_client, db).await {
            Ok(()) => {
                info!("finished handling websocket connection")
            }
            Err(err) => {
                error!("failed to handle websocket connection: {:?}", err);
            }
        };
    });

    Ok(response)
}

async fn handle_ws_connection(
    fut: UpgradeFut,
    auth_client: AsyncClient,
    db: Database,
) -> Result<()> {
    let ws = fut.await?;
    let mut ws = FragmentCollector::new(ws);

    if let Err(e) = handle_waves_messages(&mut ws, &auth_client, &db).await {
        error!("failed to handle ws messages: {:?}", e);

        if let Err(send_error) = send_error_message(&mut ws, e).await {
            error!("failed to send error message: {:?}", send_error);
        }

        if let Err(close_error) = close_ws_connection(&mut ws).await {
            error!("failed to close connection gracefully: {:?}", close_error);
        }
    }
    Ok(())
}

async fn send_error_message(
    ws: &mut FragmentCollector<TokioIo<Upgraded>>,
    err: Error,
) -> Result<()> {
    let data = WavesMessageError {
        err: format!("error handling messages: {:?}", err),
    };
    let message = WavesMessage {
        message_type: WavesMessageType::Error,
        data: to_value(data)?,
        req_id: None,
    };
    send_waves_message(ws, &message).await
}

pub async fn close_ws_connection(ws: &mut FragmentCollector<TokioIo<Upgraded>>) -> Result<()> {
    ws.write_frame(Frame::close(1000, &[])).await?;
    Ok(())
}
