use crate::database::Database;
use crate::ws_server::waves_message_handler::handle_waves_messages;
use crate::ws_server::waves_message_handler::send_waves_message;
use crate::ws_server::waves_message_types::WavesMessage;
use crate::ws_server::waves_message_types::WavesMessageError;
use crate::ws_server::waves_message_types::WavesMessageType;
use anyhow::Error;
use anyhow::Result;
use fastwebsockets::upgrade::upgrade;
use fastwebsockets::upgrade::UpgradeFut;
use fastwebsockets::FragmentCollector;
use fastwebsockets::Frame;
use google_oauth::AsyncClient;
use http_body_util::Empty;
use hyper::body::Bytes;
use hyper::body::Incoming;
use hyper::server::conn::http1;
use hyper::service::Service;
use hyper::upgrade::Upgraded;
use hyper::Request;
use hyper::Response;
use hyper::StatusCode;
use hyper_util::rt::TokioIo;
use log::error;
use log::info;
use serde_json::to_value;
use std::future::Future;
use std::net::SocketAddr;
use std::pin::Pin;
use tokio::net::TcpListener;
use tokio::sync::watch::Receiver;

pub mod waves_message_handler;
pub mod waves_message_types;

pub async fn start_ws_server(
    rx_shutdown: &mut Receiver<bool>,
    address: &SocketAddr,
    auth_client: AsyncClient,
    db: Database,
) -> Result<()> {
    info!("starting ws server on address={}", address);
    let listener = TcpListener::bind(address).await?;

    let waves_service = WavesService { auth_client, db };

    // We start a loop to continuously accept incoming connections
    loop {
        let listener_accept_fut = listener.accept();
        tokio::pin!(listener_accept_fut);

        tokio::select! {
            accept_result = &mut listener_accept_fut => {
                let (stream, _) = accept_result?;

                // Use an adapter to access something implementing `tokio::io` traits as if they implement
                // `hyper::rt` IO traits.
                let io = TokioIo::new(stream);
                let waves_service_clone = waves_service.clone();

                tokio::task::spawn(async move {
                    if let Err(err) = http1::Builder::new()
                        .serve_connection(io, waves_service_clone)
                        .with_upgrades()
                        .await
                    {
                        error!("Error serving connection: {:?}", err);
                    }
                });

            }
            _ = rx_shutdown.changed() => {
                info!("shutting down ws server on address={}", address);
                return Ok(());
            }
        }
    }
}

#[derive(Clone)]
struct WavesService {
    auth_client: AsyncClient,
    db: Database,
}

impl Service<Request<Incoming>> for WavesService {
    type Response = Response<Empty<Bytes>>;
    type Error = anyhow::Error;
    type Future = Pin<Box<dyn Future<Output = Result<Self::Response, Self::Error>> + Send>>;

    fn call(&self, mut req: Request<Incoming>) -> Self::Future {
        fn create_response(status_code: StatusCode) -> Result<Response<Empty<Bytes>>> {
            Ok(Response::builder()
                .status(status_code)
                .body(Empty::new())
                .expect("failed to build http response"))
        }

        let (response, fut) = match upgrade(&mut req) {
            Err(err) => {
                error!("failed to upgrade connection: {:?}", err);
                return Box::pin(async { create_response(StatusCode::INTERNAL_SERVER_ERROR) });
            }
            Ok((response, fut)) => (response, fut),
        };

        let auth_client = self.auth_client.clone();
        let db = self.db.clone();
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

        Box::pin(async { Ok(response) })
    }
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
