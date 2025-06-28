use crate::port_utils::wait_for_port;
use anyhow::Result;
use http_body_util::Empty;
use hyper::body::Bytes;
use hyper::client::conn::http1::SendRequest;
use hyper::Method;
use hyper::Request;
use hyper::StatusCode;
use hyper_util::rt::TokioIo;
use tokio::net::TcpStream;

const HTTP_PORT: u16 = 16245;

pub async fn test_http(test_host: &str) -> Result<()> {
    wait_for_port(test_host, HTTP_PORT).await?;

    let mut http_sender = get_http_sender(test_host).await?;
    test_invalid_http_path(&mut http_sender).await?;
    test_invalid_http_method(&mut http_sender).await?;
    test_valid_http(&mut http_sender).await
}

async fn test_invalid_http_path(http_sender: &mut SendRequest<Empty<Bytes>>) -> Result<()> {
    let url = "/foo".parse::<hyper::Uri>()?;

    let req = Request::builder()
        .uri(url)
        .method(Method::POST)
        .body(Empty::<Bytes>::new())?;

    let res = http_sender.send_request(req).await?;
    assert_eq!(StatusCode::NOT_FOUND, res.status());
    Ok(())
}

async fn test_invalid_http_method(http_sender: &mut SendRequest<Empty<Bytes>>) -> Result<()> {
    let url = "/csp-rust".parse::<hyper::Uri>()?;

    let req = Request::builder()
        .uri(url)
        .method(Method::GET)
        .body(Empty::<Bytes>::new())?;

    let res = http_sender.send_request(req).await?;
    assert_eq!(StatusCode::NOT_FOUND, res.status());
    Ok(())
}

async fn test_valid_http(http_sender: &mut SendRequest<Empty<Bytes>>) -> Result<()> {
    let url = "/csp-rust".parse::<hyper::Uri>()?;

    let req = Request::builder()
        .uri(url)
        .method(Method::POST)
        .body(Empty::<Bytes>::new())?;

    let res = http_sender.send_request(req).await?;
    assert_eq!(StatusCode::OK, res.status());
    Ok(())
}

async fn get_http_sender(test_host: &str) -> Result<SendRequest<Empty<Bytes>>> {
    // Open a TCP connection to the remote host
    let stream = TcpStream::connect((test_host, HTTP_PORT)).await?;

    // Use an adapter to access something implementing `tokio::io` traits as if they implement
    // `hyper::rt` IO traits.
    let io = TokioIo::new(stream);

    // Create the Hyper client
    let (sender, conn) = hyper::client::conn::http1::handshake(io).await?;

    // Spawn a task to poll the connection, driving the HTTP state
    tokio::task::spawn(async move {
        if let Err(err) = conn.await {
            println!("connection failed: {:?}", err);
        }
    });
    Ok(sender)
}
