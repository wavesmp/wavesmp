use crate::config::parse_config;
use crate::database::get_waves_database;
use crate::http_server::start_http_server;
use crate::ws_server::start_ws_server;
use anyhow::Result;
use futures::try_join;
use google_oauth::AsyncClient;
use tokio::sync::watch::Receiver;

mod config;
pub mod database;
mod http_server;
pub mod ws_server;

pub async fn start_server(rx_shutdown: Receiver<bool>) -> Result<()> {
    env_logger::init();

    let config = parse_config()?;

    let mut http_rx_shutdown = rx_shutdown.clone();
    let http_server_future = start_http_server(&mut http_rx_shutdown, &config.addresses.http);

    let db = get_waves_database(&config.db).await?;
    let auth_client = AsyncClient::new_with_vec(&config.auth.google.client_ids);
    let mut ws_rx_shutdown = rx_shutdown.clone();
    let ws_server_future =
        start_ws_server(&mut ws_rx_shutdown, &config.addresses.ws, auth_client, db);

    try_join!(http_server_future, ws_server_future)?;
    Ok(())
}
