use anyhow::Result;
use log::info;
use tokio::signal;
use tokio::sync::watch;
use waves_server_rust::start_server;

#[tokio::main]
async fn main() -> Result<()> {
    let (tx_shutdown, rx_shutdown) = watch::channel(false);
    let server_future = start_server(rx_shutdown);

    tokio::spawn(async move {
        signal::ctrl_c().await.unwrap();
        info!("got 'ctrl-c' signal. Shutting down...");
        tx_shutdown.send(true).unwrap();
    });

    server_future.await
}
