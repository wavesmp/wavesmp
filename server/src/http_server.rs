use anyhow::Context;
use anyhow::Result;
use http_body_util::BodyExt;
use http_body_util::Empty;
use hyper::body::Body;
use hyper::body::Bytes;
use hyper::body::Incoming;
use hyper::Method;
use hyper::Request;
use hyper::Response;
use hyper::StatusCode;
use log::error;
use log::warn;
use std::str::from_utf8;

const MAX_BODY_SIZE: u64 = 64 * 1024;

// This is our service handler. It receives a Request, routes on its
// path, and returns a Future of a Response.
pub(crate) async fn handle_http_request(req: Request<Incoming>) -> Result<Response<Empty<Bytes>>> {
    fn create_response(status_code: StatusCode) -> Result<Response<Empty<Bytes>>> {
        Ok(Response::builder()
            .status(status_code)
            .body(Empty::new())
            .expect("failed to build http response"))
    }

    let method = req.method();
    let path = req.uri().path();

    match (method, path) {
        (&Method::POST, "/csp") => {
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
