use crate::config::parse_config;
use crate::database::get_waves_database;
use anyhow::Result;
use google_oauth::AsyncClient;
use tokio::sync::watch::Receiver;

mod config;
pub mod database;
mod http_server;
pub mod server;
pub mod ws_server;

pub async fn start_server(rx_shutdown: Receiver<bool>) -> Result<()> {
    env_logger::init();

    let config = parse_config()?;

    let db = get_waves_database(&config.db).await?;
    let auth_client = AsyncClient::new_with_vec(&config.auth.google.client_ids);

    server::serve(rx_shutdown, &config.address, auth_client, db).await
}
