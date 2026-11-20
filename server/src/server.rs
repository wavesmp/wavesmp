use crate::database::Database;
use crate::http_server::handle_http_request;
use crate::ws_server::upgrade_ws_connection;
use anyhow::Result;
use fastwebsockets::upgrade::is_upgrade_request;
use google_oauth::AsyncClient;
use http_body_util::Empty;
use hyper::body::Bytes;
use hyper::body::Incoming;
use hyper::server::conn::http1;
use hyper::service::Service;
use hyper::Request;
use hyper::Response;
use hyper_util::rt::TokioIo;
use log::error;
use log::info;
use std::future::Future;
use std::net::SocketAddr;
use std::pin::Pin;
use tokio::net::TcpListener;
use tokio::sync::watch::Receiver;

pub const WS_PATH: &str = "/ws";

pub async fn serve(
    mut rx_shutdown: Receiver<bool>,
    address: &SocketAddr,
    auth_client: AsyncClient,
    db: Database,
) -> Result<()> {
    info!("starting server on address={}", address);
    let listener = TcpListener::bind(address).await?;
    let waves_service = WavesService { auth_client, db };

    loop {
        tokio::select! {
            accept_result = listener.accept() => {
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
                info!("shutting down server on address={}", address);
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
        if req.uri().path() == WS_PATH && is_upgrade_request(&req) {
            let response =
                upgrade_ws_connection(&mut req, self.auth_client.clone(), self.db.clone());
            return Box::pin(async { response });
        }

        Box::pin(handle_http_request(req))
    }
}
