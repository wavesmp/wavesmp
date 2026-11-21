FROM rust:1.100-alpine3.24 AS build

# Install system dependencies
RUN apk add --no-cache curl musl-dev

# Install rust build dependencies
RUN cargo install cargo-llvm-cov --locked && \
  rustup component add clippy rustfmt

# Install rust application and test dependencies
WORKDIR /app
COPY Cargo.lock Cargo.toml ./
COPY hack/empty-src ./src
RUN cargo test --no-run

# Build the rust project
# todo could potentially use more caching
COPY migrations ./migrations
COPY src ./src
COPY tests ./tests
RUN DATABASE_URL="mysql://root:root@mysql.mysql/waves" \
  cargo build --release

# Unit test
FROM build AS test-results
RUN export DATABASE_URL="mysql://root:root@mysql.mysql/waves" && \
  cargo clippy -- -Dwarnings && \
  cargo fmt --check && \
  cargo llvm-cov --fail-under-lines 70 --ignore-filename-regex main.rs && \
  cd /app/target/llvm-cov-target/debug/deps && \
  INTEGRATION_TEST_BINARY="$(find . -name 'integration_test-*' -executable)" && \
  mv "${INTEGRATION_TEST_BINARY}" integration_test

# Integration Test
FROM scratch AS integration-test
COPY --from=test-results /app/target/llvm-cov-target/debug/deps/integration_test /integration_test
USER 1000
CMD ["/integration_test"]

# Project image
FROM scratch
COPY --from=build /app/target/release/waves-server-rust /
USER 1000
CMD ["/waves-server-rust"]
