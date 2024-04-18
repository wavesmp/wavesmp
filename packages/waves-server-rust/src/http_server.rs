use anyhow::{Context, Result};
use http_body_util::{BodyExt, Empty};
use hyper::body::{Body, Bytes};
use hyper::server::conn::http1;
use hyper::service::service_fn;
use hyper::{body::Incoming, Method, Request, Response, StatusCode};
use hyper_util::rt::TokioIo;
use log::{error, info, warn};
use std::net::SocketAddr;
use std::str::from_utf8;
use tokio::net::TcpListener;

const MAX_BODY_SIZE: u64 = 64 * 1024;

pub async fn start_http_server(port: u16) -> Result<()> {
    info!("starting http server on port={}", port);
    let addr = SocketAddr::from(([127, 0, 0, 1], port));
    let listener = TcpListener::bind(addr).await?;

    // We start a loop to continuously accept incoming connections
    loop {
        let (stream, _) = listener.accept().await?;

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
}

// This is our service handler. It receives a Request, routes on its
// path, and returns a Future of a Response.
async fn handle_http_request(req: Request<Incoming>) -> Result<Response<Empty<Bytes>>> {
    fn create_response(status_code: StatusCode) -> Result<Response<Empty<Bytes>>> {
        return Ok(Response::builder()
            .status(status_code)
            .body(Empty::new())
            .expect("failed to build http response"));
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

            warn!("received csp violation={}", whole_body_string);

            return create_response(StatusCode::OK);
        }
        _ => {
            error!("endpoint not found for method={} path={}", method, path);
            return create_response(StatusCode::NOT_FOUND);
        }
    }
}
