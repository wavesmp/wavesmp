# waves-server-rust

Websocket server for the Waves client

# Configuring the Server

- Rename `config.example.json` as `config.json`
- Substitute Google client id in the config.json

# Development

First, stop the local environment if it's running. Run this
from the root of the repo.

```
docker compose down
```

The modify a few files:
- Update the `compose.yaml` at the root to comment out the `waves-server-rust`
  service. Also, expose the `waves-server-sql` port on `127.0.0.1:3306`.
- Update the file `packages/waves-client-web/rootfs/etc/nginx/sites/waves`.
  Replace `waves-server-rust` with the docker network gateway ip: `192.168.32.1`
- Update the `config.json`. Change the `addresses` to use the docker network
  gateway IP: `192.168.32.1`. Also, update the database url to use localhost:
  `127.0.0.1`

Finally, restart the local environment:

```
docker compose up
```

Then, follow the commands below for starting and testing the rust server.

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
