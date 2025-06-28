use anyhow::Result;
use futures::try_join;
use std::env;
use tokio::sync::watch;
use tokio::sync::watch::Receiver;
use tokio::sync::watch::Sender;
use waves_server_rust::start_server;

mod http_tests;
mod port_utils;
mod ws_tests;

const TEST_HOST_ENV_VAR: &str = "WAVESMP_TEST_HOST";

struct TestContext {
    test_host: String,
    tx_shutdown: Option<Sender<bool>>,
}

#[tokio::test]
async fn test_waves_server() -> Result<()> {
    // Test Setup
    let test_context = if let Ok(test_host) = env::var(TEST_HOST_ENV_VAR) {
        println!("Starting integration test using host: {}", test_host);
        TestContext {
            test_host,
            tx_shutdown: None,
        }
    } else {
        println!("Setting up local server for integration test");
        let (tx_shutdown, rx_shutdown) = watch::channel(false);
        start_server_in_background(rx_shutdown);
        TestContext {
            test_host: "localhost".to_owned(),
            tx_shutdown: Some(tx_shutdown),
        }
    };

    // Run Tests
    let http_test_future = http_tests::test_http(&test_context.test_host);
    let ws_test_future = ws_tests::test_ws(&test_context.test_host);
    try_join!(http_test_future, ws_test_future)?;

    // Test Cleanup
    if let Some(tx_shutdown) = test_context.tx_shutdown {
        tx_shutdown.send(true).unwrap();
    }

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
