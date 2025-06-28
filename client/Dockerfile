FROM node:20 AS build

WORKDIR /home/node
COPY . .
RUN npm ci
RUN npm run build

FROM build as test
RUN npm run test && \
  npm run eslint && \
  npm run prettiercheck

# Build the Integration Tests for the Go application
FROM ubuntu:24.04 as integration-test
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
