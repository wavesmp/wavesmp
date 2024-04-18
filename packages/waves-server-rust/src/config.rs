use anyhow::Result;
use log::{debug, info};
use serde::{Deserialize, Serialize};
use std::fs::File;
use std::io::BufReader;

const CONFIG_FILE_PATH: &str = "config.json";

#[derive(Serialize, Deserialize)]
pub struct WavesServerConfig {
    pub ports: WavesServerConfigPorts,
    pub auth: WavesServerConfigAuth,
    pub db: WavesServerConfigDB,
}

#[derive(Serialize, Deserialize)]
pub struct WavesServerConfigPorts {
    pub ws: u16,
    pub http: u16,
}

#[derive(Serialize, Deserialize)]
pub struct WavesServerConfigAuth {
    pub google: WavesServerConfigAuthGoogle,
}

#[derive(Serialize, Deserialize)]
pub struct WavesServerConfigAuthGoogle {
    pub client_ids: Vec<String>,
}

#[derive(Serialize, Deserialize)]
pub struct WavesServerConfigDB {
    pub url: String,
}

pub fn parse_config_file() -> Result<WavesServerConfig> {
    info!("loading CONFIG_FILE_PATH={}", CONFIG_FILE_PATH);

    let config_file = File::open(CONFIG_FILE_PATH)?;
    let config_file_reader = BufReader::new(config_file);
    let config: WavesServerConfig = serde_json::from_reader(config_file_reader)?;

    debug!("config dump");
    debug!("  ports: ws={} http={}", config.ports.ws, config.ports.http);
    debug!(
        "  auth: google_client_ids={:#?}",
        config.auth.google.client_ids
    );
    debug!("  db: url={}", config.db.url);

    return Ok(config);
}
