# waves-server-rust

Websocket server for the Waves client

# Configuring the Server

- Rename `src/config/config.example.json` as `src/config/config.json`
- Substitute Google client id in the `config.json`
- Update the MySQL url if needed

## Environment Variables

The environment variables should be available in the development environment:

`DATABSE_URL` - This can match the database url in the `config.json`
`RUST_LOG` - This can be set to `info`, for example, to configure the logging

# Local Development

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
cargo clippy -- -Dwarnings
```

## Building a Static Binary

```
cargo build --release --target=x86_64-unknown-linux-musl
```

# Docker Development

Depending on the `DATABASE_URL`, options like `--network host` or exposing
ports may be needed. Also, currently the `DATABASE_URL` should be updated
in the Dockerfile as well

## Building the Image

```
docker build -t waves-server-rust .
```

## Running the image

```
docker run --rm -it -e RUST_LOG="${RUST_LOG}" -v ./src/config/config.json:/src/config/config.json waves-server-rust
```

## Building the Integration Test

```
docker build -t waves-server-rust-integration-test --target integration-test .
```

## Running the Integration Test

```
docker run --rm -it -e RUST_LOG="${RUST_LOG}" -v ./src/config/config.json:/src/config/config.json waves-server-rust-integration-test
```
