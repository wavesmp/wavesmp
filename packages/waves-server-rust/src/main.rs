use crate::config::parse_config_file;
use crate::database::get_waves_database;
use crate::http_server::start_http_server;
use crate::ws_server::start_ws_server;
use crate::sql::get_sql_database;
use anyhow::Result;
use futures::try_join;
use google_oauth::AsyncClient;
use sqlx::mysql::MySqlPoolOptions;

mod config;
mod database;
mod http_server;
mod ws_server;
mod sql;

#[tokio::main]
async fn main() -> Result<()> {
    env_logger::init();

    let config = parse_config_file()?;

    let http_server_future = start_http_server(config.ports.http);

    let db = get_waves_database(config.db).await?;
    get_sql_database().await?;
    let auth_client = AsyncClient::new_with_vec(config.auth.google.client_ids);
    let ws_server_future = start_ws_server(config.ports.ws, auth_client, db);

    try_join!(http_server_future, ws_server_future)?;
    Ok(())
}
