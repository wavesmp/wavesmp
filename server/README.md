# waves-server-rust

Websocket server for the Waves client

# Configuring the Server

- Rename `config.example.json` as `config.json`
- Substitute Google client id in the config.json

# Development

Work in progress

## Environment Variables

The environment variables should be available in the development environment:

`DATABSE_URL` - This can match the database url in the `config.json`
`RUST_LOG` - This can be set to `info`, for example, to configure the logging

## Running the Server

```
cargo run
```

## Running the Tests

```
cargo test
```

## Running the Tests with Code Coverage

```
cargo llvm-cov --fail-under-lines 70 --ignore-filename-regex main.rs
```

## Formatting the Code

```
cargo fmt
```

## Linting the Code

```
cargo clippy
```

## Building a Static Binary

```
cargo build --release --target=x86_64-unknown-linux-musl
```

## Building the Image

After building the static binary, run the following

```
docker build -t waves-server-rust .
```

## Publishing the Image

```
docker tag waves-server-rust osoriano/waves-server-rust
docker push osoriano/waves-server-rust
```
