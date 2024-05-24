use anyhow::Result;
use futures::try_join;
use tokio::sync::watch;
use tokio::sync::watch::Receiver;
use waves_server_rust::start_server;

mod http_tests;
mod port_utils;
mod ws_tests;

#[tokio::test]
async fn test_waves_server() -> Result<()> {
    let (tx_shutdown, rx_shutdown) = watch::channel(false);
    start_server_in_background(rx_shutdown);

    let http_test_future = http_tests::test_http();
    let ws_test_future = ws_tests::test_ws();

    try_join!(http_test_future, ws_test_future)?;

    tx_shutdown.send(true).unwrap();
    Ok(())
}

fn start_server_in_background(rx_shutdown: Receiver<bool>) {
    tokio::spawn(async move {
        println!("Starting waves server");
        if let Err(e) = start_server(rx_shutdown).await {
            println!("Error starting waves server: {:?}", e);
        }
        println!("Ending waves server");
    });
}
