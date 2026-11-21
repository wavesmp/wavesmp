use anyhow::Context;
use anyhow::Result;
use tokio::net::TcpStream;
use tokio::time;
use tokio::time::Duration;
use tokio::time::sleep;

/// Port serving both http and websocket (at `/ws`) requests
pub const SERVER_PORT: u16 = 16244;

const SLEEP_INTERVAL: Duration = Duration::from_millis(100);
const SERVER_TIMEOUT: Duration = Duration::from_secs(60);

/// waits for the port to listen on localhost,
/// up to a hardcoded timeout
pub async fn wait_for_port(test_host: &str, port: u16) -> Result<()> {
    time::timeout(SERVER_TIMEOUT, _wait_for_port(test_host, port))
        .await
        .context(format!("timed out waiting for port={}", port))
}

async fn _wait_for_port(test_host: &str, port: u16) -> () {
    sleep(SLEEP_INTERVAL).await;
    while TcpStream::connect((test_host, port)).await.is_err() {
        sleep(SLEEP_INTERVAL).await;
    }
}
