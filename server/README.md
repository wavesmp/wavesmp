# waves-server-rust

Websocket server for the Waves client

# Configuring the Server

- Rename `src/config/config.example.json` as `src/config/config.json`
- Substitute Google client id in the `config.json`
- Update the MySQL url if needed

## Environment Variables

The environment variables should be available in the development environment:

`DATABASE_URL` - This can match the database url in the `config.json`. It is
used by sqlx to check queries at compile time. Without it, set
`SQLX_OFFLINE=true` to use the committed query metadata in `.sqlx/` instead
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

The image builds with `SQLX_OFFLINE=true`, so no database is needed at build
time. Queries are checked against the metadata committed in `.sqlx/`. After
adding or changing a query, regenerate it with a reachable database:

```
cargo install sqlx-cli --version '~0.7' --no-default-features --features mysql,rustls
cargo sqlx prepare -- --all-targets
```

The Dockerfile uses BuildKit cache mounts for the cargo registry and `target/`.

When running the images, options like `--network host` may be needed depending
on the database url in the `config.json`

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
