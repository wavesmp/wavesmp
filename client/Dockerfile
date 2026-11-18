# Build the production assets
FROM node:20 AS build

WORKDIR /home/node
ENV CI=true

# todo should first just copy deps
COPY . .
RUN --mount=type=cache,target=/root/.npm \
  npm ci

# Build the production assets
RUN npm run build

# Run unit tests
FROM build AS test-results
RUN npm run test && \
  npm run eslint && \
  npm run prettiercheck

# Build the Integration Tests
FROM ubuntu:24.04 AS integration-test
RUN apt-get update && \
  apt-get -y install curl && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists /var/cache/apt/archives
WORKDIR /root
COPY tests .
CMD [ "./integration-test.sh" ]

FROM nginx:1.25.5-bookworm
LABEL org.opencontainers.image.source=https://github.com/wavesmp/wavesmp
EXPOSE 80

COPY --from=build /home/node/packages/waves-client-web/build/* /srv/http/
COPY --from=build /home/node/packages/waves-client-web/rootfs/etc/nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /home/node/packages/waves-client-web/rootfs/etc/nginx/sites/waves /etc/nginx/sites/waves
