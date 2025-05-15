use anyhow::Context;
use anyhow::Result;
use http_body_util::BodyExt;
use http_body_util::Empty;
use hyper::body::Body;
use hyper::body::Bytes;
use hyper::body::Incoming;
use hyper::server::conn::http1;
use hyper::service::service_fn;
use hyper::Method;
use hyper::Request;
use hyper::Response;
use hyper::StatusCode;
use hyper_util::rt::TokioIo;
use log::error;
use log::info;
use log::warn;
use std::net::SocketAddr;
use std::str::from_utf8;
use tokio::net::TcpListener;
use tokio::sync::watch::Receiver;

const MAX_BODY_SIZE: u64 = 64 * 1024;

pub async fn start_http_server(
    rx_shutdown: &mut Receiver<bool>,
    address: &SocketAddr,
) -> Result<()> {
    info!("starting http server on address={}", address);
    let listener = TcpListener::bind(&address).await?;

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

                tokio::task::spawn(async move {
                    if let Err(err) = http1::Builder::new()
                        .serve_connection(io, service_fn(handle_http_request))
                        .await
                    {
                        error!("Error serving connection: {:?}", err);
                    }
                });
            }
            _ = rx_shutdown.changed() => {
                info!("shutting down http server on address={}", address);
                return Ok(());
            }
        }
    }
}

// This is our service handler. It receives a Request, routes on its
// path, and returns a Future of a Response.
async fn handle_http_request(req: Request<Incoming>) -> Result<Response<Empty<Bytes>>> {
    fn create_response(status_code: StatusCode) -> Result<Response<Empty<Bytes>>> {
        Ok(Response::builder()
            .status(status_code)
            .body(Empty::new())
            .expect("failed to build http response"))
    }

    let method = req.method();
    let path = req.uri().path();

    match (method, path) {
        (&Method::POST, "/csp-rust") => {
            // To protect our server, reject requests with large bodies
            let body_size_upper = req.body().size_hint().upper().unwrap_or(u64::MAX);
            if body_size_upper > MAX_BODY_SIZE {
                error!("received csp violation with large size={}", body_size_upper);
                return create_response(StatusCode::PAYLOAD_TOO_LARGE);
            }

            let whole_body_collected = req.collect().await?;
            let whole_body_bytes = whole_body_collected.to_bytes();
            let whole_body_string = from_utf8(&whole_body_bytes)
                .context("received csp violation with invalid string")?;

            warn!("received csp violation={}", &whole_body_string);

            create_response(StatusCode::OK)
        }
        _ => {
            error!("endpoint not found for method={} path={}", method, path);
            create_response(StatusCode::NOT_FOUND)
        }
    }
}
