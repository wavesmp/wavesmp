FROM rust:1.87-alpine3.22 AS build
RUN apk add --no-cache musl-dev
WORKDIR /app
COPY . .
RUN DATABASE_URL=mysql://root:root@mysql.mysql/waves \
  cargo build --release

FROM scratch
COPY --from=build /app/target/release/waves-server-rust /
USER 1000
CMD ["/waves-server-rust"]
