use crate::config::WavesServerConfigDB;
use anyhow::Result;
use mongodb::{options::ClientOptions, Client, Database};

pub async fn get_waves_database(config: WavesServerConfigDB) -> Result<Database> {
    // Parse a connection string into an options struct.
    let mut client_options = ClientOptions::parse(config.url).await?;

    // Manually set an option.
    client_options.app_name = Some("My Rust App".to_string());

    // Get a handle to the deployment.
    let client = Client::with_options(client_options)?;

    // Get a handle to a database.
    let db = client.database("waves");
    Ok(db)
}
