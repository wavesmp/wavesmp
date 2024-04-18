use crate::ws_server::waves_message_handler::handle_waves_messages;
use anyhow::Result;
use fastwebsockets::upgrade::{upgrade, UpgradeFut};
use fastwebsockets::{FragmentCollector, Frame};
use google_oauth::AsyncClient;
use http_body_util::Empty;
use hyper::body::Bytes;
use hyper::server::conn::http1;
use hyper::service::Service;
use hyper::{body::Incoming, Request, Response, StatusCode};
use hyper_util::rt::TokioIo;
use log::{error, info};
use mongodb::Database;
use std::future::Future;
use std::net::SocketAddr;
use std::pin::Pin;
use std::sync::Arc;
use tokio::net::TcpListener;

mod waves_message_handler;
mod waves_message_types;

pub async fn start_ws_server(port: u16, auth_client: AsyncClient, db: Database) -> Result<()> {
    info!("starting ws server on port={}", port);
    // let addr = SocketAddr::from(([127, 0, 0, 1], port));
    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    let listener = TcpListener::bind(addr).await?;

    let waves_service = WavesService {
        auth_client: Arc::new(auth_client),
        db: db,
    };

    // We start a loop to continuously accept incoming connections
    loop {
        let (stream, _) = listener.accept().await?;

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
}

#[derive(Debug, Clone)]
struct WavesService {
    auth_client: Arc<AsyncClient>,
    db: Database,
}

impl Service<Request<Incoming>> for WavesService {
    type Response = Response<Empty<Bytes>>;
    type Error = anyhow::Error;
    type Future = Pin<Box<dyn Future<Output = Result<Self::Response, Self::Error>> + Send>>;

    fn call(&self, mut req: Request<Incoming>) -> Self::Future {
        fn create_response(status_code: StatusCode) -> Result<Response<Empty<Bytes>>> {
            return Ok(Response::builder()
                .status(status_code)
                .body(Empty::new())
                .expect("failed to build http response"));
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

        return Box::pin(async { Ok(response) });
    }
}

async fn handle_ws_connection(
    fut: UpgradeFut,
    auth_client: Arc<AsyncClient>,
    db: Database,
) -> Result<()> {
    let ws = fut.await?;
    let mut ws = FragmentCollector::new(ws);

    match handle_waves_messages(&mut ws, auth_client, db).await {
        Err(e) => {
            error!("failed to handle ws messages: {:?}", e);
            ws.write_frame(Frame::close_raw(vec![].into())).await?;
            return Ok(());
        }
        Ok(()) => {
            return Ok(());
        }
    }
}
