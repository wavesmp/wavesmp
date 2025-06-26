use anyhow::Result;
use log::info;
use serde::Deserialize;
use serde::Serialize;
use std::fs::File;
use std::io::BufReader;
use std::net::SocketAddr;

const CONFIG_FILE_PATH: &str = "src/config/config.json";

#[derive(Serialize, Deserialize, Debug)]
pub struct WavesServerConfig {
    pub addresses: WavesServerConfigAddresses,
    pub auth: WavesServerConfigAuth,
    pub db: WavesServerConfigDB,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct WavesServerConfigAddresses {
    pub ws: SocketAddr,
    pub http: SocketAddr,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct WavesServerConfigAuth {
    pub google: WavesServerConfigAuthGoogle,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct WavesServerConfigAuthGoogle {
    pub client_ids: Vec<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct WavesServerConfigDB {
    pub url: String,
    pub max_connections: u32,
}

pub fn parse_config() -> Result<WavesServerConfig> {
    info!("loading CONFIG_FILE_PATH={}", CONFIG_FILE_PATH);

    let config_file = File::open(CONFIG_FILE_PATH)?;
    parse_config_file(&config_file)
}

fn parse_config_file(config_file: &File) -> Result<WavesServerConfig> {
    let config_file_reader = BufReader::new(config_file);
    let config: WavesServerConfig = serde_json::from_reader(config_file_reader)?;

    Ok(config)
}

#[cfg(test)]
mod tests {
    use anyhow::Result;
    use std::fs::File;
    use std::io::Seek;
    use std::io::SeekFrom;
    use std::io::Write;
    use tempfile::tempfile;

    #[test]
    fn test_valid_config() -> Result<()> {
        let mut config_file: File = tempfile()?;
        write!(
            config_file,
            "{}",
            r#"{
              "addresses": {
                "ws": "127.0.0.1:1",
                "http": "127.0.0.1:2"
              },
              "auth": {
                "google": {
                  "client_ids": [
                    "test_client_id"
                  ]
                }
              },
              "db": {
                "url": "test_db_url",
                "max_connections": 3
              }
            }"#,
        )?;
        config_file.seek(SeekFrom::Start(0))?;

        let config = super::parse_config_file(&config_file)?;
        assert_eq!("127.0.0.1:1".parse(), Ok(config.addresses.ws));
        assert_eq!("127.0.0.1:2".parse(), Ok(config.addresses.http));
        assert_eq!(vec!("test_client_id"), config.auth.google.client_ids);
        assert_eq!("test_db_url", config.db.url);
        assert_eq!(3_u32, config.db.max_connections);
        Ok(())
    }

    #[test]
    fn test_invalid_config() -> Result<()> {
        let mut config_file: File = tempfile()?;
        write!(config_file, "{}", "{}")?;
        config_file.seek(SeekFrom::Start(0))?;

        let config_err = super::parse_config_file(&config_file).unwrap_err();
        let config_err_string = format!("{:?}", config_err);
        assert!(
            config_err_string.starts_with("missing field "),
            r"config err did not start with `missing field `, value was `{}`",
            config_err_string,
        );
        Ok(())
    }
}
