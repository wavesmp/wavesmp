FROM rust:1.87-alpine3.22 AS build
RUN apk add --no-cache curl musl-dev
WORKDIR /app
COPY Cargo.lock Cargo.toml ./
COPY hack/empty-src ./src
RUN cargo build --release
COPY . .
RUN DATABASE_URL="mysql://root:root@mysql.mysql/waves" \
  cargo build --release

FROM build as test
RUN rust_host="$(rustc -vV | grep '^host:' | cut -d' ' -f2)" && \
  curl --proto '=https' --tlsv1.2 -fsSL \
    "https://github.com/taiki-e/cargo-llvm-cov/releases/latest/download/cargo-llvm-cov-${rust_host}.tar.gz" \
  | tar xzf - -C /usr/local/bin && \
  rustup component add clippy rustfmt
RUN export DATABASE_URL="mysql://root:root@mysql.mysql/waves" && \
  cargo clippy -- -Dwarnings && \
  cargo fmt --check && \
  cargo llvm-cov --fail-under-lines 70 --ignore-filename-regex main.rs && \
  cd /app/target/llvm-cov-target/debug/deps && \
  INTEGRATION_TEST_BINARY="$(find . -name 'integration_test-*' -executable)" && \
  mv "${INTEGRATION_TEST_BINARY}" integration_test

FROM scratch as integration-test
COPY --from=test /app/target/llvm-cov-target/debug/deps/integration_test /integration_test
USER 1000
CMD ["/integration_test"]

FROM scratch
COPY --from=build /app/target/release/waves-server-rust /
USER 1000
CMD ["/waves-server-rust"]
