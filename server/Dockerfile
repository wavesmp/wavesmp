# syntax=docker/dockerfile:1

FROM rust:1.87-alpine3.22 AS base

# Install system dependencies
RUN apk add --no-cache musl-dev

WORKDIR /app

# Use the committed .sqlx query metadata instead of a live database.
# Regenerate it with `cargo sqlx prepare -- --all-targets` after changing queries
ENV SQLX_OFFLINE=true

# Build the rust project
# The cargo registry and target dir are BuildKit cache mounts, so dependencies
# and incremental artifacts are reused across builds. The binary is copied out
# of the cache mount since mount contents are not part of the layer
FROM base AS build
COPY . .
RUN --mount=type=cache,target=/usr/local/cargo/registry \
  --mount=type=cache,target=/usr/local/cargo/git \
  --mount=type=cache,target=/app/target,sharing=locked \
  cargo build --release --locked && \
  cp target/release/waves-server-rust /waves-server-rust

# Install test tooling (kept out of the release build path)
FROM base AS test-tools
ARG CARGO_LLVM_COV_VERSION=0.9.2
RUN apk add --no-cache curl && \
  rustup component add clippy rustfmt llvm-tools-preview && \
  rust_host="$(rustc -vV | sed -n 's/^host: //p')" && \
  curl --proto '=https' --tlsv1.2 -fsSL \
    "https://github.com/taiki-e/cargo-llvm-cov/releases/download/v${CARGO_LLVM_COV_VERSION}/cargo-llvm-cov-${rust_host}.tar.gz" \
  | tar xzf - -C /usr/local/bin

# Unit test
# Stale integration_test-<hash> binaries can accumulate in the cached target
# dir, so pick the newest one
FROM test-tools AS test-results
COPY . .
RUN --mount=type=cache,target=/usr/local/cargo/registry \
  --mount=type=cache,target=/usr/local/cargo/git \
  --mount=type=cache,target=/app/target,sharing=locked \
  cargo fmt --check && \
  cargo clippy --locked --all-targets -- -Dwarnings && \
  cargo llvm-cov --locked --fail-under-lines 70 --ignore-filename-regex main.rs && \
  cp "$(ls -t $(find target/llvm-cov-target/debug/deps -type f -perm -u+x -name 'integration_test-*') | head -1)" /integration_test

# Integration Test
FROM scratch AS integration-test
COPY --from=test-results /integration_test /integration_test
USER 1000
CMD ["/integration_test"]

# Project image
FROM scratch
COPY --from=build /waves-server-rust /
USER 1000
CMD ["/waves-server-rust"]
