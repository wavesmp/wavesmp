use anyhow::Context;
use anyhow::Result;
use std::net::SocketAddr;
use tokio::net::TcpStream;
use tokio::time;
use tokio::time::sleep;
use tokio::time::Duration;

const SLEEP_INTERVAL: Duration = Duration::from_millis(100);
const SERVER_TIMEOUT: Duration = Duration::from_secs(60);

/// waits for the port to listen on localhost,
/// up to a hardcoded timeout
pub async fn wait_for_port(port: u16) -> Result<()> {
    time::timeout(SERVER_TIMEOUT, _wait_for_port(port))
        .await
        .context(format!("timed out waiting for port={}", port))
}

async fn _wait_for_port(port: u16) -> () {
    sleep(SLEEP_INTERVAL).await;
    while TcpStream::connect(get_port_addr(port)).await.is_err() {
        sleep(SLEEP_INTERVAL).await;
    }
}

pub fn get_port_addr(port: u16) -> SocketAddr {
    SocketAddr::from(([127, 0, 0, 1], port))
}
