# waves-server-rust

Websocket server for the Waves client

# Configuring the Server

- Rename `config.example.json` as `config.json`
- Substitute Google client id in the config.json

# Building the Image

```
export DATABASE_URL=<data-base-url>
cargo build --release --target=x86_64-unknown-linux-musl
docker build -t waves-server-rust
```
