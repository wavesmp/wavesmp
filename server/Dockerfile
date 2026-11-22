FROM rust:1.100-alpine3.24 AS build
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache jq musl-dev

# Install rust build dependencies
RUN cargo install cargo-llvm-cov --locked && \
  rustup component add clippy rustfmt

# Build the rust project
COPY Cargo.lock Cargo.toml ./
COPY migrations ./migrations
COPY src ./src
COPY tests ./tests

RUN --mount=type=cache,target=/usr/local/cargo/registry \
  --mount=type=cache,target=/usr/local/cargo/git \
  --mount=type=cache,id=wavesmp-server-target,sharing=locked,target=/app/target \
  DATABASE_URL="mysql://root:root@mysql.mysql/waves" \
  cargo build --release && \
  cp /app/target/release/waves-server-rust /app/waves-server-rust

# Unit test
FROM build AS test-results
RUN --mount=type=cache,target=/usr/local/cargo/registry \
  --mount=type=cache,target=/usr/local/cargo/git \
  --mount=type=cache,id=wavesmp-server-target,sharing=locked,target=/app/target \
  export DATABASE_URL="mysql://root:root@mysql.mysql/waves" && \
  cargo fmt --check && \
  cargo clippy --all-targets -- -Dwarnings && \
  cargo llvm-cov --fail-under-lines 70 --ignore-filename-regex main.rs && \
  cargo test --no-run --test integration_test --message-format=json > /tmp/integration-test-build.json && \
  INTEGRATION_TEST_BINARY="$(jq -r 'select(.reason == "compiler-artifact" and .target.name == "integration_test" and .executable != null) | .executable' /tmp/integration-test-build.json)" && \
  echo "integration test binaries: ${INTEGRATION_TEST_BINARY:-<none>}" && \
  [ "$(printf '%s\n' "${INTEGRATION_TEST_BINARY}" | grep -c .)" -eq 1 ] && \
  cp "${INTEGRATION_TEST_BINARY}" /app/integration_test

# Integration Test
FROM scratch AS integration-test
COPY --from=test-results /app/integration_test /integration_test
USER 1000
CMD ["/integration_test"]

# Project image
FROM scratch
COPY --from=build /app/waves-server-rust /
USER 1000
CMD ["/waves-server-rust"]
